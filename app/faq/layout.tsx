import type { Metadata } from "next";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/faq");
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is my employer notified when I book a call?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Humanly does not notify employers, connect to company systems, or share intake details.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods are accepted?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Humanly uses Stripe Checkout for secure card payments. Card details are handled by Stripe.",
      },
    },
    {
      "@type": "Question",
      name: "Is Humanly a law firm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Humanly provides HR guidance and coaching, not legal advice or legal representation.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
      {/* Rendered here because `page.tsx` is a client component; see AboutLayout. */}
      <LatestPosts title="Read more on the blog" className="pb-24" />
    </>
  );
}
