import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getArticle, getArticles } from "@/lib/sanity/queries";
import { formatBlogDate } from "@/lib/blog";
import { getRelatedLinks } from "@/lib/related";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, absoluteUrl } from "@/lib/site";
import { AuthorCard, resolveAuthorLinkedIn } from "@/components/blog/AuthorCard";
import { Prose } from "@/components/ui/Prose";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Post Not Found", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: `${article.title} | Humanly Blog`,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    seo: article.seo,
    keywords: article.keywords,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: [article.author?.name].filter(Boolean) as string[],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([getArticle(slug), getArticles()]);

  if (!article) {
    notFound();
  }

  const moreArticles = allArticles.filter((item) => item.slug !== article.slug).slice(0, 2);

  const url = absoluteUrl(`/blog/${article.slug}`);
  const author = article.author;
  const authorLinkedIn = resolveAuthorLinkedIn(author);
  // Internal links chosen from the article's own keywords rather than a fixed list, so
  // each post routes readers to the guide, tool or service that actually follows on.
  const relatedLinks = getRelatedLinks(article);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: author?.name,
      jobTitle: author?.role,
      ...(authorLinkedIn ? { sameAs: [authorLinkedIn] } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.svg") },
    },
    keywords: article.keywords.join(", "),
  };

  // Breadcrumbs give Google an explicit path back to /blog and the homepage,
  // which is what surfaces the breadcrumb trail in place of a raw URL in results.
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-body-sm text-neutral-500">
            <li>
              <Link href="/" className="hover:text-primary-violet">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-300">
              /
            </li>
            <li>
              <Link href="/blog" className="hover:text-primary-violet">
                Blog
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral-300">
              /
            </li>
            <li className="font-semibold text-primary-dark" aria-current="page">
              {article.category}
            </li>
          </ol>
        </nav>

        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-body-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to blog
        </Link>

        <p className="text-caption font-bold uppercase tracking-[0.2em] text-primary-violet">
          {article.category}
        </p>
        <h1 className="text-h1 mt-4 break-words font-display font-extrabold tracking-tight text-primary-dark">
          {article.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-neutral-500">
          <span>
            By{" "}
            {authorLinkedIn ? (
              <a
                href={authorLinkedIn}
                target="_blank"
                rel="me noopener"
                title={`${author?.name} on LinkedIn`}
                className="font-bold text-primary-dark underline decoration-primary-violet/50 underline-offset-4 transition-colors hover:text-primary-violet"
              >
                {author?.name}
              </a>
            ) : (
              <span className="font-bold text-primary-dark">{author?.name}</span>
            )}
            , {author?.role}
          </span>
          <span className="text-neutral-300">·</span>
          <span>{formatBlogDate(article.publishedAt)}</span>
          <span className="text-neutral-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} /> {article.readingMinutes} min read
          </span>
        </div>

        {/* Front-loaded answer: the lead resolves the question before the body starts. */}
        <p className="mt-8 text-body-lg font-medium leading-relaxed text-primary-dark">
          {article.lead}
        </p>

        <div className="mt-10">
          <Prose value={article.body} />
        </div>

        {article.source && (
          <p className="mt-10 border-t-2 border-dashed border-neutral-300 pt-5 text-body-sm italic text-neutral-400">
            Source cited: {article.source}
          </p>
        )}

        {/* Author card — E-E-A-T signal plus a route back into /about and /booking. */}
        <AuthorCard author={author} className="mt-14" />

        {/* Related internal links */}
        <section className="mt-14">
          <p className="text-caption font-bold uppercase tracking-[0.16em] text-primary-violet">
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
                <span className="mt-2 text-body-sm text-neutral-500">{link.note}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Article-to-article links: keeps every post one click from the rest of the blog. */}
        {moreArticles.length > 0 && (
          <section className="mt-14">
            <p className="text-caption font-bold uppercase tracking-[0.16em] text-primary-violet">
              More from the blog
            </p>
            <ul className="mt-4 divide-y-2 divide-dashed divide-neutral-300 border-y-2 border-dashed border-neutral-300">
              {moreArticles.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group flex items-start justify-between gap-4 py-4 transition-colors hover:text-primary-violet"
                  >
                    <span className="min-w-0">
                      <span className="block font-display font-bold leading-snug text-primary-dark group-hover:text-primary-violet">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-body-sm text-neutral-500">
                        {item.category} · {item.readingMinutes} min read
                      </span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={2.5}
                      className="mt-1 shrink-0 text-primary-violet transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet hover:underline"
            >
              See every article
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </section>
        )}

        <p className="mx-auto mt-12 max-w-xl text-center text-caption leading-relaxed text-neutral-400">
          This article is for information only and does not constitute legal or HR advice. For{" "}
          <Link href="/booking" className="font-semibold text-primary-violet hover:underline">
            personalised guidance, book a confidential consultation
          </Link>
          .
        </p>
      </article>
    </div>
  );
}
