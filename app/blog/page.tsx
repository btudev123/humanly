import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { formatBlogDate } from "@/lib/blog";
import { getArticles, getPageContent } from "@/lib/sanity/queries";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/** Where a reader goes next if no article is the thing they need right now. */
const nextSteps = [
  {
    href: "/tools",
    label: "Free tools",
    note: "Diagnose being managed out, or weigh resign vs stay — no sign-up.",
  },
  {
    href: "/resources",
    label: "Guides & toolkits",
    note: "PIP responses, contract reviews, harassment documentation. Own them for good.",
  },
  {
    href: "/services",
    label: "Advisory services",
    note: "From a 30-minute call to a monthly retainer, priced openly.",
  },
];

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("/blog");

  return buildMetadata({
    title: "Blog | Humanly",
    description:
      "Honest, practical writing on managers, exits, workplace rights, and getting a second opinion before you decide — from Karma Harb and the Humanly advisory team.",
    path: "/blog",
    seo: page?.seo,
  });
}

export default async function BlogPage() {
  const [posts, page] = await Promise.all([getArticles(), getPageContent("/blog")]);

  return (
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      {/* Hero */}
      <section className="relative mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#fda544" className="absolute left-[10%] top-0 hidden h-8 w-8 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[10%] top-6 hidden h-16 w-16 opacity-50 md:block" />

        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <BookOpen size={13} className="text-primary-violet" /> The Humanly Blog
        </span>
        <h1 className="text-h1 mx-auto mt-6 max-w-3xl font-display font-extrabold tracking-tight text-primary-dark">
          {page?.heading || "Clear thinking for hard workplace moments"}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg leading-relaxed text-neutral-500">
          {page?.intro ||
            "Honest, practical writing on managers, exits, and your rights at work — so you can decide with information instead of isolation."}
        </p>
      </section>

      {/* Posts */}
      <section className="mx-auto mt-16 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-7 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="btn-pop group flex flex-col rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-7 shadow-pop-sm sm:p-9"
            >
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em]">
                <span className="rounded-full border-2 border-primary-dark bg-violet-tint px-3 py-1 text-primary-dark">
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-neutral-400">
                  <Clock size={13} /> {post.readingMinutes} min read
                </span>
              </div>

              <h2 className="text-h3 mt-5 font-display font-extrabold leading-tight tracking-tight text-primary-dark">
                {post.title}
              </h2>
              <p className="mt-4 flex-1 text-body-md leading-relaxed text-neutral-500">{post.excerpt}</p>

              <div className="mt-7 flex items-center justify-between border-t-2 border-dashed border-neutral-300 pt-5">
                <div className="text-body-sm">
                  <p className="font-bold text-primary-dark">{post.author?.name}</p>
                  <p className="text-neutral-400">{formatBlogDate(post.publishedAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet">
                  Read
                  <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Who writes this — and the two routes out of the blog. */}
      <section className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <AuthorCard
          author={{
            name: siteConfig.founder,
            role: siteConfig.founderRole,
            linkedinUrl: siteConfig.founderLinkedIn,
          }}
        />
      </section>

      <section className="mx-auto mt-14 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <p className="text-caption font-bold uppercase tracking-[0.16em] text-primary-violet">
          Where to next
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {nextSteps.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="btn-pop group flex flex-col rounded-2xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm"
            >
              <span className="inline-flex items-center gap-1.5 font-display font-bold text-primary-dark">
                {step.label}
                <ArrowRight
                  size={16}
                  strokeWidth={2.5}
                  className="shrink-0 text-primary-violet transition-transform group-hover:translate-x-1"
                />
              </span>
              <span className="mt-2 text-body-sm leading-relaxed text-neutral-500">{step.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
