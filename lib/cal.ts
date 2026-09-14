import "server-only";
import { getCalLink, type ServiceProduct } from "@/lib/products";

/**
 * See `docs/adr/0001-pricing-currency-availability-reviews.md` (Decision C).
 *
 * Read-only wrapper around Cal.com's v2 slots API, used to render a pre-payment availability
 * preview. This module NEVER creates, holds, or cancels a booking — it only reads what times are
 * open. The actual booking flow stays exactly as it is today: the paid, post-checkout `<Cal>` embed
 * in `components/booking/PaidScheduler.tsx`, unchanged by this workstream.
 *
 * `server-only` (already a dependency in `package.json`) enforces this can't be imported into a
 * Client Component by mistake — `CAL_API_KEY` must never reach the browser.
 */

/** One open slot, as Cal.com's v2 API represents it — an ISO 8601 instant. */
export type AvailableSlot = {
  /** ISO 8601 start time, in the timezone requested via `timeZone`. */
  start: string;
};

/**
 * One slot, in either of the two shapes Cal.com's `/slots` endpoint documents.
 *
 * The published schema says the default format is an array of ISO **strings**; the same page's
 * example — and the live API, checked 2026-09-04 — return `[{ start }]` **objects**. Reading both
 * costs three lines and means a future reconciliation of Cal's docs with Cal's code degrades to
 * "still works" instead of an empty preview that looks exactly like "no availability."
 *
 * A value that is a non-empty string but not a parseable date is dropped, not returned. The one
 * consumer (`components/booking/AvailabilityPreview.tsx`) feeds every `start` straight into
 * `new Date(iso)` and `Intl.DateTimeFormat(...).format(...)`, which throws `RangeError: Invalid
 * time value` on an unparseable instant and takes the whole client component — and `/booking`
 * with it — down. Dropping the slot here is what makes this module's fail-closed contract
 * (`getAvailableSlots` below) actually hold for a malformed upstream payload.
 */
function readSlotStart(slot: unknown): string | null {
  const start =
    typeof slot === "string"
      ? slot
      : slot && typeof slot === "object"
        ? (slot as { start?: unknown }).start
        : null;

  if (typeof start !== "string" || !start) return null;
  if (Number.isNaN(new Date(start).getTime())) return null;

  return start;
}

export type GetAvailableSlotsInput = {
  /** The `ServiceProduct` being previewed — its `calLinkEnv` is resolved to a Cal.com
   *  `username/event-slug` pair via `parseCalLink`. */
  product: ServiceProduct;
  /** ISO 8601 date (start of range), inclusive. */
  from: string;
  /** ISO 8601 date (end of range), inclusive. */
  to: string;
  /** IANA timezone, e.g. `"Asia/Dubai"`. Normalised to a fixed-offset bucket by
   *  `normaliseTimeZone` before it reaches Cal.com (and therefore the fetch cache key) — see
   *  that function for why. Returned `start` values are fully-qualified instants regardless. */
  timeZone: string;
  /** Bypass the 60s Data Cache. Only for the checkout-time re-check (`isSlotStillOpen`), where a
   *  stale "still open" answer would send a visitor to pay for a slot someone else just took. */
  fresh?: boolean;
};

/**
 * Split a `calLinkEnv` value (e.g. `"talkhumanly/interview-prep"`, the same string
 * `getCalLink()` in `lib/products.ts` already resolves and passes to the `<Cal>` embed's
 * `calLink` prop) into the `username` and `eventTypeSlug` Cal.com's v2 `/slots` endpoint expects
 * as separate query parameters.
 *
 * Throws (does not silently default) on a value with no `/` — that shape indicates a
 * misconfigured `NEXT_PUBLIC_CAL_LINK_*` env var, which should fail loudly here rather than
 * produce a confusing empty-slots result indistinguishable from "this service has no
 * availability." `getAvailableSlots` is the one place allowed to catch this and degrade to `[]`
 * per its own fail-closed contract, below.
 */
export function parseCalLink(calLinkEnv: string): { username: string; eventTypeSlug: string } {
  const slashIndex = calLinkEnv.indexOf("/");
  if (slashIndex === -1) {
    throw new Error(`Malformed Cal.com link "${calLinkEnv}" — expected "username/event-slug".`);
  }

  const username = calLinkEnv.slice(0, slashIndex);
  const eventTypeSlug = calLinkEnv.slice(slashIndex + 1);
  if (!username || !eventTypeSlug) {
    throw new Error(`Malformed Cal.com link "${calLinkEnv}" — expected "username/event-slug".`);
  }

  return { username, eventTypeSlug };
}

/** Etc/GMT zones only exist for whole hours, from Etc/GMT+12 (UTC-12) to Etc/GMT-14 (UTC+14). */
const MIN_OFFSET_HOURS = -12;
const MAX_OFFSET_HOURS = 14;

/**
 * Current UTC offset of an IANA zone, in minutes east of UTC (`Asia/Dubai` -> 240).
 * Returns `null` for anything `Intl` can't resolve, or on an engine without `longOffset`.
 */
function utcOffsetMinutes(timeZone: string, at: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(at);
    const label = parts.find((part) => part.type === "timeZoneName")?.value;
    if (!label) return null;
    // "GMT" (exactly UTC), "GMT+4", "GMT+04:00", "GMT-03:30".
    const match = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(label);
    if (!match) return null;
    if (!match[1]) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
  } catch {
    return null;
  }
}

/**
 * Collapse a caller-supplied IANA timezone onto one of at most 27 fixed-offset buckets
 * (`Etc/GMT+12` … `Etc/GMT-14`, plus `UTC`).
 *
 * WHY THIS EXISTS — this is a cache-key defence, not a formatting nicety. `timeZone` is passed
 * straight into the upstream URL below, and that URL *is* the Next Data Cache key. `tz` reaches
 * this module from a query parameter on a public, unauthenticated route, so with the raw value
 * a caller could vary it across the ~400 IANA identifiers (times ten service slugs) and miss the
 * 300s cache on every single request — hammering Cal.com with OUR `CAL_API_KEY` until it rate
 * limits, at which point `getAvailableSlots` fails closed and the preview reads as "no
 * availability" sitewide. Normalising here rather than in the route means the bound holds for
 * every caller, present and future, not just the one that remembered.
 *
 * WHY IT IS SAFE — verified live against Cal.com's v2 `/slots` API with this account's key
 * (2026-09-04): `timeZone=Etc/GMT-4` and `timeZone=Asia/Dubai` return byte-identical payloads
 * (`"2026-09-08T09:00:00.000+04:00"`). Cal.com formats `start` with the requested zone's offset,
 * but every value is a fully-qualified instant either way, and the only consumer
 * (`AvailabilityPreview`) re-formats each instant with `Intl` in the visitor's own zone. So the
 * zone we send upstream affects nothing a visitor sees except the exact edges of the 14-day
 * window.
 *
 * Half-hour and 45-minute zones (India, Nepal, Newfoundland, Chatham) round to the nearest hour:
 * `Etc/GMT` has no sub-hour members, and the residue only moves the window boundary by up to 30
 * minutes at each end of a fortnight.
 *
 * Falls back to `"UTC"` — also verified accepted — for anything unresolvable, so a bad zone
 * degrades to a valid request instead of a fail-closed empty preview.
 */
export function normaliseTimeZone(timeZone: string): string {
  const offset = utcOffsetMinutes(timeZone, new Date());
  if (offset === null) return "UTC";

  const hours = Math.min(MAX_OFFSET_HOURS, Math.max(MIN_OFFSET_HOURS, Math.round(offset / 60)));
  if (hours === 0) return "UTC";

  // POSIX sign inversion is intentional and load-bearing: `Etc/GMT-4` IS UTC+4.
  return hours > 0 ? `Etc/GMT-${hours}` : `Etc/GMT+${Math.abs(hours)}`;
}

/**
 * `GET https://api.cal.com/v2/slots?eventTypeSlug=<slug>&username=<user>&start=<from>&end=<to>&timeZone=<tz>`
 * — headers `Authorization: Bearer ${CAL_API_KEY}` and `cal-api-version: 2024-09-04` (both
 * mandatory; Cal.com's v2 API is versioned per-header, not per-URL — see ADR-0001 Decision C for
 * the risk of that header value being deprecated).
 *
 * Cal.com's response shape is `{ status, data: { "YYYY-MM-DD": [{ start: ISO }, ...], ... } }` —
 * this function flattens that into a single chronological `AvailableSlot[]` (dropping the
 * per-date grouping; a caller that wants slots grouped by day groups this array client-side by
 * the date portion of each `start`).
 *
 * Cached 60 seconds (Next's fetch Data Cache — `next: { revalidate: 60 }`, same mechanism
 * already used in `lib/sanity/fetch.ts`). Lowered from 300s on 2026-09-14: the picked slot is now
 * auto-booked after payment (ADR-0001 Decision C′), so a slot taken on Karma's calendar has to
 * drop out of the picker within a minute, not five. The timezone bucketing below still bounds the
 * cache key space. `fresh: true` skips the cache entirely.
 *
 * FAIL-CLOSED CONTRACT: returns `[]` on every failure mode — missing/invalid `CAL_API_KEY`,
 * network error, non-200 response, malformed JSON, an `eventTypeSlug`/`username` Cal.com doesn't
 * recognise, or a `calLinkEnv` `parseCalLink` can't parse. Never throws past this function's own
 * boundary. This is deliberate (see ADR-0001 Decision C consequences) — a broken preview must
 * never look like a broken *booking* flow, since the real booking flow does not depend on this
 * module at all.
 */
export async function getAvailableSlots(input: GetAvailableSlotsInput): Promise<AvailableSlot[]> {
  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) return [];

  try {
    const { username, eventTypeSlug } = parseCalLink(getCalLink(input.product));

    const url = new URL("https://api.cal.com/v2/slots");
    url.searchParams.set("eventTypeSlug", eventTypeSlug);
    url.searchParams.set("username", username);
    url.searchParams.set("start", input.from);
    url.searchParams.set("end", input.to);
    // Bucketed, never the raw caller value — this string is part of the Data Cache key.
    url.searchParams.set("timeZone", normaliseTimeZone(input.timeZone));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-09-04",
      },
      ...(input.fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    });

    if (!response.ok) return [];

    // Slot entries are read through `readSlotStart` — both documented shapes, see above.
    const body = (await response.json()) as {
      status?: string;
      data?: Record<string, unknown>;
    };

    const data = body?.data;
    if (!data || typeof data !== "object") return [];

    const slots: AvailableSlot[] = [];
    for (const date of Object.keys(data).sort()) {
      const daySlots = data[date];
      if (!Array.isArray(daySlots)) continue;
      for (const slot of daySlots) {
        const start = readSlotStart(slot);
        if (start) slots.push({ start });
      }
    }

    return slots.sort((a, b) => a.start.localeCompare(b.start));
  } catch {
    return [];
  }
}

/**
 * Is `iso` still an open slot for `product` right now? Uncached.
 *
 * Three answers, not two: `null` means Cal.com gave us nothing to judge by (outage, missing key —
 * `getAvailableSlots` fails closed to `[]`), and the caller must not treat an outage as "taken".
 * Slots are compared as instants, so `…T09:00:00.000+04:00` and `…T05:00:00.000Z` match.
 */
export async function isSlotStillOpen(product: ServiceProduct, iso: string): Promise<boolean | null> {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return false;

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const slots = await getAvailableSlots({
    product,
    from: toIsoDate(new Date()),
    // One day past the slot's UTC date covers a Dubai-morning slot that is still "yesterday" in UTC.
    to: toIsoDate(new Date(target + 24 * 60 * 60 * 1000)),
    timeZone: "Asia/Dubai",
    fresh: true,
  });

  if (slots.length === 0) return null;
  return slots.some((slot) => new Date(slot.start).getTime() === target);
}
