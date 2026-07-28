import { MetadataRoute } from "next";
import { getPublishedResources } from "@/lib/db/repository";
import { resources } from "@/lib/resources";
import { getArticles } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const lastModified = new Date();
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
  const articles = await getArticles();

  // Static pages with high priority
  const staticPages = [
    { url: baseUrl, lastModified, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${baseUrl}/tools`, lastModified, changeFrequency: "weekly" as const, priority: 0.75 },
    { url: `${baseUrl}/resources/managed-out`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/resources/resign-or-stay`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/booking`, lastModified, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/llms-full`, lastModified, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

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
