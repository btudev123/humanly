import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Two categories of route are kept out of the index:
 *
 *   - **Private surfaces** — the admin dashboard, the Sanity Studio, the API.
 *   - **Post-transaction pages** — `/success`, `/booking/schedule`, `/booking/done`,
 *     `/resources/unlocked`. These are only meaningful with a live Stripe session id, so
 *     an indexed copy is a dead end for anyone who lands on it from search.
 *
 * AI crawlers are allowed deliberately. Humanly's audience asks assistants questions like
 * "can my employer put me on a PIP after sick leave" long before they type it into Google,
 * so being quotable there matters more than withholding the content. `/llms.txt` and
 * `/llms-full` exist to make that citation accurate.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  const disallow = [
    "/admin/",
    "/api/",
    "/dashboard/",
    "/studio",
    "/studio/",
    "/sanity",
    "/sanity/",
    "/booking/schedule",
    "/booking/done",
    "/resources/unlocked",
    "/payment-failed",
    "/success",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // Assistants and answer engines: same access as any other crawler, minus the
      // private surfaces above.
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
          "cohere-ai",
          "Meta-ExternalAgent",
          "DuckAssistBot",
        ],
        allow: "/",
        disallow,
      },
      // Archive snapshots of a confidential-advisory site serve no one.
      {
        userAgent: "ia_archiver",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
