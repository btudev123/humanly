import crypto from "node:crypto";

/**
 * Constant-time string compare, matching the primitive `app/api/webhooks/cal/route.ts` already
 * uses for its own webhook-signature check (`timingSafeEqualStr`, defined locally there).
 * Extracted here so `lib/reviews.ts` and `app/api/cron/review-requests/route.ts` (both new,
 * ADR-0001 Decision D) share one implementation instead of a third copy-paste — flagged as worth
 * doing in the ADR's doc comment on `verifyReviewToken`. The Cal webhook's own local copy is left
 * as-is; not touched here.
 */
export function timingSafeEqualStr(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
