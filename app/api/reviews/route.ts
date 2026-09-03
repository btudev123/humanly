import { z } from "zod";
import { getSql, hasDatabase } from "@/lib/db/client";
import { verifyReviewToken } from "@/lib/reviews";
import { REVIEW_CONSENT_PUBLISH, REVIEW_CONSENT_PRIVATE } from "@/lib/db/repository";
import { recordFunnelEvent } from "@/lib/analytics/funnel";

export const runtime = "nodejs";

/**
 * Public POST — no admin auth. Anyone holding a valid, unexpired `/review/<token>` link
 * (issued only by the review-request cron, see `lib/reviews.ts`) can submit one testimonial
 * per `cal_booking_uid` — enforced by the unique index `testimonials_cal_booking_uid_key`, not
 * by the read-then-write check alone. Inserted rows always land `status = 'pending'`, `published = false`,
 * `verified = false` — this endpoint has no path to auto-publish; that's Owen/dashboard-gated
 * moderation via `setTestimonialStatus`.
 *
 * Consent and rating rules per `docs/lifecycle/2026-09-review-request-sequence.md` §6: rating is
 * required (1-5) and always collected regardless of consent; free text is OPTIONAL — "there is no
 * branch by rating," a 1-star "keep this between us" response reaches Karma exactly as directly
 * as a 5-star published one. `consentDisplay` is required and binary, no default — the two exact
 * options from that doc, see `REVIEW_CONSENT_PUBLISH`/`REVIEW_CONSENT_PRIVATE`.
 */
const reviewSubmissionSchema = z.object({
  token: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  quote: z.string().max(4000).optional(),
  roleLabel: z.string().max(160).optional(),
  location: z.string().max(160).optional(),
  consentDisplay: z.enum([REVIEW_CONSENT_PUBLISH, REVIEW_CONSENT_PRIVATE]),
  // NO `submittedEmail` (Owen S3). It used to be an optional client-supplied field on this
  // public endpoint; the form never sent it, so it was pure attack surface — anyone holding a
  // valid token could attach a third party's address to a verified booking's review, where it
  // reads as authoritative in the moderation queue. `submitted_email` is now derived server-side
  // from `bookings.attendee_email` for the token's own `cal_booking_uid`. Zod strips unknown
  // keys by default, so a client that still sends one is ignored rather than rejected.
});

/** Postgres unique_violation. Raised by `testimonials_cal_booking_uid_key` (migrations.sql). */
const PG_UNIQUE_VIOLATION = "23505";

/**
 * Duck-typed rather than `instanceof NeonDbError`: the driver copies the Postgres error fields
 * onto its own error class, and an `instanceof` check across duplicated module instances is a
 * classic silent failure. The only unique constraint this insert can violate is the
 * `cal_booking_uid` one — `testimonials`' other unique key is the generated primary key.
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === PG_UNIQUE_VIOLATION
  );
}

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });
  }

  let body: z.infer<typeof reviewSubmissionSchema>;
  try {
    body = reviewSubmissionSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid review submission." }, { status: 400 });
  }

  const verification = verifyReviewToken(body.token);
  if (!verification.valid) {
    const status = verification.reason === "expired" ? 410 : 401;
    return Response.json({ error: `Review link is invalid (${verification.reason}).` }, { status });
  }

  const { calBookingUid } = verification;
  const sql = getSql();

  // One submission per booking. This pre-check is a nicety, not the guarantee: between the select
  // and the insert two concurrent requests (a double-clicked submit, or a token replayed any time
  // in its 60-day life) both see zero rows and both insert. The real enforcement is the unique
  // index `testimonials_cal_booking_uid_key`, caught below — this query just buys a cheaper,
  // friendlier 409 in the common case.
  const existing = (await sql`
    select id from testimonials where cal_booking_uid = ${calBookingUid} limit 1
  `) as { id: string }[];

  if (existing.length > 0) {
    return Response.json({ error: "A review has already been submitted for this booking." }, { status: 409 });
  }

  // `submitted_email` is the booking's own attendee address, never anything the client sent
  // (Owen S3). A valid HMAC token is only ever issued by the cron against a real `bookings` row,
  // so this normally resolves; if the row has since gone (or never carried an email), the review
  // is still accepted with a null address rather than lost over a missing join.
  const bookingRows = (await sql`
    select attendee_email from bookings where cal_booking_uid = ${calBookingUid} limit 1
  `) as { attendee_email: string | null }[];
  const submittedEmail = bookingRows[0]?.attendee_email || null;

  try {
    await sql`
      insert into testimonials (
        type,
        quote,
        role_label,
        location,
        published,
        verified,
        rating,
        status,
        cal_booking_uid,
        submitted_email,
        consent_display,
        submitted_at
      )
      values (
        'text',
        ${body.quote || null},
        ${body.roleLabel || null},
        ${body.location || null},
        false,
        false,
        ${body.rating},
        'pending',
        ${calBookingUid},
        ${submittedEmail},
        ${body.consentDisplay},
        now()
      )
    `;
  } catch (error) {
    // The unique index did what the pre-check above cannot: two concurrent submissions for one
    // booking, one of which loses. Same 409 the pre-check returns — from the caller's point of
    // view "a review already exists" is exactly what happened.
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: "A review has already been submitted for this booking." },
        { status: 409 },
      );
    }
    // Anything else is a real failure and must not be reported as a successful submission.
    console.error("[api/reviews] insert failed", calBookingUid, error);
    return Response.json({ error: "Could not save this review." }, { status: 500 });
  }

  // `review_submitted` — docs/lifecycle/2026-09-review-request-sequence.md §5. Best-effort: a
  // funnel-recording failure must never fail the actual submission.
  void recordFunnelEvent({
    event: "review_submitted",
    path: "/api/reviews",
    metadata: { consentDisplay: body.consentDisplay, rating: body.rating },
  }).catch((error) => {
    // Logged, not swallowed: a silently-dropped funnel event makes the response-rate figure in
    // the lifecycle doc (§5) quietly wrong with nothing to explain the gap.
    console.error("[api/reviews] funnel event failed", error);
  });

  return Response.json({ ok: true });
}
