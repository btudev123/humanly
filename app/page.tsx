import { HomeContent } from "@/components/home/HomeContent";
import { getPublishedTestimonialsForDisplay } from "@/components/reviews/publishedTestimonials";
import { LatestPosts } from "@/components/blog/LatestPosts";

/**
 * ISR, matching the hour used by `sanityFetch` and by `/blog`. Made explicit because the page
 * now has a second data source: without a revalidate window a fully static `/` would never
 * re-render, so a testimonial approved in `/dashboard` would not appear until the next deploy.
 */
export const revalidate = 3600;

/**
 * The home page is a thin server shell.
 *
 * The page itself is a client component (motion, sticky CTA, carousel), so the
 * server-fetched blog strip is composed in here rather than inside it. Metadata and the
 * site-wide JSON-LD stay in the root layout, which owns the "/" Sanity page document.
 *
 * Approved testimonials are read here too, for the same reason: `HomeContent` is a Client
 * Component and must not reach the database. `getPublishedTestimonialsForDisplay()` never
 * throws — it returns `[]` when there is no database, when the `status`/`consent_display`
 * migration has not been applied yet, or on any other failure — so this page cannot 500
 * because of the review pipeline, and falls back to the static consented entries.
 */
export default async function HomePage() {
  const dbTestimonials = await getPublishedTestimonialsForDisplay();

  return (
    <>
      <HomeContent dbTestimonials={dbTestimonials} />
      {/* Matches HomeContent's own surface so the strip reads as part of the page. */}
      <div className="bg-surface text-on-surface">
        <LatestPosts title="From the Humanly blog" className="pb-24 pt-4" />
      </div>
    </>
  );
}
