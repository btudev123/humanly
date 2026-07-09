import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/BookingConfirmationEmail";
import { ResourceDeliveryEmail } from "@/emails/ResourceDeliveryEmail";
import {
  LeadNotificationEmail,
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
    // Copy the Humanly inbox on every client confirmation.
    bcc: input.to === LEAD_INBOX ? undefined : [LEAD_INBOX],
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
 * Internal lead notification with all intake-form fields, sent to the Humanly
 * inbox (hello@talkhumanly.com). Fires once on form submit (paid:false) and
 * again once payment succeeds (paid:true).
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
  const subject = `${input.paid ? "💳 Paid lead" : "📥 New lead"}: ${input.name} — ${input.service}`;

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
