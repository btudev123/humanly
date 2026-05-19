import { MetadataRoute } from "next";
import { getPublishedResources } from "@/lib/db/repository";
import { resources } from "@/lib/resources";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://talkhumanly.com";
  const lastModified = new Date();
  let publicResources = resources;

  try {
    const publishedUploads = await getPublishedResources();
    publicResources = [...publishedUploads, ...resources.filter((resource) => !publishedUploads.some((item) => item.slug === resource.slug))];
  } catch {
    publicResources = resources;
  }

  // Static pages with high priority
  const staticPages = [
    { url: baseUrl, lastModified, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/resources`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 },
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

  return [...staticPages, ...resourcePages];
}
