import "server-only";

import { unstable_cache } from "next/cache";
import { hasDatabase } from "@/lib/db/client";
import {
  getPublishedTestimonials,
  REVIEW_CONSENT_PUBLISH,
  type TestimonialRecord,
} from "@/lib/db/repository";
import type { Testimonial } from "@/components/reviews/TestimonialsCarousel";

/**
 * Server-side bridge between the moderated `testimonials` table and the shape the public
 * carousel renders. Lives here rather than in `lib/testimonials.ts` because that module is
 * imported by `HomeContent` (a Client Component) and must never pull the Neon driver into the
 * browser bundle. `import "server-only"` makes that a build error rather than a surprise.
 *
 * TWO THINGS THIS FILE EXISTS TO GUARANTEE:
 *
 * 1. The home page cannot 500 because of the database. The `status` / `consent_display` columns
 *    that `getPublishedTestimonials()` queries are added by `lib/db/migrations.sql` and have NOT
 *    been applied to production yet; a deploy may land first, in which case the query throws
 *    `column "status" does not exist`. Every failure — missing column, missing DATABASE_URL,
 *    connection error, malformed row — degrades to an empty list, logged server-side, and the
 *    page renders its static consented entries exactly as it does today.
 *
 * 2. Consent is re-derived here from the row's own fields, not assumed from the fact that SQL
 *    returned it. `getPublishedTestimonials()` filters on status/published/consent_display in
 *    the WHERE clause; this recomputes the same three facts in TypeScript and hands the result
 *    to `Testimonial.consented`, which the carousel then gates on. If that WHERE clause is ever
 *    loosened, the render-path gate still holds — the DB path does not walk around it.
 */

/**
 * Cache tag for the mapped list. Nothing purges it yet: the dashboard's approve handler is
 * another agent's file. Once it calls `revalidateTag(PUBLISHED_TESTIMONIALS_TAG)` *and*
 * `revalidatePath("/")`, an approval appears immediately instead of at the next ISR window.
 */
export const PUBLISHED_TESTIMONIALS_TAG = "testimonials";

/** Matches `export const revalidate` on `app/page.tsx` — no point caching a row longer than the
 *  page that renders it is allowed to live. */
const REVALIDATE_SECONDS = 3600;

/**
 * First value that parses as a real date, as `YYYY-MM-DD`. Returns `""` when nothing does —
 * `new Date("…").toISOString()` throws a RangeError on an unparseable value, and
 * `buildTestimonialReviewJsonLd()` treats a falsy `date` as "not publishable as schema", so an
 * undated row renders in the carousel but never becomes a `Review` entity with a fake date.
 */
function firstValidIsoDate(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return "";
}

function trimmedOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * `TestimonialRecord` (DB row) -> `Testimonial` (component). Returns `null` for a row with no
 * usable quote, so an approved-but-empty row can never render a blank blockquote. That is a
 * data-integrity drop, deliberately separate from the consent decision below — an unconsented
 * row is still mapped, with `consented: false`, and the carousel's gate is what removes it.
 */
export function toPublicTestimonial(row: TestimonialRecord): Testimonial | null {
  const quote = trimmedOrUndefined(row.quote);
  if (!quote) return null;

  // `consent_display is null` is an admin-authored quote entered through the dashboard form —
  // curated by Karma, not a customer submission — which is why null is permitted here and
  // `REVIEW_CONSENT_PRIVATE` (and any unrecognised value) is not.
  const consentDisplay = row.consent_display ?? null;
  const consented =
    row.status === "approved" &&
    row.published === true &&
    (consentDisplay === REVIEW_CONSENT_PUBLISH || consentDisplay === null);

  const mediaUrl = trimmedOrUndefined(row.media_url);
  const mediaType = row.type === "video" || row.type === "instagram" ? row.type : undefined;

  const rating =
    typeof row.rating === "number" && Number.isFinite(row.rating) && row.rating >= 1 && row.rating <= 5
      ? row.rating
      : undefined;

  return {
    // Namespaced so a DB id can never collide with a static id from `lib/testimonials.ts`
    // when the two lists are concatenated into one keyed render.
    id: `db-${row.id}`,
    // The review form promises "with my role and location, never my name", so `person_label` is
    // usually null. The fallback is the same non-identifying label the static entry uses.
    author: trimmedOrUndefined(row.person_label) ?? "A Humanly client",
    role: trimmedOrUndefined(row.role_label),
    location: trimmedOrUndefined(row.location),
    quote,
    mediaUrl: mediaType ? mediaUrl : undefined,
    mediaType: mediaUrl ? mediaType : undefined,
    transcript: trimmedOrUndefined(row.transcript),
    rating,
    date: firstValidIsoDate(row.submitted_at, row.created_at),
    verified: row.verified === true,
    consented,
  };
}

/**
 * Cached read. `unstable_cache` (rather than a bare call) is deliberate: it keeps `/` in the
 * static/ISR path instead of leaving its rendering mode to depend on how Next treats the Neon
 * driver's uncached `fetch`. Throws on failure — the caller catches, so a transient DB error is
 * never written into the cache and retried an hour later.
 */
const loadPublishedTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const rows = await getPublishedTestimonials();
    return rows
      .map(toPublicTestimonial)
      .filter((entry): entry is Testimonial => entry !== null);
  },
  ["published-testimonials-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: [PUBLISHED_TESTIMONIALS_TAG] },
);

/**
 * THE ONLY ENTRY POINT. Never throws. Returns `[]` when there is no database configured, when
 * the migration has not been applied, or when anything else goes wrong.
 */
export async function getPublishedTestimonialsForDisplay(): Promise<Testimonial[]> {
  if (!hasDatabase()) return [];

  try {
    return await loadPublishedTestimonials();
  } catch (error) {
    // Expected until `lib/db/migrations.sql` has been applied to production. Logged, not
    // surfaced: the home page falls back to its static entries rather than erroring.
    console.error(
      "[testimonials] could not read approved testimonials; falling back to static entries:",
      error,
    );
    return [];
  }
}
