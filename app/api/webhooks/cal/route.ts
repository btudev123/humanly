import crypto from "node:crypto";
import { getOrderById, markBookingRescheduled, recordBooking } from "@/lib/db/repository";
import { sendBookingConfirmation, sendLeadNotification } from "@/lib/email/resend";

export const runtime = "nodejs";

function metaStr(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "string" && value ? value : null;
}

function timingSafeEqualStr(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function nestedString(source: Record<string, unknown>, keys: string[]) {
  let cursor: unknown = source;
  for (const key of keys) {
    if (!cursor || typeof cursor !== "object") return null;
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return stringValue(cursor);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    // Cal.com signs the raw payload: X-Cal-Signature-256 = HMAC-SHA256(body, secret).
    // Also accept a plaintext secret header as a fallback.
    const signature = request.headers.get("x-cal-signature-256");
    const plaintext =
      request.headers.get("x-cal-secret") ||
      request.headers.get("x-webhook-secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    let authorized = false;
    if (signature) {
      const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      authorized = timingSafeEqualStr(signature, expected);
    } else if (plaintext) {
      authorized = timingSafeEqualStr(plaintext, secret);
    }
    if (!authorized) {
      return Response.json({ error: "Invalid Cal.com webhook signature." }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const payload = ((body.payload || body.data || body) ?? {}) as Record<string, unknown>;
  const metadata = ((payload.metadata || body.metadata || {}) ?? {}) as Record<string, unknown>;
  const attendees = Array.isArray(payload.attendees) ? (payload.attendees as Record<string, unknown>[]) : [];
  const firstAttendee = attendees[0] || {};
  const orderId = stringValue(metadata.orderId) || stringValue(metadata.order_id);
  const uid =
    stringValue(payload.uid) ||
    stringValue(payload.bookingUid) ||
    stringValue(payload.id) ||
    stringValue(body.uid);

  if (!uid) {
    return Response.json({ error: "Missing Cal.com booking UID." }, { status: 400 });
  }

  // Owen S2: null, never a literal. `BOOKING_NO_SHOW_UPDATED` sends `attendees: [{ email,
  // noShow }]` — an email but no name — and the old `|| "Humanly client"` fallback wrote that
  // placeholder straight over the real attendee name via the upsert, after which the review
  // email opened "Hi Humanly client". Passing null lets `recordBooking`'s `coalesce` keep
  // whatever is already stored; the display fallbacks below are for the outgoing email only and
  // never reach the database.
  const attendeeName =
    stringValue(firstAttendee.name) ||
    stringValue(payload.attendeeName) ||
    stringValue(payload.name);
  const attendeeEmail =
    stringValue(firstAttendee.email) ||
    stringValue(payload.email) ||
    stringValue(payload.attendeeEmail);

  const attendeeCompany =
    stringValue(firstAttendee.company) ||
    stringValue(payload.company) ||
    stringValue(metadata.company) ||
    null;
  const attendeeRole =
    stringValue(firstAttendee.role) ||
    stringValue(payload.role) ||
    stringValue(metadata.role) ||
    null;

  // Cal.com delivers every booking trigger to this one URL as `{ triggerEvent, createdAt,
  // payload }`. The route used to ignore `triggerEvent` entirely, which meant a cancellation
  // emailed the client "your booking is confirmed" with a dead meeting link (ADR-0001 Decision D).
  const trigger = stringValue(body.triggerEvent);

  // Cal.com sends the status uppercase (`"ACCEPTED"`, `"CANCELLED"`) and this route stored it
  // verbatim, so `getBookingsEligibleForReviewRequest`'s `lower(b.status) = 'accepted'` filter
  // needs a single, lower-cased convention on write. Null when the event carried no status at
  // all (`BOOKING_NO_SHOW_UPDATED`) — `recordBooking` then keeps whatever is already stored.
  const status = stringValue(payload.status)?.toLowerCase() || null;

  const startTime = stringValue(payload.startTime) || stringValue(payload.start);
  const endTime = stringValue(payload.endTime) || stringValue(payload.end);
  const meetingUrl =
    stringValue(payload.meetingUrl) ||
    stringValue(payload.location) ||
    nestedString(payload, ["location", "value"]);
  const title = stringValue(payload.title) || stringValue(payload.eventTypeSlug);

  const booking = await recordBooking({
    orderId,
    uid,
    title,
    attendeeName,
    attendeeEmail,
    startTime,
    endTime,
    meetingUrl,
    status,
    rawPayload: body,
  });

  // A reschedule arrives as a NEW booking with a new `uid` plus `rescheduleUid` pointing at the
  // one it replaced. Retire that older row so the review cron can't chase a slot that never
  // happened (and, via its per-email dedup, burn the request for the slot that did).
  const rescheduleUid = stringValue(payload.rescheduleUid);
  if (trigger === "BOOKING_RESCHEDULED" && rescheduleUid && rescheduleUid !== uid) {
    try {
      await markBookingRescheduled(rescheduleUid);
    } catch (error) {
      console.error("[webhooks/cal] failed to retire rescheduled booking", rescheduleUid, error);
    }
  }

  // Guest-facing mail only for the two triggers that mean "you have a confirmed time". Anything
  // else (cancellation, rejection, no-show, payment/meeting-ended events) is recorded silently.
  // A payload with no `triggerEvent` at all isn't a shape Cal.com sends, but this route has
  // always tolerated loose bodies, so it's treated as a creation unless its status says otherwise.
  const isConfirmingEvent =
    trigger === "BOOKING_CREATED" ||
    trigger === "BOOKING_RESCHEDULED" ||
    (!trigger && status !== "cancelled" && status !== "rejected");

  if (!isConfirmingEvent) {
    return Response.json({ ok: true, booking, emailed: false });
  }

  const order = orderId ? await getOrderById(orderId) : null;
  const service = order?.product_slug || title || "Humanly consultation";

  let priceFormatted: string | null = null;
  if (order?.amount && order?.currency) {
    try {
      priceFormatted = new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: order.currency.toUpperCase(),
        maximumFractionDigits: 0,
      }).format(order.amount / 100);
    } catch {
      // ignore formatting errors
    }
  }

  // Display-only fallbacks. These are what the recipient reads; nothing here is written back to
  // `bookings` (see the Owen S2 note above).
  const displayName = attendeeName || "Humanly client";

  if (attendeeEmail) {
    await sendBookingConfirmation({
      to: attendeeEmail,
      name: displayName,
      service,
      startTime,
      endTime,
      meetingUrl,
      invoiceUrl: order?.stripe_invoice_url,
      invoicePdfUrl: order?.stripe_invoice_pdf_url,
      attendeeCompany,
      attendeeRole,
      bookingUid: uid,
      priceFormatted,
    });
  }

  // Internal notification: the only email carrying the intake form *and* the booked
  // meeting together. Degrades to Cal-only data when the booking has no linked order
  // (e.g. someone booked a raw Cal link outside the paid funnel).
  try {
    await sendLeadNotification({
      service,
      priceFormatted,
      name: order?.customer_name || displayName,
      email: order?.customer_email || attendeeEmail || "",
      phone: order?.phone,
      urgency: metaStr(order?.metadata, "urgency"),
      concern: metaStr(order?.metadata, "concern"),
      message: metaStr(order?.metadata, "message"),
      paid: Boolean(order),
      orderId: order?.id,
      startTime,
      endTime,
      meetingUrl,
      bookingUid: uid,
    });
  } catch {
    // Best-effort; the booking is already recorded.
  }

  return Response.json({ ok: true, booking });
}
