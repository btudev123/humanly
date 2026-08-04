/**
 * One-time (idempotent) seed of the Sanity dataset from the site's in-code content.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/seed-sanity.ts
 *
 * It transforms the existing sources of truth — lib/blog.ts, lib/products.ts,
 * lib/resources.ts, lib/site.ts, lib/pageMeta.ts — into Sanity documents so that
 * Studio (/studio) opens pre-populated with exactly what is already live. Every
 * document uses a deterministic `_id`, so re-running overwrites rather than
 * duplicates. Commerce fields (price, Stripe, Cal, gating) are intentionally NOT
 * seeded — those stay in code; Sanity only owns marketing copy + SEO.
 *
 * Auth: SANITY_API_WRITE_TOKEN (from .env.local, which is gitignored) is preferred,
 * falling back to SANITY_AUTH_TOKEN or the Sanity CLI's own login
 * (~/.config/sanity/config.json). Nothing secret is written to disk or committed.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@sanity/client";

import { projectId, dataset, apiVersion } from "../sanity/env";
import { blocksToPortableText, blogPosts } from "../lib/blog";
import { serviceProducts } from "../lib/products";
import { resources } from "../lib/resources";
import { siteConfig } from "../lib/site";
import { PAGE_META } from "../lib/pageMeta";

/* ------------------------------------------------------------------- auth */

function resolveToken(): string {
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN;
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), ".config", "sanity", "config.json"), "utf8"),
    );
    if (cfg.authToken) return cfg.authToken as string;
  } catch {
    /* fall through */
  }
  throw new Error(
    "No Sanity write token. Set SANITY_API_WRITE_TOKEN in .env.local and run with " +
      "`npx tsx --env-file=.env.local scripts/seed-sanity.ts`, or run `npx sanity login`.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: resolveToken(),
  useCdn: false,
});

/* -------------------------------------------------------------- documents */

// IDs deliberately use NO dots. A "." in a Sanity document id creates a path
// namespace that a public dataset's default `path("*")` read grant excludes, which
// would make these docs invisible to the token-less `sanityFetch`.
const AUTHOR_ID = "author-karma-harb";

function buildDocs() {
  const docs: Record<string, unknown>[] = [];

  // Author (single canonical author; role matches the current blog byline).
  docs.push({
    _id: AUTHOR_ID,
    _type: "author",
    name: siteConfig.founder,
    role: "Founder of Humanly",
    bio: "Senior HR leader turned independent advisor. Karma has sat on both sides of the table — issuing PIPs and running investigations inside companies, and now advising the professionals on the receiving end.",
    linkedinUrl: siteConfig.founderLinkedIn,
  });

  // Blog posts.
  for (const post of blogPosts) {
    docs.push({
      _id: `post-${post.slug}`,
      _type: "post",
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      excerpt: post.excerpt,
      lead: post.lead,
      body: blocksToPortableText(post.blocks),
      ...(post.source ? { source: post.source } : {}),
      author: { _type: "reference", _ref: AUTHOR_ID },
      category: post.category,
      publishedAt: new Date(`${post.publishedAt}T09:00:00Z`).toISOString(),
      readingMinutes: post.readingMinutes,
      keywords: post.keywords,
    });
  }

  // Service copy (marketing fields only).
  for (const s of serviceProducts) {
    docs.push({
      _id: `service-${s.slug}`,
      _type: "service",
      slug: s.slug,
      name: s.name,
      subtitle: s.subtitle,
      description: s.description,
      features: s.features,
      forWho: s.forWho,
    });
  }

  // Resource copy (marketing fields only).
  for (const r of resources) {
    docs.push({
      _id: `resource-${r.slug}`,
      _type: "resource",
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      audience: r.audience,
      keywords: r.keywords,
    });
  }

  // Site settings singleton (feeds the Organization / WebSite JSON-LD).
  docs.push({
    _id: "siteSettings",
    _type: "siteSettings",
    organizationName: siteConfig.name,
    organizationDescription: siteConfig.description,
    sameAs: [siteConfig.founderLinkedIn],
    defaultSeo: {
      metaTitle: PAGE_META["/"].title,
      metaDescription: PAGE_META["/"].description,
    },
  });

  // Page SEO docs — one per fixed route, pre-filled with the live default copy.
  for (const [route, meta] of Object.entries(PAGE_META)) {
    docs.push({
      _id: `page-${route === "/" ? "home" : route.replace(/\//g, "")}`,
      _type: "page",
      route,
      seo: { metaTitle: meta.title, metaDescription: meta.description },
    });
  }

  return docs;
}

/* -------------------------------------------------------------------- run */

const MANAGED_TYPES = ["post", "page", "service", "resource", "author", "siteSettings"];

async function main() {
  // Purge any previously-seeded docs (including legacy dotted-id ones) so a re-run
  // never leaves duplicates or orphaned ids behind.
  await client.delete({ query: `*[_type in [${MANAGED_TYPES.map((t) => `"${t}"`).join(",")}]]` });

  const docs = buildDocs();
  const tx = docs.reduce((t, doc) => t.createOrReplace(doc as never), client.transaction());
  await tx.commit({ visibility: "async" });
  console.log(`✓ Seeded ${docs.length} documents into ${projectId}/${dataset}.`);
  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    const t = d._type as string;
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  console.table(counts);
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
