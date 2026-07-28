import "server-only";

import { client } from "@/sanity/lib/client";

/** Cache tags used by the Sanity webhook in `app/api/revalidate` to purge on publish. */
export type SanityTag = "post" | "page" | "service" | "resource" | "author" | "siteSettings";

/**
 * Server-side read client.
 *
 * A token is optional by design: the `production` dataset is currently public, so
 * unauthenticated reads work. Supplying one (a Viewer token in
 * `SANITY_API_READ_TOKEN`, or the Editor token as a fallback) means the site keeps
 * rendering if the dataset is ever flipped to private — which is the safer setting,
 * since a public dataset also exposes unpublished drafts over the API.
 *
 * `perspective: 'published'` on the base client keeps drafts out of the response
 * either way, so an authenticated read never leaks work-in-progress to visitors.
 */
const readToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN || undefined;

const readClient = readToken ? client.withConfig({ token: readToken }) : client;

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
    return await readClient.fetch<T>(query, params, {
      next: { revalidate: 3600, tags },
    });
  } catch (error) {
    console.error("[sanity] fetch failed, falling back to in-code content:", error);
    return null;
  }
}
