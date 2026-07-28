import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { getPageContent, type SeoFields } from "@/lib/sanity/queries";
import { PAGE_META } from "@/lib/pageMeta";

type BuildMetadataInput = {
  /** Fallback title used when Sanity has no `metaTitle`. */
  title: string;
  /** Fallback description used when Sanity has no `metaDescription`. */
  description: string;
  /** Site-relative path, e.g. "/blog/some-post". Used to build the canonical. */
  path: string;
  seo?: SeoFields | null;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/**
 * Single place where a page's `Metadata` is assembled.
 *
 * Precedence is always Sanity → in-code fallback, never the reverse, so leaving a
 * CMS field blank keeps the copy that shipped with the build instead of emitting an
 * empty title or description.
 *
 * The canonical is always built from `absoluteUrl()` (which resolves against the apex
 * host in `siteConfig.url`) unless an explicit override is set — `www` 308-redirects, so
 * emitting it here would point every canonical at a redirect.
 */
export function buildMetadata({
  title,
  description,
  path,
  seo,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataInput): Metadata {
  const resolvedTitle = seo?.metaTitle || title;
  const resolvedDescription = seo?.metaDescription || description;
  const canonical = seo?.canonicalOverride || absoluteUrl(path);
  const ogImage = seo?.ogImageUrl;

  return {
    // `absolute` so the page owns its full title. Without it, the root layout's
    // `title.template` ("%s | Humanly — HR with Dignity") appends a second brand
    // suffix to titles that already end in "| Humanly".
    title: { absolute: resolvedTitle },
    description: resolvedDescription,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical },
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      type,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      ...(type === "article"
        ? {
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
            ...(authors?.length ? { authors } : {}),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

/**
 * `generateMetadata` for a fixed marketing route in one line.
 *
 * Pulls the route's Sanity `page` document (for CMS SEO overrides) and falls back
 * to the in-code copy in `PAGE_META`. Used by the per-route `layout.tsx` files so a
 * client-component page can still have server-fetched, Sanity-driven metadata.
 */
export async function pageMetadata(
  route: keyof typeof PAGE_META,
  overrides: Partial<BuildMetadataInput> = {},
): Promise<Metadata> {
  const page = await getPageContent(route);
  return buildMetadata({
    title: PAGE_META[route].title,
    description: PAGE_META[route].description,
    path: route,
    seo: page?.seo,
    ...overrides,
  });
}
