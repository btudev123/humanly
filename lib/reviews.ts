import "server-only";
import crypto from "node:crypto";
import { timingSafeEqualStr } from "@/lib/crypto";

/**
 * See `docs/adr/0001-pricing-currency-availability-reviews.md` (Decision D) for the full
 * rationale, including the flagged deviation from the plan's literal two-segment URL form (this
 * file implements a THREE-segment, self-contained token — see the doc comment on `ReviewToken`
 * below).
 *
 * Stateless, HMAC-signed review-request tokens. No session, no customer account (this site has
 * none — Clerk is admin-only, scoped to `/dashboard`), no DB read required to reject a garbage or
 * expired token. Reuses the same constant-time-compare primitive already used for Cal.com webhook
 * signature verification (`app/api/webhooks/cal/route.ts`'s local `timingSafeEqualStr`), extracted
 * to `lib/crypto.ts` rather than duplicated a third time.
 */

/** Required. Server-only secret — never `NEXT_PUBLIC_`. Present in `.env.example` (added by
 *  Kyle per `docs/adr/CONTRACTS.md`); set the real value in `.env.local` and Vercel before ship. */
const REVIEW_TOKEN_SECRET_ENV = "REVIEW_TOKEN_SECRET" as const;

function getSecret(): string {
  const secret = process.env[REVIEW_TOKEN_SECRET_ENV];
  if (!secret) {
    throw new Error(`${REVIEW_TOKEN_SECRET_ENV} is required to generate or verify review tokens.`);
  }
  return secret;
}

function sign(calBookingUid: string, expiresAt: number, secret: string) {
  return crypto.createHmac("sha256", secret).update(`${calBookingUid}.${expiresAt}`).digest("hex");
}

/** Token lifetime from the moment it's issued (by the cron job), per the plan. */
export const REVIEW_TOKEN_EXPIRY_DAYS = 60;

export type ReviewToken = {
  calBookingUid: string;
  /** Unix seconds. */
  expiresAt: number;
};

/**
 * Build the signed token string for a `/review/<token>` URL.
 *
 * Format: `"<cal_booking_uid>.<expiry_unix>.<sig>"` where
 * `sig = HMAC-SHA256("<cal_booking_uid>.<expiry_unix>", REVIEW_TOKEN_SECRET)`, hex-encoded.
 *
 * This is a THREE-segment token (uid, expiry, signature), not the plan's literally-stated
 * two-segment `<uid>.<sig>` form — flagged and justified in ADR-0001 Decision D: encoding expiry
 * in the token lets `verifyReviewToken` reject an expired token before touching the database at
 * all, which matters because this token gates a public, unauthenticated route
 * (`/review/[token]`). `cal_booking_uid` values from Cal.com don't contain `.` in practice
 * [UNVERIFIED: Cal.com's `uid` format guarantee — Luke should assert this at generation time
 * rather than assume it, since a `uid` containing `.` would make the token ambiguous to split].
 */
export function generateReviewToken(calBookingUid: string, issuedAt?: Date): string {
  if (calBookingUid.includes(".")) {
    // See the doc comment above — a `.` in the uid would make the token ambiguous to split.
    throw new Error(`Cal.com booking uid "${calBookingUid}" contains "." and cannot be tokenized.`);
  }

  const secret = getSecret();
  const issued = issuedAt ?? new Date();
  const expiresAt = Math.floor(issued.getTime() / 1000) + REVIEW_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
  const sig = sign(calBookingUid, expiresAt, secret);

  return `${calBookingUid}.${expiresAt}.${sig}`;
}

export type VerifyReviewTokenResult =
  | { valid: true; calBookingUid: string }
  | { valid: false; reason: "malformed" | "expired" | "bad_signature" };

/**
 * Parse and verify a token from a `/review/<token>` URL path segment. Constant-time signature
 * compare (`lib/crypto.ts`'s `timingSafeEqualStr`). Rejects on malformed shape or expiry BEFORE
 * computing any HMAC, so a request with an obviously garbage token costs one string split, not a
 * hash operation.
 */
export function verifyReviewToken(token: string): VerifyReviewTokenResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };

  const [calBookingUid, expiresAtStr, sig] = parts;
  if (!calBookingUid || !expiresAtStr || !sig) return { valid: false, reason: "malformed" };

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || !Number.isInteger(expiresAt)) {
    return { valid: false, reason: "malformed" };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (expiresAt < nowSeconds) return { valid: false, reason: "expired" };

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false, reason: "malformed" };
  }

  const expected = sign(calBookingUid, expiresAt, secret);
  if (!timingSafeEqualStr(sig, expected)) {
    return { valid: false, reason: "bad_signature" };
  }

  return { valid: true, calBookingUid };
}

/** Build the full `/review/<token>` path for a booking — `absoluteUrl(buildReviewPath(uid))`
 *  (from `lib/site.ts`) gives the absolute URL to put in the review-request email. */
export function buildReviewPath(calBookingUid: string): string {
  return `/review/${generateReviewToken(calBookingUid)}`;
}
