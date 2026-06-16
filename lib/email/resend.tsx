import { Resend } from "resend";
import { BookingConfirmationEmail } from "@/emails/BookingConfirmationEmail";
import { ResourceDeliveryEmail } from "@/emails/ResourceDeliveryEmail";
import { recordEmailEvent } from "@/lib/db/repository";
import { siteConfig } from "@/lib/site";

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
