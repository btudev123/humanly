import type { Metadata } from "next";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about");
}

/**
 * The blog strip is rendered from the layout rather than the page: `page.tsx` is a
 * client component (framer-motion), and the article list is fetched on the server.
 */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LatestPosts title="Writing from Karma" className="pb-24" />
    </>
  );
}
