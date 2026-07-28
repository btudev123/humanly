import { resources } from "@/lib/resources";
import { serviceProducts } from "@/lib/products";

/**
 * Keyword-driven internal linking for articles.
 *
 * Every article should hand the reader — and a crawler — a route deeper into the site
 * rather than a dead end. Rather than hard-coding the same three links onto every post,
 * this scores the site's own destinations against the article's keywords, title and
 * category, so a piece about PIPs surfaces the PIP guide and a piece about interviews
 * surfaces interview prep.
 *
 * Deterministic by design: the same article always produces the same links, which keeps
 * statically generated pages stable between builds.
 */

export type RelatedLink = {
  href: string;
  label: string;
  note: string;
};

/** Free interactive tools. These aren't in `resources.ts` — they're their own pages. */
const TOOL_LINKS: (RelatedLink & { terms: string[] })[] = [
  {
    href: "/resources/managed-out",
    label: "Are You Being Managed Out?",
    note: "A free 10-question diagnostic",
    terms: [
      "managed out",
      "pip",
      "performance improvement plan",
      "letter of expectation",
      "bad manager",
      "toxic manager",
      "documentation",
    ],
  },
  {
    href: "/resources/resign-or-stay",
    label: "Resign or Stay?",
    note: "A weighted decision framework",
    terms: [
      "resign",
      "quit",
      "exit",
      "stay",
      "burnout",
      "decision",
      "notice period",
      "second opinion",
    ],
  },
];

/** Advisory services worth surfacing from an article, with the terms they answer to. */
const SERVICE_TERMS: Record<string, string[]> = {
  "interview-prep": ["interview", "job search", "hiring", "offer", "cv", "resume"],
  "dubai-job-search": ["job search", "dubai", "relocation", "cv", "market"],
  "uae-relocation-qa": ["relocation", "visa", "uae", "expat", "rights"],
  "document-review": ["contract", "letter", "notice", "settlement", "severance", "offer"],
  "individual-advisory": [],
};

function normalise(value: string) {
  return value.toLowerCase();
}

/** How many of `terms` appear anywhere in the article's own vocabulary. */
function score(haystack: string, terms: string[]) {
  return terms.reduce((total, term) => (haystack.includes(normalise(term)) ? total + 1 : total), 0);
}

/**
 * Up to `limit` internal links for an article, most relevant first.
 *
 * Always returns something: when nothing scores, it falls back to the two free tools and
 * the resource hub, so no article ever renders an empty "keep going" block.
 */
export function getRelatedLinks(
  article: { title: string; category: string; keywords?: string[]; excerpt?: string },
  limit = 3,
): RelatedLink[] {
  const haystack = normalise(
    [article.title, article.category, article.excerpt ?? "", ...(article.keywords ?? [])].join(" "),
  );

  const scored: { link: RelatedLink; weight: number }[] = [];

  for (const tool of TOOL_LINKS) {
    const { terms, ...link } = tool;
    // Tools are free and immediately useful, so they get a small head start over a
    // paid resource of equal keyword relevance.
    scored.push({ link, weight: score(haystack, terms) * 2 + 1 });
  }

  for (const resource of resources) {
    scored.push({
      link: {
        href: `/resources/${resource.slug}`,
        label: resource.title,
        note: resource.summary,
      },
      weight: score(haystack, [...resource.keywords, resource.title]) * 2,
    });
  }

  for (const product of serviceProducts) {
    const terms = SERVICE_TERMS[product.slug];
    if (!terms?.length) continue;
    scored.push({
      link: {
        href: `/booking?service=${product.slug}`,
        label: product.name,
        note: product.subtitle,
      },
      weight: score(haystack, terms) * 2,
    });
  }

  const ranked = scored
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.link.label.localeCompare(b.link.label))
    .map((entry) => entry.link);

  const fallback: RelatedLink = {
    href: "/resources",
    label: "The Humanly resource hub",
    note: "Guides, scripts and toolkits you own for good",
  };

  const deduped: RelatedLink[] = [];
  for (const link of [...ranked, fallback]) {
    if (deduped.length >= limit) break;
    if (!deduped.some((existing) => existing.href === link.href)) deduped.push(link);
  }

  return deduped;
}
