import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { blogPosts, getBlogPost, getBlogUrl, formatBlogDate } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Humanly Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: getBlogUrl(post) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: getBlogUrl(post),
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

// Related internal links surfaced at the foot of every post.
const relatedLinks = [
  {
    href: "/resources/managed-out",
    label: "Are You Being Managed Out?",
    note: "A free 10-question diagnostic",
  },
  {
    href: "/resources/manager-conflict-script",
    label: "Manager Conflict Script Pack",
    note: "Word-for-word scripts for hard conversations",
  },
  {
    href: "/resources/resign-or-stay",
    label: "Resign or Stay?",
    note: "A weighted decision framework",
  },
];

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: getBlogUrl(post),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: post.author, jobTitle: post.authorRole },
    publisher: { "@type": "Organization", name: siteConfig.legalName },
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to blog
        </Link>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-violet">
          {post.category}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.04] tracking-tight text-primary-dark">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500">
          <span>
            By <span className="font-bold text-primary-dark">{post.author}</span>, {post.authorRole}
          </span>
          <span className="text-neutral-300">·</span>
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span className="text-neutral-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} /> {post.readingMinutes} min read
          </span>
        </div>

        <p className="mt-8 text-xl font-medium leading-relaxed text-primary-dark">{post.lead}</p>

        <div className="mt-10 space-y-6">
          {post.blocks.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  className="pt-4 font-display text-[1.7rem] font-extrabold leading-tight tracking-tight text-primary-dark"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="space-y-3 pl-1">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3 leading-relaxed text-neutral-600">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-violet" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.type === "callout") {
              return (
                <div
                  key={i}
                  className="rounded-3xl border-2 border-primary-dark bg-violet-tint p-6 sm:p-8"
                >
                  <p className="text-lg font-semibold leading-relaxed text-primary-dark">
                    {block.text}
                  </p>
                  <Link
                    href="/booking"
                    className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-3.5 text-[15px] font-bold text-primary-dark shadow-pop-sm"
                  >
                    Book a confidential call
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </Link>
                </div>
              );
            }
            return (
              <p key={i} className="text-lg leading-relaxed text-neutral-600">
                {block.text}
              </p>
            );
          })}
        </div>

        {post.source && (
          <p className="mt-10 border-t-2 border-dashed border-neutral-300 pt-5 text-sm italic text-neutral-400">
            Source cited: {post.source}
          </p>
        )}

        {/* Related internal links */}
        <section className="mt-14">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">
            Keep going
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-pop group flex flex-col rounded-2xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm"
              >
                <span className="inline-flex items-center gap-1.5 font-display font-bold leading-snug text-primary-dark">
                  {link.label}
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2.5}
                    className="shrink-0 text-primary-violet transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                <span className="mt-2 text-sm text-neutral-500">{link.note}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="mx-auto mt-12 max-w-xl text-center text-xs leading-relaxed text-neutral-400">
          This article is for information only and does not constitute legal or HR advice. For
          personalised guidance, book a confidential consultation.
        </p>
      </article>
    </div>
  );
}
