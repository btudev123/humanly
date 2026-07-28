import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getArticles } from "@/lib/sanity/queries";
import { cn } from "@/lib/utils";

/**
 * "Latest from the blog" strip.
 *
 * Dropped at the foot of the main marketing pages so the blog isn't an island reachable
 * only from the nav: every significant page links into it, and each article links back
 * out to `/about`, `/booking` and the relevant guide. That reciprocal linking is what
 * makes the articles worth crawling in the first place.
 *
 * Renders nothing when there are no posts, so a page never shows an empty heading.
 */
export async function LatestPosts({
  title = "Latest from the blog",
  limit = 3,
  className,
}: {
  title?: string;
  limit?: number;
  className?: string;
}) {
  const articles = (await getArticles()).slice(0, limit);
  if (articles.length === 0) return null;

  return (
    <section
      className={cn(
        "mx-auto max-w-max-width px-margin-mobile md:px-margin-desktop",
        className ?? "mt-24",
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-h3 font-display font-extrabold tracking-tight text-primary-dark">
          {title}
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet hover:underline"
        >
          Read the blog
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="btn-pop group flex flex-col rounded-2xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm"
          >
            <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="rounded-full border-2 border-primary-dark bg-violet-tint px-2.5 py-0.5 text-primary-dark">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-400">
                <Clock size={12} /> {article.readingMinutes} min
              </span>
            </div>

            <h3 className="text-h4 mt-4 font-display font-bold leading-snug text-primary-dark">
              {article.title}
            </h3>
            <p className="mt-3 flex-1 text-body-sm leading-relaxed text-neutral-500 line-clamp-3">
              {article.excerpt}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet">
              Read
              <ArrowUpRight
                size={15}
                strokeWidth={2.5}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
