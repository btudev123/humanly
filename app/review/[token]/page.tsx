import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarX2, Link2Off, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Scribble } from "@/components/ui/Scribble";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { recordFunnelEvent } from "@/lib/analytics/funnel";
import { REVIEW_CONSENT_PRIVATE, REVIEW_CONSENT_PUBLISH } from "@/lib/db/repository";
import { REVIEW_TOKEN_EXPIRY_DAYS, verifyReviewToken } from "@/lib/reviews";

/**
 * The page the review-request email links to (`lib/reviews.ts` → `buildReviewPath`). One
 * customer, one booking, one signed link — see ADR-0001 Decision D and
 * `docs/lifecycle/2026-09-review-request-sequence.md`.
 *
 * `lib/reviews.ts` is `server-only`, so verification happens here and only the opaque token
 * string is handed to the client form (the API re-verifies it on POST — this page's check is
 * what decides which of the three states to render, never what authorises the write).
 */

/** A signed, per-customer URL. Nothing here may be cached across requests or indexed. */
export const dynamic = "force-dynamic";

/**
 * Hand-rolled rather than built with `buildMetadata()`: that helper only emits
 * `{ index: false, follow: true }`, and only when handed a Sanity `seo.noindex` field, and it
 * always attaches `alternates.canonical` — which on this route would publish a canonical URL
 * containing the signed token and point it at a path that 404s without one. `/payment-failed`
 * sets its robots directly for the same reason; this follows that precedent. `/review/` is also
 * disallowed in `app/robots.ts` and absent from `app/sitemap.ts`.
 */
export const metadata: Metadata = {
  title: "Share how your session went | Humanly",
  description: "A private link for Humanly clients to rate a session and say whether it can be published.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

/**
 * `review_page_view` — `docs/lifecycle/2026-09-review-request-sequence.md` §5. Fired only for a
 * verified token, so the invalid and expired states never inflate the denominator of the
 * response-rate calculation.
 *
 * Two deliberate omissions:
 *  - **The token is never recorded.** It is a live credential for this booking's review link;
 *    `path` is the bare route, not the URL that was requested.
 *  - **No `product_slug`.** Resolving it means a `cal_booking_uid` → `bookings` → `orders` join,
 *    and no repository helper does that for a single booking today
 *    (`getBookingsEligibleForReviewRequest` is the cron's batch query and takes no argument).
 *    Rather than adding a repository function from the frontend, the event carries
 *    `calBookingUid`, which is the join key — the same per-service cut is still available later,
 *    from one query, without changing this page.
 */
async function recordReviewPageView(calBookingUid: string) {
  try {
    await recordFunnelEvent({
      event: "review_page_view",
      path: "/review",
      metadata: { calBookingUid },
    });
  } catch {
    // Analytics must never be the reason someone cannot leave a review.
  }
}

function ReviewShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-clip bg-surface pb-24">
      <header className="relative mx-auto max-w-2xl px-margin-mobile pt-32 text-center md:px-margin-desktop md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-h1 mx-auto mt-6 font-display font-extrabold tracking-tight text-primary-dark">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-500">{intro}</p>
      </header>

      <main className="mx-auto mt-10 max-w-2xl px-margin-mobile md:px-margin-desktop">{children}</main>
    </div>
  );
}

/** Shared shape for the two dead-link states, so neither reads as more informative than the other. */
function DeadLinkPanel({
  icon,
  heading,
  body,
}: {
  icon: ReactNode;
  heading: string;
  body: ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-violet">
        {icon}
      </span>
      <h2 className="text-h3 mt-4 font-extrabold text-primary-dark">{heading}</h2>
      <p className="mt-2 text-body-md text-neutral-500">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="mailto:hello@talkhumanly.com?subject=Review%20link"
          className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3 text-[14px] font-bold text-primary-dark shadow-pop-sm"
        >
          Email us for a new link
        </a>
        <Link
          href="/"
          className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-6 py-3 text-[14px] font-bold text-primary-dark shadow-pop-sm"
        >
          Back to Humanly
        </Link>
      </div>
    </div>
  );
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const verification = verifyReviewToken(token);

  if (!verification.valid) {
    // `malformed` and `bad_signature` are deliberately indistinguishable on screen: telling a
    // caller which of the two failed turns this page into a signature oracle. `expired` is not
    // secret — a link that has simply run out is worth naming, so the person knows a fresh one
    // would work.
    if (verification.reason === "expired") {
      return (
        <ReviewShell
          eyebrow="Review link"
          title="This link has expired"
          intro="Review links stay open for a while after a session, then close."
        >
          <DeadLinkPanel
            icon={<CalendarX2 size={24} strokeWidth={2.5} />}
            heading={`Links last ${REVIEW_TOKEN_EXPIRY_DAYS} days`}
            body="If you would still like to tell us how the session went, email us and we will send a fresh link. There is no deadline on our side."
          />
        </ReviewShell>
      );
    }

    return (
      <ReviewShell
        eyebrow="Review link"
        title="This link is not valid"
        intro="We could not open a review from this address."
      >
        <DeadLinkPanel
          icon={<Link2Off size={24} strokeWidth={2.5} />}
          heading="Try the link in your email"
          body="Links sometimes break when they are copied by hand or wrap across two lines. Open the one in your email again, or email us and we will send a new one."
        />
      </ReviewShell>
    );
  }

  await recordReviewPageView(verification.calBookingUid);

  return (
    <div className="overflow-clip bg-surface pb-24">
      <header className="relative mx-auto max-w-2xl px-margin-mobile pt-32 text-center md:px-margin-desktop md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble
          variant="star-fill"
          color="#fda544"
          className="absolute left-[10%] top-28 hidden h-7 w-7 animate-float md:block"
        />
        <Eyebrow>Two minutes, entirely optional</Eyebrow>
        <h1 className="text-h1 mx-auto mt-6 font-display font-extrabold tracking-tight text-primary-dark">
          How was your{" "}
          <span className="relative inline-block">
            session
            <Scribble
              variant="underline-bold"
              color="#fda544"
              strokeWidth={5}
              className="absolute -bottom-3 left-0 h-4 w-full"
            />
          </span>
          ?
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
          A rating, and anything you want to add. Karma reads every one herself. Nothing you write
          here goes to your employer.
        </p>
      </header>

      <main className="mx-auto mt-10 max-w-2xl px-margin-mobile md:px-margin-desktop">
        <ReviewForm
          token={token}
          // The two `testimonials.consent_display` keys, passed through from the repository so the
          // client bundle does not import it (and with it the Neon client) and so the literals are
          // never retyped in the form.
          consentValues={{ publish: REVIEW_CONSENT_PUBLISH, private: REVIEW_CONSENT_PRIVATE }}
        />

        <div className="mt-6 grid gap-3 rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-body-sm text-neutral-500 sm:grid-cols-3">
          {[
            "One review per session",
            "Published only if you say yes",
            "Role and location only, never your name",
          ].map((item) => (
            <span key={item} className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary-violet" />
              {item}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
