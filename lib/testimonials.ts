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
 * THE FIRST ENTRY (`humanly-001`) WAS CLEARED TO PUBLISH ON 2026-09-09 by the site owner,
 * who supplied the quote a second time and instructed that it go live on `/testimonials`.
 * That instruction is the human consent decision this gate exists to wait for. Nothing else
 * about the entry changed:
 * - The quote is real and verbatim. Do not edit, tighten, or paraphrase it.
 * - The client's role, location, and a publish date were still NOT supplied, and stay absent
 *   rather than guessed — no job title, no country, no invented date. The missing date is
 *   why this entry emits no `Review` JSON-LD (see the filter at the bottom of this file);
 *   supply a real one and it becomes eligible automatically.
 * THE SECOND ENTRY (`humanly-002`) WAS CLEARED TO PUBLISH ON 2026-09-11 on the same terms: the
 * site owner supplied the quote and instructed that it be added and published. Same handling —
 * quote verbatim, no role, no location, no date, no rating invented to fill the gaps.
 *
 * A NEW entry still starts at `consented: false`. Only the founder (Karma Harb) can clear
 * one — no agent may flip the flag on its own, and no job title, country or date may be
 * guessed. See NEEDS DATA in docs/copy/2026-09-services-and-booking-copy.md.
 */

import type { Testimonial } from "@/components/reviews/TestimonialsCarousel";
import { siteConfig } from "@/lib/site";

export const testimonials: Testimonial[] = [
  {
    id: "humanly-001",
    // Non-identifying by design: consent to publish is confirmed, but the client's actual
    // role and location still were not supplied. Do not replace this with a guessed title
    // or location — the page's own promise is that names are withheld by default.
    author: "A Humanly client", // [NEEDS DATA: real role + location, once confirmed]
    role: undefined,
    company: undefined,
    location: undefined, // [NEEDS DATA: location]
    quote:
      "One day at work it seemed like the world was against me, and even with experience I couldn't get through that stressful day. I was waiting for an important meeting with management about potential acquisition and my future role in the company, I honestly had no idea what to expect. I was really worried knowing that my previous interaction with one of the people didn't go too well over something that I couldn't even control, so I was definitely in panic mode.\n\nThat was the moment when I booked a consultation with Karma. Her timely response and immediate attention were amazing. She gave me the clarity I needed and pointed out the things I was missing, and advised me how to professionally and respectfully stand my ground. I'm so grateful for her support and for breaking down everything so clearly. Karma's help made a real difference, she can help you see a situation in a different light and approach it with the right knowledge and she will definitely bring her kind soul into the conversation.",
    rating: undefined,
    date: "[NEEDS DATA]", // real ISO date still not supplied — do not guess; excluded from JSON-LD
    verified: true, // the quote itself is a genuine client review; `consented` is the separate publish gate
    consented: true, // cleared by the site owner on 2026-09-09 — see the file header
  },
  {
    id: "humanly-002",
    // Same non-identifying treatment as humanly-001: the client's name, role and location were
    // not supplied with the quote, so none of them are guessed here. The review is about repeated
    // interview coaching — do not turn that into a job title.
    author: "A Humanly client", // [NEEDS DATA: real role + location, once confirmed]
    role: undefined,
    company: undefined,
    location: undefined, // [NEEDS DATA: location]
    quote:
      "Over the years I've had the opportunity to get coaching from Karma many times over and I've had tremendous success in doing so: up until now I've always received an offer from a job application when I practiced with Karma. Her ability to discern what are the key elements of the job and intuit the type of questions one might face in an interview is uncanny and unparalleled. I owe much of my professional successes to Karma's coaching and encouragement.\n\nMost recently, in our last interaction, she helped me understand how to best position myself and my achievements to break into Director-level interviews from the Manager-level. I approached my interview with a courage and a boldness I would not have had without her support.\n\nThat being said, the most important impact of our latest session is that I now feel ready for this career jump and will no longer even consider other manager-level jobs as I am convinced I am ready for the next step. This allows me to both re-focus my efforts in my job search and also pivot my efforts in development and in my current job to better align to that pivot.\n\nI am eternally grateful for the time spent with Karma: I would spend as much time as possible with her.",
    rating: undefined,
    date: "[NEEDS DATA]", // real ISO date still not supplied — do not guess; excluded from JSON-LD
    verified: true, // the quote itself is a genuine client review; `consented` is the separate publish gate
    consented: true, // cleared by the site owner on 2026-09-11 — see the file header
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
  "humanly-002":
    "Her ability to discern what are the key elements of the job and intuit the type of questions one might face in an interview is uncanny and unparalleled. I owe much of my professional successes to Karma's coaching and encouragement.",
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
 * than an empty array. `null` is still the live return value with an empty (or unavailable)
 * database, not a hypothetical: `humanly-001` is consented and rendered, but undated, so it is
 * filtered out here. Consent alone does not buy a `Review` entity — a review joins this output
 * only once it is consented AND carries a parseable date.
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
