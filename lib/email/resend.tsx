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
import {
  ReviewRequestEmail,
  REVIEW_EMAIL_POSTAL_ADDRESS_CONFIGURED,
  type ReviewRequestEmailProps,
} from "@/emails/ReviewRequestEmail";
import { recordEmailEvent } from "@/lib/db/repository";
import { siteConfig } from "@/lib/site";

/** Where internal lead notifications are sent. */
const LEAD_INBOX = process.env.LEAD_NOTIFICATION_EMAIL || "hello@talkhumanly.com";

/**
 * `email_events.metadata` is a durable debugging record, not a copy of the email. Two of the
 * emails this file sends carry a **capability URL** — a link that is itself the credential:
 *
 *  - the review request's `/review/<uid>.<expiry>.<sig>`, a signed, 60-day review-submission
 *    token (`lib/reviews.ts`);
 *  - the resource delivery's `?session_id=<stripe session>` download link, which
 *    `/api/resources/download` accepts as proof of entitlement.
 *
 * Storing either verbatim puts a working credential in a table nothing needs it in. The helpers
 * below keep the part that helps debugging (which booking, which route) and drop the part that
 * grants access.
 */
function redactCapabilityUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Path only, with the last segment (the token) reduced to its non-secret prefix.
    const segments = parsed.pathname.split("/");
    const last = segments[segments.length - 1] ?? "";
    const dot = last.indexOf(".");
    segments[segments.length - 1] = dot > 0 ? `${last.slice(0, dot)}.[redacted]` : last;
    return `${parsed.origin}${segments.join("/")}${parsed.search ? "?[redacted]" : ""}`;
  } catch {
    return "[redacted]";
  }
}

/**
 * Stripe's hosted invoice and invoice-PDF links (`orders.stripe_invoice_url` /
 * `stripe_invoice_pdf_url`) are capability URLs too — anyone holding one can read the customer's
 * invoice, no login. `redactCapabilityUrl` above is the wrong tool for them: it only masks a
 * dot-separated token or a query string, and Stripe puts the secret in an undotted path segment
 * (`/i/acct_.../live_...`), so it would pass the credential straight through. Keep only the host,
 * which is all the debugging record needs ("an invoice link was attached, from Stripe").
 */
function redactInvoiceUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    return `${new URL(url).origin}/[redacted]`;
  } catch {
    return "[redacted]";
  }
}

/**
 * The review request is the only NON-transactional email this codebase sends — unprompted, days
 * after the recipient last thought about Humanly, asking something of them. The site is
 * global-first (UAE/GCC + North America, per `siteConfig`), so it is held to the CAN-SPAM/CASL
 * bar, not the receipt bar the other four senders clear automatically:
 * `docs/lifecycle/2026-09-review-request-sequence.md` §3.
 *
 * `List-Unsubscribe` always ships, pointing at the inbox a human actually reads — which is the
 * opt-out mechanism §3 says can ship today ("reply and we won't ask again", honoured by hand at
 * single-practitioner volume), now also machine-readable by every mailbox provider.
 *
 * `List-Unsubscribe-Post: List-Unsubscribe=One-Click` is emitted ONLY alongside an https URI.
 * RFC 8058 §1 requires the one-click POST target to be an https URI; pairing the header with a
 * `mailto:`-only `List-Unsubscribe` is malformed and would be worse than omitting it — a provider
 * has nothing to POST to. No one-click endpoint exists in this app yet (`app/api/webhooks/` and
 * the route tree have nothing of the sort), so today only the mailto ships.
 * `[NEEDS SETUP: a one-click unsubscribe route + suppression table (lifecycle doc §3), then set
 * EMAIL_UNSUBSCRIBE_URL to its https address and this pair becomes RFC 8058 compliant with no
 * further change here.]`
 */
function nonTransactionalHeaders(): Record<string, string> {
  const oneClickUrl = process.env.EMAIL_UNSUBSCRIBE_URL?.trim();
  const isHttps = Boolean(oneClickUrl && oneClickUrl.startsWith("https://"));

  const targets = [`<mailto:${LEAD_INBOX}?subject=Unsubscribe>`];
  if (isHttps && oneClickUrl) targets.unshift(`<${oneClickUrl}>`);

  const headers: Record<string, string> = { "List-Unsubscribe": targets.join(", ") };
  if (isHttps) headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";

  return headers;
}

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
  // `metadata: input` verbatim wrote Stripe's hosted `invoiceUrl`/`invoicePdfUrl` — both
  // capability URLs — into `email_events`. `meetingUrl` is deliberately NOT redacted: it is
  // already stored in full in `bookings.meeting_url` by design, so masking the copy here would
  // cost debuggability and protect nothing.
  const bookingMetadata = {
    ...input,
    invoiceUrl: redactInvoiceUrl(input.invoiceUrl),
    invoicePdfUrl: redactInvoiceUrl(input.invoicePdfUrl),
  };

  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "booking_confirmation",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: bookingMetadata,
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
    metadata: result.error ? { error: result.error.message } : bookingMetadata,
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
      metadata: {
        ...input,
        accessUrl: redactCapabilityUrl(input.accessUrl),
        invoiceUrl: redactInvoiceUrl(input.invoiceUrl),
      },
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
    // Never the raw `accessUrl` — see `redactCapabilityUrl`.
    metadata: result.error
      ? { error: result.error.message }
      : {
          ...input,
          accessUrl: redactCapabilityUrl(input.accessUrl),
          invoiceUrl: redactInvoiceUrl(input.invoiceUrl),
        },
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
  // Same redaction as the booking confirmation: Stripe's hosted invoice links are credentials.
  // `scheduleUrl` goes through `redactCapabilityUrl` for its query string, which carries the
  // order id the paid-only scheduler gates on.
  const receiptMetadata = {
    ...input,
    invoiceUrl: redactInvoiceUrl(input.invoiceUrl),
    invoicePdfUrl: redactInvoiceUrl(input.invoicePdfUrl),
    scheduleUrl: redactCapabilityUrl(input.scheduleUrl),
  };

  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "payment_receipt",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: receiptMetadata,
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
    metadata: result.error ? { error: result.error.message } : receiptMetadata,
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
  // `metadata: input` copied the entire intake — `concern`, the free-text `message`, `phone`,
  // the per-service `details` answers — into `email_events`, a table that exists to answer "did
  // this email go out, and if not why". None of that is needed to answer it, and this is the
  // most sensitive data the site holds: why someone contacted an HR advisor. Reduced to the
  // fields that actually help debug a send, with booleans standing in for "was it there".
  // The order row remains the durable record of the intake itself.
  const leadMetadata = {
    service: input.service,
    paid: input.paid,
    orderId: input.orderId ?? null,
    bookingUid: input.bookingUid ?? null,
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    hasPhone: Boolean(input.phone),
    hasConcern: Boolean(input.concern),
    hasMessage: Boolean(input.message),
    detailCount: input.details?.length ?? 0,
  };

  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "lead_notification",
      recipient: LEAD_INBOX,
      status: "skipped_missing_resend_key",
      metadata: leadMetadata,
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
    metadata: result.error ? { error: result.error.message, ...leadMetadata } : leadMetadata,
  });

  return result;
}

/**
 * Review-request email, sent by the daily `app/api/cron/review-requests` job 3-6 days after a
 * booking's `end_time` (17-20 for Full Support). See
 * `docs/adr/0001-pricing-currency-availability-reviews.md` (Decision D). `reviewUrl` must already
 * be the absolute `/review/<token>` link — this function doesn't generate or sign anything,
 * that's `lib/reviews.ts`'s job.
 *
 * The ONLY non-transactional sender in this file: it carries `List-Unsubscribe`
 * (`nonTransactionalHeaders`) and the email itself carries a postal address, neither of which
 * the four transactional senders above need.
 */
export async function sendReviewRequest(input: ReviewRequestEmailProps & { to: string }) {
  if (!process.env.RESEND_API_KEY) {
    await recordEmailEvent({
      kind: "review_request",
      recipient: input.to,
      status: "skipped_missing_resend_key",
      metadata: { ...input, reviewUrl: redactCapabilityUrl(input.reviewUrl) },
    });
    return null;
  }

  if (!REVIEW_EMAIL_POSTAL_ADDRESS_CONFIGURED) {
    // Fail closed, exactly like the missing-API-key branch above. The placeholder renders
    // verbatim in the footer, so sending anyway put `[NEEDS DATA — …]` in front of a paying
    // client, and a commercial email with no physical postal address does not clear CAN-SPAM
    // (US) or CASL (CA) either way. The address is not something this codebase can invent —
    // supply it in `emails/ReviewRequestEmail.tsx` and sends resume with no other change.
    //
    // The recorded status is deliberately not `sent`: `getBookingsEligibleForReviewRequest`
    // (`lib/db/repository.ts`) dedups on `status = 'sent'` alone, so this row cannot burn the
    // client's one review request — the same booking is re-selected by the remaining runs in
    // its three-day window.
    console.warn(
      "[email/review_request] not sent — no postal address configured; see REVIEW_EMAIL_POSTAL_ADDRESS in emails/ReviewRequestEmail.tsx",
    );
    await recordEmailEvent({
      kind: "review_request",
      recipient: input.to,
      status: "skipped_missing_postal_address",
      metadata: { ...input, reviewUrl: redactCapabilityUrl(input.reviewUrl) },
    });
    return null;
  }

  const from = process.env.RESEND_FROM || `${siteConfig.name} <hello@talkhumanly.com>`;
  const result = await getResend().emails.send({
    from,
    to: [input.to],
    subject: `How was your session with Humanly?`,
    headers: nonTransactionalHeaders(),
    react: <ReviewRequestEmail {...input} />,
  });

  await recordEmailEvent({
    kind: "review_request",
    recipient: input.to,
    status: result.error ? "error" : "sent",
    providerId: result.data?.id,
    // The signed review token is a 60-day credential; only the booking uid survives into the
    // stored metadata. See `redactCapabilityUrl`.
    metadata: result.error
      ? { error: result.error.message }
      : { ...input, reviewUrl: redactCapabilityUrl(input.reviewUrl) },
  });

  return result;
}
