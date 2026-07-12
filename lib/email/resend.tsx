import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/BookingConfirmationEmail";
import { ResourceDeliveryEmail } from "@/emails/ResourceDeliveryEmail";
import {
  PaymentReceiptEmail,
  type PaymentReceiptEmailProps,
} from "@/emails/PaymentReceiptEmail";
import {
  LeadNotificationEmail,
  isBookedLead,
  type LeadNotificationEmailProps,
} from "@/emails/LeadNotificationEmail";
import { recordEmailEvent } from "@/lib/db/repository";
import { siteConfig } from "@/lib/site";

/** Where internal lead notifications are sent. */
const LEAD_INBOX = process.env.LEAD_NOTIFICATION_EMAIL || "hello@talkhumanly.com";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send email.");
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendBookingConfirmation(input: {
  to: string;
  name: string;
  service: string;
  startTime?: string | null;
  endTime?: string | null;
  meetingUrl?: string | null;
  invoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  attendeeCompany?: string | null;
  attendeeRole?: string | null;
  bookingUid?: string | null;
  priceFormatted?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "booking_confirmation",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: input,
    });
    return null;
  }

  const from = process.env.RESEND_FROM || `${siteConfig.name} <hello@talkhumanly.com>`;
  const result = await getResend().emails.send({
    from,
    to: [input.to],
    // No BCC: the Humanly inbox gets its own richer "Meeting booked" notification
    // (sendLeadNotification with booking fields), which carries the intake form too.
    subject: `Your Humanly session is confirmed: ${input.service}`,
    react: <BookingConfirmationEmail {...input} />,
  });

  await recordEmailEvent({
    kind: "booking_confirmation",
    recipient: input.to,
    status: result.error ? "error" : "sent",
    providerId: result.data?.id,
    metadata: result.error ? { error: result.error.message } : input,
  });

  return result;
}

export async function sendResourceDelivery(input: {
  to: string;
  name: string;
  title: string;
  accessUrl: string;
  membership?: boolean;
  priceFormatted?: string | null;
  invoiceUrl?: string | null;
}) {
  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "resource_delivery",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: input,
    });
    return null;
  }

  const from = process.env.RESEND_FROM || `${siteConfig.name} <hello@talkhumanly.com>`;
  const result = await getResend().emails.send({
    from,
    to: [input.to],
    // Copy the Humanly inbox on every client delivery.
    bcc: input.to === LEAD_INBOX ? undefined : [LEAD_INBOX],
    subject: input.membership
      ? `Welcome to Humanly: ${input.title}`
      : `Your Humanly resource: ${input.title}`,
    react: <ResourceDeliveryEmail {...input} />,
  });

  await recordEmailEvent({
    kind: "resource_delivery",
    recipient: input.to,
    status: result.error ? "error" : "sent",
    providerId: result.data?.id,
    metadata: result.error ? { error: result.error.message } : input,
  });

  return result;
}

/**
 * Client-facing payment + invoice email, sent the moment Stripe confirms payment.
 * Deliberately independent of scheduling: a client who pays and never picks a time
 * still gets their invoice, and the CTA pulls them back to the Cal.com scheduler.
 */
export async function sendPaymentReceipt(
  input: PaymentReceiptEmailProps & { to: string }
) {
  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "payment_receipt",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: input,
    });
    return null;
  }

  const from = process.env.RESEND_FROM || `${siteConfig.name} <hello@talkhumanly.com>`;
  const result = await getResend().emails.send({
    from,
    to: [input.to],
    subject: `Payment confirmed: ${input.service} — choose your time`,
    react: <PaymentReceiptEmail {...input} />,
  });

  await recordEmailEvent({
    kind: "payment_receipt",
    recipient: input.to,
    status: result.error ? "error" : "sent",
    providerId: result.data?.id,
    metadata: result.error ? { error: result.error.message } : input,
  });

  return result;
}

/**
 * Internal lead notification with all intake-form fields, sent to the Humanly
 * inbox (hello@talkhumanly.com). Fires at each funnel stage: form submit
 * (paid:false), payment (paid:true), and — with booking fields attached — once
 * the client picks a Cal.com slot, which is the only email carrying both the
 * intake form and the meeting details.
 */
export async function sendLeadNotification(input: LeadNotificationEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "lead_notification",
      recipient: LEAD_INBOX,
      status: "skipped_missing_resend_key",
      metadata: input,
    });
    return null;
  }

  const from = process.env.RESEND_FROM || `${siteConfig.name} <hello@talkhumanly.com>`;
  const stage = isBookedLead(input)
    ? "✅ Booked"
    : input.paid
      ? "💳 Paid lead"
      : "📥 New lead";
  const subject = `${stage}: ${input.name} — ${input.service}`;

  const result = await getResend().emails.send({
    from,
    to: [LEAD_INBOX],
    replyTo: input.email,
    subject,
    react: <LeadNotificationEmail {...input} />,
  });

  await recordEmailEvent({
    kind: "lead_notification",
    recipient: LEAD_INBOX,
    status: result.error ? "error" : "sent",
    providerId: result.data?.id,
    metadata: result.error ? { error: result.error.message } : input,
  });

  return result;
}
