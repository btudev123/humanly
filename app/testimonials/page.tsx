import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Scribble } from "@/components/ui/Scribble";
import { TestimonialsGrid } from "@/components/reviews/TestimonialsCarousel";
import { getPublishedTestimonialsForDisplay } from "@/components/reviews/publishedTestimonials";
import { buildTestimonialReviewJsonLd, getConsentedTestimonials, testimonials } from "@/lib/testimonials";
import { pageMetadata } from "@/lib/seo";

/**
 * `/testimonials` — the full, un-carouselled client stories page.
 *
 * A server shell, for the same reason `app/page.tsx` is one: the moderated rows live behind
 * `getPublishedTestimonialsForDisplay()`, which is `server-only` and must not reach the browser
 * bundle. It never throws — no database, an unapplied migration, or a connection error all return
 * `[]` — so this route cannot 500 because of the review pipeline.
 *
 * The consent gate is NOT re-implemented here. `TestimonialsGrid` filters on `consented === true`
 * itself, before it counts or renders anything, and `getConsentedTestimonials()` applies the same
 * predicate for the count this page uses to choose between the grid and the empty state. Passing
 * the unfiltered merged array to the grid is deliberate — the render path stays the single gate.
 */

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/testimonials");
}

export default async function TestimonialsPage() {
  const dbTestimonials = await getPublishedTestimonialsForDisplay();
  const merged = [...testimonials, ...dbTestimonials];
  const publishedCount = getConsentedTestimonials(dbTestimonials).length;
  const reviewJsonLd = buildTestimonialReviewJsonLd(dbTestimonials);

  return (
    <div className="overflow-clip bg-surface">
      <div className="mx-auto max-w-max-width px-margin-mobile pb-24 pt-32 md:px-margin-desktop md:pt-40">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="relative mb-14 max-w-3xl">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
          <Scribble
            variant="loop"
            color="#9d5cff"
            className="absolute -top-8 right-4 hidden h-24 w-24 opacity-40 md:block"
          />
          <Eyebrow>Client stories</Eyebrow>
          <h1 className="text-h1 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
            In their words, not ours.
          </h1>
          <p className="mt-6 text-body-lg leading-relaxed text-neutral-500">
            Every story below is a real client&apos;s own account of a Humanly consultation,
            published verbatim. Nothing is edited for polish, and nothing appears here until the
            person in it has given permission.
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            <li className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-body-sm font-semibold text-primary-dark">
              <ShieldCheck size={16} strokeWidth={2.5} className="text-primary-violet" aria-hidden="true" />
              Published with permission
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-body-sm font-semibold text-primary-dark">
              <Lock size={16} strokeWidth={2.5} className="text-primary-violet" aria-hidden="true" />
              Names withheld by default
            </li>
          </ul>
        </header>

        {/* ── The stories ────────────────────────────────────────── */}
        <Reveal>
          {publishedCount > 0 ? (
            // The unfiltered merged array is passed on purpose — see the file header.
            <TestimonialsGrid testimonials={merged} title={null} className="" />
          ) : (
            <section className="rounded-3xl border-2 border-dashed border-primary-dark/25 bg-neutral-100 p-8 md:p-12">
              <p className="text-body-md font-semibold text-primary-dark">
                No client stories published yet
              </p>
              <p className="mt-2 max-w-md text-body-sm leading-relaxed text-neutral-500">
                A client&rsquo;s words go here only after they give written permission to publish
                them. Nothing else fills this space in the meantime.
              </p>
            </section>
          )}
        </Reveal>

        {/* ── Why so few, and how they get here ──────────────────── */}
        <Reveal delay={0.05}>
          <section className="mt-12 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-7 md:p-9">
            <h2 className="text-h4 font-display font-bold text-primary-dark">
              Why this page is short
            </h2>
            <p className="mt-3 max-w-2xl text-body-sm leading-relaxed text-neutral-600">
              People come to Humanly during the worst weeks of their working lives, and most would
              rather not have that written down in public. After a session, every client is asked
              for a review, and asked separately whether it may be published — a low rating and a
              &ldquo;please don&rsquo;t publish this&rdquo; five-star both reach Karma, and neither
              publishes itself. What you see here is only the part clients chose to share.
            </p>
          </section>
        </Reveal>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <section className="mt-12 rounded-3xl border-2 border-primary-dark bg-primary-dark p-8 text-on-primary md:p-12">
            <h2 className="text-h3 font-display font-extrabold tracking-tight">
              Your situation, with someone who has seen it before.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-on-primary/75">
              Book a confidential consultation with Karma. Independent, off your employer&apos;s
              books, and on your side of the table.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3 text-body-sm font-bold text-primary-dark shadow-pop-sm"
              >
                Book a session
                <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-6 py-3 text-body-sm font-bold text-on-primary transition-colors hover:border-white/60"
              >
                See what&apos;s included
              </Link>
            </div>
          </section>
        </Reveal>
      </div>

      {/*
        Review JSON-LD — one <script> per consented testimonial that also carries a real, stored
        date. `buildTestimonialReviewJsonLd()` returns `null` rather than an empty array when there
        is nothing publishable, so an undated entry renders on the page without ever becoming a
        `Review` entity with a fabricated `datePublished`.
      */}
      {reviewJsonLd?.map((review, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      ))}
    </div>
  );
}
