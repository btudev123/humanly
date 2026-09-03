/**
 * Shared shapes for the review moderation queue.
 *
 * Produced by `app/api/dashboard/testimonials` (GET), consumed by
 * `components/dashboard/ReviewModerationQueue.tsx`. Types and literals only — deliberately no
 * import from `lib/db/*`, so the client bundle never pulls the Neon driver in behind a type.
 */

/** Row statuses `testimonials.status` can hold — mirrors `TestimonialStatus` in `lib/db/repository.ts`. */
export type ModerationStatus = "pending" | "approved" | "rejected";

/** The two moderation actions the queue offers. `"pending"` is only ever sent by Undo. */
export type ModerationAction = "approve" | "reject";

/**
 * Whether a row may EVER be published, decided on the server from `consent_display`
 * (`docs/lifecycle/2026-09-review-request-sequence.md` §6):
 *
 *  - `publishable`     — the client picked "Yes, you can publish this…" (`REVIEW_CONSENT_PUBLISH`).
 *  - `private`         — the client picked "No, keep this between us." (`REVIEW_CONSENT_PRIVATE`).
 *                        Never approvable. Not offered in the UI, and refused by the SQL in
 *                        `setTestimonialStatus`.
 *  - `admin_authored`  — no customer submission behind it (no `cal_booking_uid`, no
 *                        `submitted_email`): a quote Karma entered herself through the
 *                        "Future testimonials" form, which never writes `consent_display`.
 *                        Approvable on a different consent basis — she sourced it.
 *  - `unrecorded`      — a customer submission with no (or an unrecognised) consent value. Should
 *                        be impossible (`app/api/reviews` validates the enum and always writes
 *                        it), so it means bad or hand-edited data. Treated as private: never
 *                        approvable.
 */
export type ConsentVerdict = "publishable" | "private" | "admin_authored" | "unrecorded";

/** One row of the queue, already sanitised for rendering. */
export type ModerationRow = {
  id: string;
  /** 1–5, or null when absent or out of range — never rendered as a star count when null. */
  rating: number | null;
  /** Trimmed; null when the client left the free-text field empty (it is optional on the form). */
  quote: string | null;
  roleLabel: string | null;
  location: string | null;
  /** ISO 8601, or null if neither `submitted_at` nor `created_at` is readable. */
  submittedAt: string | null;
  /** True when `submittedAt` fell back to `created_at` because `submitted_at` was null. */
  submittedAtIsFallback: boolean;
  status: ModerationStatus;
  verified: boolean;
  consent: ConsentVerdict;
  /** True ONLY for `publishable` / `admin_authored`. The single flag the Approve button hangs off. */
  canApprove: boolean;
};

/** Counts across EVERY submission regardless of status — §5's honest satisfaction signal. */
export type RatingDistribution = {
  /** Index 0 = 1 star … index 4 = 5 stars. */
  counts: number[];
  /** Rows with no rating, or a rating outside 1–5. */
  unrated: number;
  total: number;
};

export type ModerationListResponse = {
  testimonials: ModerationRow[];
  /** How many rows matched the status filter in total, before the page limit. */
  totalMatching: number;
  ratingDistribution: RatingDistribution;
};

/**
 * Page size for the queue. A moderation list is read top to bottom by one person; returning
 * every pending row would make the response (and the DOM) grow without bound if the cron ran for
 * months unattended. The response reports `totalMatching` so the UI can say what is not shown.
 */
export const MODERATION_PAGE_LIMIT = 50;

/** PATCH refusal codes the queue renders a specific message for, rather than a generic error. */
export type ModerationErrorCode = "consent_required" | "consent_unrecorded" | "not_found";
