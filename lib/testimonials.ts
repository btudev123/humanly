/**
 * Curated client testimonials for the home page carousel.
 *
 * IMPORTANT — READ BEFORE ADDING, EDITING, OR SHIPPING ANY ENTRY IN THIS FILE.
 *
 * The Humanly home page promises no review is published without the client's consent
 * ("Verified clients. Nothing published without consent." — components/home/HomeContent.tsx).
 * Nothing in this file goes live without that client's written consent.
 *
 * `consented` IS the hard gate, and it is now enforced in the render path:
 * `TestimonialsCarousel` and `TestimonialsGrid` both filter on `consented === true`
 * internally — before any length check, index arithmetic, or empty-state decision — so a
 * page passing the raw array (HomeContent does) still cannot publish an unconsented quote,
 * and neither can someone pasting a new entry in below in a hurry. `consented` is a
 * REQUIRED field on the shared `Testimonial` type, so a new entry that omits it fails to
 * typecheck rather than silently defaulting to publishable.
 *
 * THE FIRST ENTRY (`humanly-001`) IS NOT CLEARED TO PUBLISH.
 * - The quote is real and verbatim, supplied by the operator. Do not edit, tighten, or
 *   paraphrase it if you touch this file later.
 * - The client's role, location, and a publish date have NOT been supplied.
 * - Written consent from the client to publish has NOT been confirmed.
 * Only the founder (Karma Harb) can confirm consent and supply the missing facts. Do not
 * guess a job title, a country, or a date, and do not flip `consented` to `true` without
 * that confirmation. See NEEDS DATA in docs/copy/2026-09-services-and-booking-copy.md.
 */

import type { Testimonial } from "@/components/reviews/TestimonialsCarousel";
import { siteConfig } from "@/lib/site";

export const testimonials: Testimonial[] = [
  {
    id: "humanly-001",
    // Non-identifying by design: the client's actual role and location were not supplied
    // by the owner, and consent to publish has not been confirmed. Do not replace this
    // with a guessed title or location.
    author: "A Humanly client", // [NEEDS DATA: real role + location, once confirmed]
    role: undefined,
    company: undefined,
    location: undefined, // [NEEDS DATA: location]
    quote:
      "One day at work it seemed like the world was against me, and even with experience I couldn't get through that stressful day. I was waiting for an important meeting with management about potential acquisition and my future role in the company, I honestly had no idea what to expect. I was really worried knowing that my previous interaction with one of the people didn't go too well over something that I couldn't even control, so I was definitely in panic mode.\n\nThat was the moment when I booked a consultation with Karma. Her timely response and immediate attention were amazing. She gave me the clarity I needed and pointed out the things I was missing, and advised me how to professionally and respectfully stand my ground. I'm so grateful for her support and for breaking down everything so clearly. Karma's help made a real difference, she can help you see a situation in a different light and approach it with the right knowledge and she will definitely bring her kind soul into the conversation.",
    rating: undefined,
    date: "[NEEDS DATA]", // real ISO date required before publish — do not guess
    verified: true, // the quote itself is a genuine client review; `consented` is the separate publish gate
    consented: false, // HARD GATE — do not flip until the founder confirms written consent
  },
];

/**
 * Short pull-quotes for compact placements (cards, meta descriptions) where the full
 * testimonial is too long. Verbatim excerpts only — never reworded, never summarized.
 * Still gated by the parent entry's `consented` flag; do not surface a pull-quote for an
 * entry that isn't cleared to publish.
 */
export const testimonialPullQuotes: Record<string, string> = {
  "humanly-001":
    "Her timely response and immediate attention were amazing. She gave me the clarity I needed and pointed out the things I was missing, and advised me how to professionally and respectfully stand my ground.",
};

/**
 * The one gate every consumer of this file must go through — components AND structured data
 * alike. Mirrors the filter `TestimonialsCarousel`/`TestimonialsGrid` apply internally
 * (`consented === true`); this copy exists for consumers that render `Review` JSON-LD rather
 * than the carousel itself, so schema output can never publish an unconsented quote either.
 *
 * `additional` carries the moderated, database-backed entries mapped by
 * `components/reviews/publishedTestimonials.ts`. They are filtered by exactly the same
 * predicate as the static ones — this module stays pure and client-safe, and the DB path gets
 * no privileged route past the gate. Defaults to `[]` so a caller with no database still works.
 */
export function getConsentedTestimonials(additional: Testimonial[] = []): Testimonial[] {
  return [...testimonials, ...additional].filter((t) => t.consented === true);
}

/**
 * `Review` JSON-LD per `docs/seo/2026-09-restructure-seo-spec.md` §3b — one entity per consented
 * testimonial that also has a real, stored `datePublished` (the placeholder `"[NEEDS DATA]"`
 * string on `humanly-001` is deliberately excluded, not coerced into a fake date). Returns `null`
 * when there is nothing publishable, so the calling page renders no `<script>` tag at all rather
 * than an empty array. With no consented static entry and an empty (or unavailable) database,
 * `null` is the live return value on deploy, not a hypothetical. A database-backed review joins
 * this output only once it is approved with publish consent AND carries a parseable date.
 */
export function buildTestimonialReviewJsonLd(
  additional: Testimonial[] = [],
): Record<string, unknown>[] | null {
  const reviews = getConsentedTestimonials(additional)
    .filter((t) => t.date && t.date !== "[NEEDS DATA]" && !Number.isNaN(new Date(t.date).getTime()))
    .map((t) => ({
      "@context": "https://schema.org",
      "@type": "Review",
      reviewBody: t.quote,
      ...(t.rating
        ? { reviewRating: { "@type": "Rating", ratingValue: String(t.rating), bestRating: "5" } }
        : {}),
      author: { "@type": "Person", name: t.author },
      itemReviewed: {
        "@type": "Organization",
        name: "Humanly HR Advisory",
        url: siteConfig.url,
      },
      datePublished: new Date(t.date).toISOString().slice(0, 10),
    }));

  return reviews.length > 0 ? reviews : null;
}
