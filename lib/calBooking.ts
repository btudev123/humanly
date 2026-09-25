import "server-only";
import { getCalApiKey, parseCalLink } from "@/lib/cal";
import { getCalLink, getServiceProduct } from "@/lib/products";
import {
  claimOrderCalBooking,
  getOrderById,
  setOrderCalBooking,
  type OrderRecord,
} from "@/lib/db/repository";

/**
 * Auto-books the slot a visitor picked before paying (ADR-0001 Decision C′, 2026-09-14).
 *
 * The flow: the Dubai-time picker on `/booking` sends `preferredSlot` to checkout → it is stored
 * on `orders.metadata` → once the order is PAID, this module books exactly that slot through
 * Cal.com's v2 bookings API. Cal.com then does everything a booking made in the embed does: the
 * Google Meet link, the event on `hello@talkhumanly.com`'s calendar, and the `BOOKING_CREATED`
 * webhook — which `app/api/webhooks/cal/route.ts` handles unchanged, joined back to the order
 * through `metadata.orderId`, sending the client confirmation and the lead notification.
 *
 * Nothing here runs before payment: the order must be `paid`. The claim in
 * `claimOrderCalBooking` makes it safe to call from both the Stripe webhook and the schedule
 * page, any number of times. When booking is not possible (slot taken, Cal.com down, no API key)
 * the schedule page falls back to the paid Cal embed, so a paying client is never left without a
 * way to book.
 */

const CAL_BOOKINGS_API_VERSION = "2024-08-13";

/** The booking flow's one clock — matches the Cal.com schedule and the on-site picker. */
export const BOOKING_TIME_ZONE = "Asia/Dubai";

/** A `pending` claim older than this is treated as a crashed attempt rather than waited on. */
const STALE_PENDING_MS = 2 * 60 * 1000;

export type CalBookingRecord =
  | { state: "pending"; at: string }
  | { state: "booked"; uid: string; start: string; end: string | null; title: string | null; at: string }
  | { state: "failed"; reason: "unavailable" | "error"; detail?: string; at: string };

export type BookPreferredSlotResult =
  | { status: "booked"; booking: Extract<CalBookingRecord, { state: "booked" }> }
  /** Another request holds the claim and has not finished yet. */
  | { status: "pending" }
  /** Cal.com refused the slot — someone else took it. */
  | { status: "unavailable" }
  /** Anything else went wrong; the embed fallback applies. */
  | { status: "error" }
  /** Nothing to auto-book (no preference, async product, unpaid, past slot, no API key). */
  | { status: "skipped" };

export function readCalBooking(order: Pick<OrderRecord, "metadata"> | null | undefined): CalBookingRecord | null {
  const value = order?.metadata?.calBooking;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.state === "booked" && typeof record.uid === "string" && typeof record.start === "string") {
    return value as CalBookingRecord;
  }
  if (record.state === "pending" || record.state === "failed") return value as CalBookingRecord;
  return null;
}

function resultFromRecord(record: CalBookingRecord): BookPreferredSlotResult {
  if (record.state === "booked") return { status: "booked", booking: record };
  if (record.state === "failed") return { status: record.reason };
  const age = Date.now() - new Date(record.at).getTime();
  return Number.isFinite(age) && age > STALE_PENDING_MS ? { status: "error" } : { status: "pending" };
}

/** Cal.com's error bodies vary by version; this pulls a human-readable message out of any of them. */
function errorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  const message = (body as { message?: unknown }).message;
  return typeof message === "string" ? message : "";
}

// Deliberately narrow: only messages that say the *time* is gone count as "unavailable". A bad
// payload, a booking-limit or buffer rule would otherwise read to the client as "that time was
// just taken" and hide an integration bug behind what looks like healthy demand.
const SLOT_TAKEN_PATTERN =
  /no (available )?(users|hosts?) (are )?available|not available|unavailable|already (has a )?book|slot.{0,30}(taken|booked|not available|unavailable)/i;

export async function bookPreferredSlot(order: OrderRecord | null | undefined): Promise<BookPreferredSlotResult> {
  if (!order || order.kind !== "consultation" || order.status !== "paid") return { status: "skipped" };

  const existing = readCalBooking(order);
  if (existing) return resultFromRecord(existing);

  const product = getServiceProduct(order.product_slug);
  if (!product?.needsScheduling) return { status: "skipped" };

  const rawSlot = order.metadata?.preferredSlot;
  if (typeof rawSlot !== "string") return { status: "skipped" };
  const start = new Date(rawSlot);
  if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) return { status: "skipped" };

  const apiKey = getCalApiKey();
  if (!apiKey) return { status: "skipped" };

  if (!(await claimOrderCalBooking(order.id))) {
    const current = readCalBooking(await getOrderById(order.id));
    return current ? resultFromRecord(current) : { status: "pending" };
  }

  const now = () => new Date().toISOString();

  try {
    const { username, eventTypeSlug } = parseCalLink(getCalLink(product));

    const response = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": CAL_BOOKINGS_API_VERSION,
      },
      body: JSON.stringify({
        start: start.toISOString(),
        eventTypeSlug,
        username,
        attendee: {
          name: order.customer_name,
          email: order.customer_email,
          timeZone: BOOKING_TIME_ZONE,
          language: "en",
        },
        // `orderId` is the join `app/api/webhooks/cal/route.ts` reads to link the booking to the
        // order; `source` matches what the paid embed sends.
        metadata: { orderId: order.id, source: "paid-humanly-site" },
      }),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as { data?: unknown } | null;

    if (!response.ok) {
      const message = errorMessage(body);
      const reason = response.status < 500 && SLOT_TAKEN_PATTERN.test(message) ? "unavailable" : "error";
      console.error("[calBooking] Cal.com refused booking", order.id, response.status, message);
      await setOrderCalBooking(order.id, {
        state: "failed",
        reason,
        detail: `${response.status} ${message}`.slice(0, 300),
        at: now(),
      });
      return { status: reason };
    }

    const data = (Array.isArray(body?.data) ? body?.data[0] : body?.data) as
      | { uid?: unknown; start?: unknown; end?: unknown; title?: unknown }
      | undefined;
    const uid = typeof data?.uid === "string" ? data.uid : null;

    if (!uid) {
      console.error("[calBooking] Cal.com booking response had no uid", order.id);
      await setOrderCalBooking(order.id, { state: "failed", reason: "error", detail: "no uid in response", at: now() });
      return { status: "error" };
    }

    const booking: Extract<CalBookingRecord, { state: "booked" }> = {
      state: "booked",
      uid,
      start: typeof data?.start === "string" ? data.start : start.toISOString(),
      end: typeof data?.end === "string" ? data.end : null,
      title: typeof data?.title === "string" ? data.title : null,
      at: now(),
    };
    await setOrderCalBooking(order.id, booking);
    return { status: "booked", booking };
  } catch (error) {
    console.error("[calBooking] auto-booking failed", order.id, error);
    try {
      await setOrderCalBooking(order.id, { state: "failed", reason: "error", detail: "exception", at: now() });
    } catch {
      // The claim stays `pending` and goes stale after STALE_PENDING_MS — the embed still works.
    }
    return { status: "error" };
  }
}

/**
 * For the schedule page when the other path holds the claim: re-read the order for up to
 * `timeoutMs` until the attempt settles, then report whatever it became.
 *
 * A timeout reports `pending`, NOT `error`: the other attempt may still be mid-flight to Cal.com
 * and succeed seconds later. The caller must treat that as "maybe booked" — never as "safe to
 * offer the same slot again" — or the client can book it a second time through the embed.
 */
export async function waitForCalBooking(orderId: string, timeoutMs = 8000): Promise<BookPreferredSlotResult> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 750));
    const record = readCalBooking(await getOrderById(orderId));
    if (record && record.state !== "pending") return resultFromRecord(record);
  }
  return { status: "pending" };
}

/**
 * Ask Cal.com directly whether this order already has a live booking — the ground truth when our
 * own record can't say (an attempt still in flight, a stale `pending`, or a network error on OUR
 * side after Cal.com had already created the booking; the bookings API takes no idempotency key).
 * Matches on `metadata.orderId`, which both the auto-booking and the paid embed send. When found,
 * the order record is healed to `booked` so every later read agrees.
 */
export async function recoverCalBooking(order: OrderRecord): Promise<BookPreferredSlotResult | null> {
  const apiKey = getCalApiKey();
  if (!apiKey) return null;

  try {
    const url = new URL("https://api.cal.com/v2/bookings");
    url.searchParams.set("attendeeEmail", order.customer_email);
    url.searchParams.set("status", "upcoming");
    url.searchParams.set("take", "50");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}`, "cal-api-version": CAL_BOOKINGS_API_VERSION },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = (await response.json()) as { data?: unknown };
    const bookings = Array.isArray(body?.data) ? (body.data as Record<string, unknown>[]) : [];
    const match = bookings.find((booking) => {
      const metadata = booking.metadata as Record<string, unknown> | null | undefined;
      const status = typeof booking.status === "string" ? booking.status.toLowerCase() : "";
      return metadata?.orderId === order.id && (status === "accepted" || status === "pending");
    });
    if (!match || typeof match.uid !== "string" || typeof match.start !== "string") return null;

    const booking: Extract<CalBookingRecord, { state: "booked" }> = {
      state: "booked",
      uid: match.uid,
      start: match.start,
      end: typeof match.end === "string" ? match.end : null,
      title: typeof match.title === "string" ? match.title : null,
      at: new Date().toISOString(),
    };
    await setOrderCalBooking(order.id, booking);
    return { status: "booked", booking };
  } catch (error) {
    console.error("[calBooking] recovery lookup failed", order.id, error);
    return null;
  }
}
