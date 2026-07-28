import { HomeContent } from "@/components/home/HomeContent";
import { LatestPosts } from "@/components/blog/LatestPosts";

/**
 * The home page is a thin server shell.
 *
 * The page itself is a client component (motion, sticky CTA, carousel), so the
 * server-fetched blog strip is composed in here rather than inside it. Metadata and the
 * site-wide JSON-LD stay in the root layout, which owns the "/" Sanity page document.
 */
export default function HomePage() {
  return (
    <>
      <HomeContent />
      {/* Matches HomeContent's own surface so the strip reads as part of the page. */}
      <div className="bg-surface text-on-surface">
        <LatestPosts title="From the Humanly blog" className="pb-24 pt-4" />
      </div>
    </>
  );
}
