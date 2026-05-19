import { getOrderById, recordBooking } from "@/lib/db/repository";
import { sendBookingConfirmation } from "@/lib/email/resend";

export const runtime = "nodejs";

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
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const provided =
      request.headers.get("x-cal-secret") ||
      request.headers.get("x-webhook-secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== secret) {
      return Response.json({ error: "Invalid Cal.com webhook secret." }, { status: 401 });
    }
  }

  const body = (await request.json()) as Record<string, unknown>;
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

  const attendeeName =
    stringValue(firstAttendee.name) ||
    stringValue(payload.attendeeName) ||
    stringValue(payload.name) ||
    "Humanly client";
  const attendeeEmail =
    stringValue(firstAttendee.email) ||
    stringValue(payload.email) ||
    stringValue(payload.attendeeEmail) ||
    "";

  const booking = await recordBooking({
    orderId,
    uid,
    title: stringValue(payload.title) || stringValue(payload.eventTypeSlug),
    attendeeName,
    attendeeEmail,
    startTime: stringValue(payload.startTime) || stringValue(payload.start),
    endTime: stringValue(payload.endTime) || stringValue(payload.end),
    meetingUrl:
      stringValue(payload.meetingUrl) ||
      stringValue(payload.location) ||
      nestedString(payload, ["location", "value"]),
    status: stringValue(payload.status) || "accepted",
    rawPayload: body,
  });

  const order = orderId ? await getOrderById(orderId) : null;
  if (attendeeEmail) {
    await sendBookingConfirmation({
      to: attendeeEmail,
      name: attendeeName,
      service: order?.product_slug || stringValue(payload.title) || "Humanly consultation",
      startTime: stringValue(payload.startTime) || stringValue(payload.start),
      endTime: stringValue(payload.endTime) || stringValue(payload.end),
      meetingUrl:
        stringValue(payload.meetingUrl) ||
        stringValue(payload.location) ||
        nestedString(payload, ["location", "value"]),
      invoiceUrl: order?.stripe_invoice_url,
      invoicePdfUrl: order?.stripe_invoice_pdf_url,
    });
  }

  return Response.json({ ok: true, booking });
}
