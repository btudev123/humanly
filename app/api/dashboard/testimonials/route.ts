import { z } from "zod";
import { revalidateTag, revalidatePath } from "next/cache";
import { PUBLISHED_TESTIMONIALS_TAG } from "@/components/reviews/publishedTestimonials";
import { requireAdminApi } from "@/lib/auth/admin";
import { getSql, hasDatabase } from "@/lib/db/client";
import {
  listTestimonials,
  setTestimonialStatus,
  REVIEW_CONSENT_PUBLISH,
  REVIEW_CONSENT_PRIVATE,
  type TestimonialRecord,
} from "@/lib/db/repository";
import {
  MODERATION_PAGE_LIMIT,
  type ConsentVerdict,
  type ModerationListResponse,
  type ModerationRow,
  type ModerationStatus,
  type RatingDistribution,
} from "@/components/dashboard/reviewModeration";

export const runtime = "nodejs";

const testimonialSchema = z.object({
  type: z.enum(["text", "video", "instagram"]),
  quote: z.string().optional(),
  personLabel: z.string().optional(),
  roleLabel: z.string().optional(),
  mediaUrl: z.string().optional(),
  transcript: z.string().optional(),
  published: z.boolean().default(false),
});

/**
 * Moderation actions on one row. `status` drives the approve/pending/reject workflow
 * (`setTestimonialStatus` — approving also publishes, gated on consent, see
 * `lib/db/repository.ts`). `verified` is independent of `status`: fixes the pre-existing bug
 * where every row was inserted with `verified = false` and nothing could ever flip it — an admin
 * can now mark a quote verified (e.g. after confirming the person/booking) without that implying
 * anything about publish status, and vice versa.
 */
const testimonialPatchSchema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    verified: z.boolean().optional(),
  })
  .refine((body) => body.status !== undefined || body.verified !== undefined, {
    message: "At least one of `status` or `verified` is required.",
  });

const statusFilterSchema = z.enum(["pending", "approved", "rejected"]);

/** Neon returns `timestamptz` as a `Date`; the record type calls it a string. Normalise both. */
function toIsoString(value: unknown): string | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" && value.trim()) return value;
  return null;
}

/** 1–5 integers only. Anything else (null, 0, 7, a string) is "unrated", never a star count. */
function toRating(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

function toTrimmed(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * THE CONSENT DECISION, made once, on the server, from the stored value — see `ConsentVerdict`
 * in `components/dashboard/reviewModeration.ts` for what each verdict means.
 *
 * A row is customer-submitted if it carries a booking uid or a submitted email (`app/api/reviews`
 * always writes both the booking uid and a validated consent value). So a row with NO consent
 * value is either an admin-authored quote from the POST form below — legitimate, different
 * consent basis — or a customer row whose consent went missing, which is bad data and is treated
 * exactly like an explicit "no".
 */
function consentVerdict(row: TestimonialRecord): ConsentVerdict {
  if (row.consent_display === REVIEW_CONSENT_PUBLISH) return "publishable";
  if (row.consent_display === REVIEW_CONSENT_PRIVATE) return "private";

  const customerSubmitted = Boolean(row.cal_booking_uid || row.submitted_email);
  if (!row.consent_display && !customerSubmitted) return "admin_authored";
  return "unrecorded";
}

function toModerationRow(row: TestimonialRecord): ModerationRow {
  const consent = consentVerdict(row);
  const submittedAt = toIsoString(row.submitted_at);
  const createdAt = toIsoString(row.created_at);

  return {
    id: row.id,
    rating: toRating(row.rating),
    quote: toTrimmed(row.quote),
    roleLabel: toTrimmed(row.role_label),
    location: toTrimmed(row.location),
    submittedAt: submittedAt || createdAt,
    submittedAtIsFallback: !submittedAt && Boolean(createdAt),
    status: row.status,
    verified: Boolean(row.verified),
    consent,
    canApprove: consent === "publishable" || consent === "admin_authored",
  };
}

function ratingDistribution(rows: TestimonialRecord[]): RatingDistribution {
  const counts = [0, 0, 0, 0, 0];
  let unrated = 0;

  for (const row of rows) {
    const rating = toRating(row.rating);
    if (rating === null) unrated += 1;
    else counts[rating - 1] += 1;
  }

  return { counts, unrated, total: rows.length };
}

/**
 * Moderation queue read. `?status=pending` is what the dashboard queue asks for; no filter
 * returns every row.
 *
 * The response is the moderation projection, NOT the raw `testimonials` row it used to be: no
 * `submitted_email`, no `cal_booking_uid`, no `transcript`. The queue does not need the
 * reviewer's address to moderate the words, so it is never put on the wire. (Verified: nothing
 * else in the app reads this GET — `components/dashboard` was the only consumer, and it only
 * ever called POST.)
 *
 * One query, not two: the rating distribution has to span EVERY submission regardless of status
 * (`docs/lifecycle/2026-09-review-request-sequence.md` §5 — the honest satisfaction signal is the
 * full distribution, not the published subset), so the full table is already in memory and the
 * status filter is applied here rather than issuing a second filtered `listTestimonials` call.
 *
 * [PERF] At real volume this should be `select rating, status, count(*) ... group by` in
 * `lib/db/repository.ts` instead of reading every row to count them. Not added here because that
 * file is owned elsewhere in this wave.
 */
export async function GET(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const requested = new URL(request.url).searchParams.get("status");
  let statusFilter: ModerationStatus | undefined;
  if (requested !== null) {
    const parsed = statusFilterSchema.safeParse(requested);
    if (!parsed.success) {
      return Response.json({ error: "Unknown status filter." }, { status: 400 });
    }
    statusFilter = parsed.data;
  }

  const all = await listTestimonials();
  const matching = statusFilter ? all.filter((row) => row.status === statusFilter) : all;

  const payload: ModerationListResponse = {
    testimonials: matching.slice(0, MODERATION_PAGE_LIMIT).map(toModerationRow),
    totalMatching: matching.length,
    ratingDistribution: ratingDistribution(all),
  };

  return Response.json(payload);
}

export async function POST(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const body = testimonialSchema.parse(await request.json());
  // `status` is set explicitly and never left to the column default. An admin-authored row
  // sitting at the default 'pending' while published = true is exactly the shape the backfill
  // in migrations.sql targets, so a re-run of that file would silently approve it (Owen S7).
  // Setting it at the source closes that off.
  const sql = getSql();
  await sql`
    insert into testimonials (
      type,
      quote,
      person_label,
      role_label,
      media_url,
      transcript,
      published,
      verified,
      status
    )
    values (
      ${body.type},
      ${body.quote || null},
      ${body.personLabel || null},
      ${body.roleLabel || null},
      ${body.mediaUrl || null},
      ${body.transcript || null},
      ${body.published},
      false,
      ${body.published ? "approved" : "pending"}
    )
  `;

  // Publishing or moderating changes what the public site shows, and `/` is statically generated
  // with ISR (see `components/reviews/publishedTestimonials.ts`). Purging the cache entry alone is
  // not enough — the rendered page has to be rebuilt too, hence both calls. Without this an
  // approval would not surface for up to an hour, which reads as "the approve button is broken".
  // Best-effort: a revalidation failure must never turn a successful write into an error.
  try {
    revalidateTag(PUBLISHED_TESTIMONIALS_TAG, { expire: 0 });
    revalidatePath("/");
  } catch (error) {
    console.error("[dashboard/testimonials] revalidation failed", error);
  }

  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  let body: z.infer<typeof testimonialPatchSchema>;
  try {
    body = testimonialPatchSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.status === "approved") {
    // Defence in depth for the one case `setTestimonialStatus` deliberately allows through:
    // it publishes when `consent_display is null`, because an admin-authored quote from the POST
    // handler above never sets that column. A CUSTOMER row with a null consent value is not that
    // — it is a submission whose consent went missing, and it must not be published on the
    // strength of a column being empty. One primary-key lookup, before the update.
    const sql = getSql();
    const rows = (await sql`
      select consent_display, cal_booking_uid, submitted_email
      from testimonials
      where id = ${body.id}::uuid
      limit 1
    `) as Pick<TestimonialRecord, "consent_display" | "cal_booking_uid" | "submitted_email">[];

    const row = rows[0];
    if (!row) {
      return Response.json({ error: "Testimonial not found.", code: "not_found" }, { status: 404 });
    }
    if (!row.consent_display && (row.cal_booking_uid || row.submitted_email)) {
      return Response.json(
        {
          error:
            "This submission has no recorded display consent, so it cannot be published. Check the row in the database before doing anything with it.",
          code: "consent_unrecorded",
        },
        { status: 409 },
      );
    }
  }

  if (body.status) {
    const result = await setTestimonialStatus(body.id, body.status);
    if (!result.ok && result.reason === "not_found") {
      return Response.json({ error: "Testimonial not found.", code: "not_found" }, { status: 404 });
    }
    if (!result.ok && result.reason === "consent_required") {
      return Response.json(
        {
          error:
            "This client chose “No, keep this between us.” It can never be published, and this queue should not have offered the option.",
          code: "consent_required",
        },
        { status: 409 },
      );
    }
  }

  if (body.verified !== undefined) {
    const sql = getSql();
    const rows = (await sql`
      update testimonials
      set verified = ${body.verified}, updated_at = now()
      where id = ${body.id}::uuid
      returning id
    `) as { id: string }[];

    if (!rows[0]) {
      return Response.json({ error: "Testimonial not found.", code: "not_found" }, { status: 404 });
    }
  }

  // Publishing or moderating changes what the public site shows, and `/` is statically generated
  // with ISR (see `components/reviews/publishedTestimonials.ts`). Purging the cache entry alone is
  // not enough — the rendered page has to be rebuilt too, hence both calls. Without this an
  // approval would not surface for up to an hour, which reads as "the approve button is broken".
  // Best-effort: a revalidation failure must never turn a successful write into an error.
  try {
    revalidateTag(PUBLISHED_TESTIMONIALS_TAG, { expire: 0 });
    revalidatePath("/");
  } catch (error) {
    console.error("[dashboard/testimonials] revalidation failed", error);
  }

  return Response.json({ ok: true });
}
