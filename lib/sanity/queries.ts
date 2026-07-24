import type { PortableTextBlock } from "@portabletext/types";
import { sanityFetch } from "./fetch";
import { blogPosts, type BlogPost, type BlogBlock } from "@/lib/blog";
import { serviceProducts, type ServiceProduct } from "@/lib/products";
import { resources, type Resource } from "@/lib/resources";
import { siteConfig } from "@/lib/site";

/* ------------------------------------------------------------------ types */

export type SeoFields = {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalOverride?: string;
  noindex?: boolean;
};

export type ArticleAuthor = {
  name: string;
  role: string;
  linkedinUrl?: string;
};

/** Normalised article shape used by the blog routes, whatever the source. */
export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  lead: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  keywords: string[];
  source?: string;
  author: ArticleAuthor;
  body: PortableTextBlock[];
  seo?: SeoFields;
};

/* ------------------------------------------------------- legacy adapters */

/**
 * Convert the hand-written `BlogBlock[]` from `lib/blog.ts` into portable text so
 * that `<Prose>` only ever has to render one format, regardless of whether a post
 * came from Sanity or from the in-code fallback.
 */
function legacyBlocksToPortableText(blocks: BlogBlock[]): PortableTextBlock[] {
  return blocks.flatMap((block, i): PortableTextBlock[] => {
    const key = `legacy-${i}`;

    if (block.type === "callout") {
      return [
        {
          _type: "callout",
          _key: key,
          text: block.text,
          ctaLabel: "Book a confidential call",
          ctaHref: "/booking",
        } as unknown as PortableTextBlock,
      ];
    }

    if (block.type === "list") {
      return block.items.map((item, j) => ({
        _type: "block",
        _key: `${key}-${j}`,
        style: "normal",
        listItem: "bullet",
        level: 1,
        markDefs: [],
        children: [{ _type: "span", _key: `${key}-${j}-s`, text: item, marks: [] }],
      })) as unknown as PortableTextBlock[];
    }

    return [
      {
        _type: "block",
        _key: key,
        style: block.type === "h2" ? "h2" : "normal",
        markDefs: [],
        children: [{ _type: "span", _key: `${key}-s`, text: block.text, marks: [] }],
      } as unknown as PortableTextBlock,
    ];
  });
}

function legacyPostToArticle(post: BlogPost): Article {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    lead: post.lead,
    category: post.category,
    publishedAt: post.publishedAt,
    updatedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    keywords: post.keywords,
    source: post.source,
    author: {
      name: post.author,
      role: post.authorRole,
      linkedinUrl: post.author === siteConfig.founder ? siteConfig.founderLinkedIn : undefined,
    },
    body: legacyBlocksToPortableText(post.blocks),
  };
}

/* ------------------------------------------------------------------ GROQ */

const SEO_PROJECTION = `seo{
  metaTitle,
  metaDescription,
  canonicalOverride,
  noindex,
  "ogImageUrl": ogImage.asset->url
}`;

const ARTICLE_PROJECTION = `{
  "slug": slug.current,
  title,
  excerpt,
  lead,
  category,
  "publishedAt": publishedAt,
  "updatedAt": _updatedAt,
  "readingMinutes": coalesce(readingMinutes, 5),
  "keywords": coalesce(keywords, []),
  source,
  "author": author->{name, role, linkedinUrl},
  "body": body[]{
    ...,
    _type == "image" => { ..., "asset": asset->{url} }
  },
  ${SEO_PROJECTION}
}`;

/* -------------------------------------------------------------- articles */

export async function getArticles(): Promise<Article[]> {
  const docs = await sanityFetch<Article[]>(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) ${ARTICLE_PROJECTION}`,
    {},
    ["post", "author"],
  );

  if (!docs || docs.length === 0) return blogPosts.map(legacyPostToArticle);
  return docs;
}

export async function getArticle(slug: string): Promise<Article | null> {
  const doc = await sanityFetch<Article | null>(
    `*[_type == "post" && slug.current == $slug][0] ${ARTICLE_PROJECTION}`,
    { slug },
    ["post", "author"],
  );

  if (doc) return doc;

  const legacy = blogPosts.find((post) => post.slug === slug);
  return legacy ? legacyPostToArticle(legacy) : null;
}

export async function getArticleCategories(): Promise<string[]> {
  const articles = await getArticles();
  return ["All", ...Array.from(new Set(articles.map((article) => article.category)))];
}

/* ----------------------------------------------------------- page SEO */

export type PageContent = {
  route: string;
  heading?: string;
  intro?: string;
  seo?: SeoFields;
};

export async function getPageContent(route: string): Promise<PageContent | null> {
  return sanityFetch<PageContent | null>(
    `*[_type == "page" && route == $route][0]{route, heading, intro, ${SEO_PROJECTION}}`,
    { route },
    ["page"],
  );
}

/* -------------------------------------------------------------- services */

/**
 * Services with Sanity copy merged over the in-code product.
 *
 * Commerce fields (`amountAed`, `stripePriceEnv`, `calLinkEnv`, `mode`,
 * `needsScheduling`) are taken from `lib/products.ts` unconditionally — Sanity is
 * never allowed to influence what a client is charged or where they're scheduled.
 */
export type MergedService = ServiceProduct & { seo?: SeoFields };

export async function getServices(): Promise<MergedService[]> {
  const docs = await sanityFetch<
    Array<{
      slug: string;
      name?: string;
      subtitle?: string;
      description?: string;
      features?: string[];
      forWho?: string;
      seo?: SeoFields;
    }>
  >(`*[_type == "service" && defined(slug)]{slug, name, subtitle, description, features, forWho, ${SEO_PROJECTION}}`, {}, ["service"]);

  const bySlug = new Map((docs ?? []).map((doc) => [doc.slug, doc]));

  return serviceProducts.map((product) => {
    const copy = bySlug.get(product.slug);
    if (!copy) return product;

    return {
      ...product,
      name: copy.name || product.name,
      subtitle: copy.subtitle || product.subtitle,
      description: copy.description || product.description,
      features: copy.features?.length ? copy.features : product.features,
      forWho: copy.forWho || product.forWho,
      seo: copy.seo,
    };
  });
}

/* ------------------------------------------------------------- resources */

export type MergedResource = Resource & { seo?: SeoFields };

export async function getResourceCopy(): Promise<MergedResource[]> {
  const docs = await sanityFetch<
    Array<{
      slug: string;
      title?: string;
      summary?: string;
      audience?: string;
      keywords?: string[];
      seo?: SeoFields;
    }>
  >(`*[_type == "resource" && defined(slug)]{slug, title, summary, audience, keywords, ${SEO_PROJECTION}}`, {}, ["resource"]);

  const bySlug = new Map((docs ?? []).map((doc) => [doc.slug, doc]));

  return resources.map((resource) => {
    const copy = bySlug.get(resource.slug);
    if (!copy) return resource;

    return {
      ...resource,
      title: copy.title || resource.title,
      summary: copy.summary || resource.summary,
      audience: copy.audience || resource.audience,
      keywords: copy.keywords?.length ? copy.keywords : resource.keywords,
      seo: copy.seo,
    };
  });
}

/** Single merged resource by slug — used by the `/resources/[slug]` detail page. */
export async function getResourceCopyBySlug(slug: string): Promise<MergedResource | undefined> {
  const all = await getResourceCopy();
  return all.find((resource) => resource.slug === slug);
}

/* --------------------------------------------------------- site settings */

export type SiteSettings = {
  organizationName?: string;
  organizationDescription?: string;
  sameAs?: string[];
  defaultSeo?: SeoFields;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings | null>(
    `*[_type == "siteSettings"][0]{organizationName, organizationDescription, sameAs, "defaultSeo": defaultSeo{metaTitle, metaDescription, "ogImageUrl": ogImage.asset->url}}`,
    {},
    ["siteSettings"],
  );
}
