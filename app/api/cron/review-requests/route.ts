import { getBookingsEligibleForReviewRequest } from "@/lib/db/repository";
import { buildReviewPath } from "@/lib/reviews";
import { sendReviewRequest } from "@/lib/email/resend";
import { getServiceProduct } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";
import { timingSafeEqualStr } from "@/lib/crypto";

/**
 * Daily cron: send a review-request email for every booking eligible per
 * `getBookingsEligibleForReviewRequest()` (`lib/db/repository.ts`) — see that function's doc
 * comment and `docs/lifecycle/2026-09-review-request-sequence.md` for the exact per-product
 * timing windows and exclusions (retainers excluded in v1, Full Support delayed to T+17-20).
 *
 * Auth: `CRON_SECRET` bearer token, constant-time compared (`lib/crypto.ts`'s
 * `timingSafeEqualStr`) — never `===`/`!==` a secret, matching every other secret check in this
 * codebase.
 *
 * Scheduling: `vercel.json`'s `crons` array (`0 16 * * *`). Vercel sends `CRON_SECRET` as the
 * `Authorization: Bearer …` header automatically.
 *
 * Reminder policy: none (`docs/lifecycle/...` §2) — this route sends at most once per recipient,
 * ever, enforced by the dedup already built into `getBookingsEligibleForReviewRequest`'s query
 * (`email_events`, `kind = 'review_request'`, `status = 'sent'`).
 *
 * `?dryRun=1` selects and reports without sending anything and without writing an `email_events`
 * row — the runbook's smoke test, so verifying the cron can't email real customers. Recipients
 * come back masked; this response is a diagnostic, not an export.
 *
 * Retry (Owen S1): dedup only counts a genuinely `sent` row, so a failed send does not burn a
 * customer's only request — and the eligibility window is now THREE days wide (3-6 days after
 * `end_time`; 17-20 for Full Support), so the next two scheduled runs re-select the same booking
 * and retry it without anyone re-invoking anything. Before that widening the window was exactly
 * 1.0 day against a 24-hour schedule, which meant each booking was evaluated by exactly one run,
 * ever, and a Resend outage during that run lost that customer permanently. The retry cannot
 * duplicate: the first genuinely-sent email removes the booking from the eligible set.
 */

export const runtime = "nodejs";

export type ReviewRequestCronResult = {
  sent: number;
  skipped: number;
  failed: number;
  /** True when the run was invoked with `?dryRun=1`; no email was sent and nothing was recorded. */
  dryRun?: boolean;
  /** Dry-run only: what a real run would have attempted, recipients masked. */
  preview?: { bookingUid: string; productSlug: string | null; endTime: string | null; recipient: string }[];
};

/** `karma@talkhumanly.com` -> `k****@talkhumanly.com`. Enough to identify, not to harvest. */
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "****";
  return `${local.slice(0, 1)}****@${domain}`;
}

export async function GET(request: Request): Promise<Response> {
  const authorization = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return Response.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  if (!authorization || !timingSafeEqualStr(authorization, `Bearer ${expected}`)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const bookings = await getBookingsEligibleForReviewRequest();

  if (dryRun) {
    const body: ReviewRequestCronResult = {
      // Nothing is sent, so `sent`/`failed` are 0 and `skipped` counts only what a real run would
      // have skipped outright. `preview` is the actual answer this mode exists to give.
      sent: 0,
      skipped: bookings.filter((booking) => !booking.attendee_email).length,
      failed: 0,
      dryRun: true,
      preview: bookings.map((booking) => ({
        bookingUid: booking.cal_booking_uid,
        productSlug: booking.product_slug,
        endTime: booking.end_time,
        recipient: booking.attendee_email ? maskEmail(booking.attendee_email) : "(none)",
      })),
    };
    return Response.json(body);
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const booking of bookings) {
    // Belt and braces: the SQL query already filters on non-empty attendee_email, but this is
    // the last line of defense before an email send is attempted.
    if (!booking.attendee_email) {
      skipped++;
      continue;
    }

    try {
      const product = getServiceProduct(booking.product_slug);
      const reviewUrl = absoluteUrl(buildReviewPath(booking.cal_booking_uid));
      const sessionDate = booking.end_time
        ? new Date(booking.end_time).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "";

      const result = await sendReviewRequest({
        to: booking.attendee_email,
        name: booking.attendee_name || "there",
        service: product?.name || booking.product_slug || "your session",
        reviewUrl,
        sessionDate,
      });

      if (!result) {
        // sendReviewRequest failed closed (RESEND_API_KEY unset, or the CAN-SPAM postal address
        // still unconfigured) and already recorded a `skipped_*` email_event. Neither status is
        // `sent`, so the dedup in getBookingsEligibleForReviewRequest leaves this booking
        // eligible for the remaining runs in its window.
        skipped++;
      } else if (result.error) {
        // `failed=N` on its own is undiagnosable, and this is the only place the provider's own
        // reason is available. The booking uid is safe to log; the recipient is not.
        console.error(
          "[cron/review-requests] send failed",
          booking.cal_booking_uid,
          result.error.message,
        );
        failed++;
      } else {
        sent++;
      }
    } catch (error) {
      // Best-effort per booking — one failed send must not abort the batch, matching the
      // try/catch convention already used for non-critical email in the webhook routes. Logged
      // rather than swallowed: a bare `catch {}` here made every `failed` count unexplainable
      // (a missing REVIEW_TOKEN_SECRET and a Resend outage looked identical).
      console.error("[cron/review-requests] threw", booking.cal_booking_uid, error);
      failed++;
    }
  }

  const body: ReviewRequestCronResult = { sent, skipped, failed };
  return Response.json(body);
}
