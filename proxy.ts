import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api/dashboard(.*)"]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  return clerkHandler(request, event);
}

/**
 * Clerk runs on the admin surface only — never on a public page.
 *
 * This matcher used to cover the whole site. It cost us the search index: on any
 * request without Clerk's `__clerk_db_jwt` cookie, `clerkMiddleware` answers with a
 * 307 to `<instance>.clerk.accounts.dev/v1/client/handshake`, and that endpoint
 * serves `X-Robots-Tag: noindex, nofollow`. A crawler has no cookies, ever — so
 * Googlebot followed the handshake and recorded the homepage as noindex
 * ("'noindex' detected in 'X-Robots-Tag' http header", Search Console, Aug 2026).
 * It was intermittent, and therefore easy to miss, only because Vercel's edge cache
 * absorbed most crawls; every cache miss went to Clerk.
 *
 * `auth()` and `currentUser()` are called from exactly two places
 * (`app/dashboard`, `app/api/dashboard/*`, both via `lib/auth/admin.ts`), so
 * matching those routes is sufficient. Keep it that way: widening this matcher
 * puts a redirect in front of the marketing site again.
 *
 * `scripts/seo-check.mjs` (`npm run seo:check`) fails on exactly this regression.
 */
export const config = {
  matcher: ["/dashboard(.*)", "/api/dashboard(.*)"],
};
