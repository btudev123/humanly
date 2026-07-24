import { client } from "@/sanity/lib/client";

/** Cache tags used by the Sanity webhook in `app/api/revalidate` to purge on publish. */
export type SanityTag = "post" | "page" | "service" | "resource" | "author" | "siteSettings";

/**
 * Fetch from Sanity, returning `null` on any failure instead of throwing.
 *
 * The whole site is designed to fall back to its in-code content
 * (`lib/blog.ts`, `lib/products.ts`, `lib/resources.ts`) when this returns null,
 * so a Sanity outage, an expired token, or a missing env var degrades to the
 * copy that shipped with the build rather than taking pages down.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  tags: SanityTag[] = [],
): Promise<T | null> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return null;

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: 3600, tags },
    });
  } catch (error) {
    console.error("[sanity] fetch failed, falling back to in-code content:", error);
    return null;
  }
}
