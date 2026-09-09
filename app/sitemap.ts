import { MetadataRoute } from "next";
import { getPublishedResources } from "@/lib/db/repository";
import { resources } from "@/lib/resources";
import { getArticles, getPageUpdatedAtByRoute } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

/**
 * Static routes and how often they turn over.
 *
 * `route` is the Sanity `page` document key, used to look up an honest `lastmod`.
 * Routes with no `page` document (the two standalone resource guides, `/llms-full`)
 * carry no `lastmod` at all — Google discounts a `lastmod` it judges unreliable, and
 * an omitted one is better than a fabricated one.
 */
const STATIC_ROUTES = [
  { route: "/", changeFrequency: "weekly" as const, priority: 1.0 },
  { route: "/services", changeFrequency: "weekly" as const, priority: 0.9 },
  { route: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { route: "/resources", changeFrequency: "weekly" as const, priority: 0.8 },
  { route: "/blog", changeFrequency: "weekly" as const, priority: 0.75 },
  { route: "/tools", changeFrequency: "weekly" as const, priority: 0.75 },
  { route: "/resources/managed-out", changeFrequency: "monthly" as const, priority: 0.7 },
  { route: "/resources/resign-or-stay", changeFrequency: "monthly" as const, priority: 0.7 },
  { route: "/booking", changeFrequency: "weekly" as const, priority: 0.9 },
  { route: "/testimonials", changeFrequency: "monthly" as const, priority: 0.6 },
  { route: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
  { route: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
  { route: "/llms-full", changeFrequency: "weekly" as const, priority: 0.5 },
  { route: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { route: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  let publicResources = resources;

  try {
    const publishedUploads = await getPublishedResources();
    publicResources = [...publishedUploads, ...resources.filter((resource) => !publishedUploads.some((item) => item.slug === resource.slug))];
  } catch {
    publicResources = resources;
  }

  // Articles come from the same source the blog routes render, so a post published in
  // Studio appears here without a deploy — and `_updatedAt` gives an honest lastmod
  // instead of the publish date frozen in code.
  const [articles, pageUpdatedAt] = await Promise.all([
    getArticles(),
    getPageUpdatedAtByRoute(),
  ]);

  const staticPages = STATIC_ROUTES.map(({ route, changeFrequency, priority }) => {
    const updatedAt = pageUpdatedAt.get(route);
    return {
      url: route === "/" ? baseUrl : `${baseUrl}${route}`,
      ...(updatedAt ? { lastModified: new Date(updatedAt) } : {}),
      changeFrequency,
      priority,
    };
  });

  const resourcePages = publicResources.map((resource) => ({
    url: `${baseUrl}/resources/${resource.slug}`,
    lastModified: new Date(resource.updatedAt),
    changeFrequency: "monthly" as const,
    priority: resource.gated ? 0.55 : 0.65,
  }));

  const blogPages = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...resourcePages, ...blogPages];
}
