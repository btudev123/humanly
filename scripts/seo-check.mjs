#!/usr/bin/env node
/**
 * Indexability guard.
 *
 * In August 2026 Search Console reported the homepage as
 * `noindex detected in 'X-Robots-Tag' http header` — an infrastructure-level header
 * that no amount of reading the repo would have revealed, and that nothing in the
 * build would have caught. This script closes that gap: it asks the deployed site
 * the same question Googlebot asks, for every URL the sitemap advertises.
 *
 *   node scripts/seo-check.mjs                        # production
 *   node scripts/seo-check.mjs http://localhost:3001  # a dev server or preview
 *
 * Exits non-zero if any URL is unreachable, carries a noindex (header or meta), or
 * declares a canonical that disagrees with the sitemap.
 */

const BASE = (process.argv[2] || process.env.SEO_CHECK_BASE_URL || "https://talkhumanly.com").replace(/\/$/, "");

const GOOGLEBOT_UA =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 " +
  "(compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": GOOGLEBOT_UA, accept: "text/html,application/xhtml+xml,*/*" },
    redirect: "manual",
  });
  return { res, body: await res.text() };
}

function attr(html, re) {
  const match = html.match(re);
  return match ? match[1] : null;
}

/** Robots.txt must let `*` in and point at the sitemap. */
async function checkRobotsTxt() {
  const failures = [];
  const { res, body } = await get(`${BASE}/robots.txt`);

  if (res.status !== 200) {
    failures.push(`robots.txt returned ${res.status}`);
    return failures;
  }

  // The `*` group runs until the next blank-line-separated group.
  const starGroup = body.split(/\n\s*\n/).find((group) => /^user-agent:\s*\*/im.test(group)) || "";
  if (!/^allow:\s*\/\s*$/im.test(starGroup)) {
    failures.push("robots.txt has no `Allow: /` for `User-Agent: *`");
  }
  if (/^disallow:\s*\/\s*$/im.test(starGroup)) {
    failures.push("robots.txt blocks the whole site for `User-Agent: *`");
  }
  if (!/^sitemap:\s*\S+sitemap\.xml/im.test(body)) {
    failures.push("robots.txt does not declare a sitemap");
  }

  return failures;
}

/** One page: reachable, no noindex from either channel, self-referencing canonical. */
async function checkUrl(url) {
  const failures = [];
  let res, body;

  try {
    ({ res, body } = await get(url));
  } catch (error) {
    return [`request failed: ${error.message}`];
  }

  if (res.status !== 200) {
    failures.push(`status ${res.status}${res.headers.get("location") ? ` → ${res.headers.get("location")}` : ""}`);
    // A redirect or error has no meaningful body to inspect further.
    return failures;
  }

  const xRobots = res.headers.get("x-robots-tag");
  if (xRobots && /noindex|none/i.test(xRobots)) {
    failures.push(`X-Robots-Tag: ${xRobots}`);
  }

  const metaRobots = attr(body, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  if (metaRobots === null) {
    failures.push("no <meta name=\"robots\">");
  } else if (/noindex|none/i.test(metaRobots)) {
    failures.push(`meta robots: ${metaRobots}`);
  }

  const canonical = attr(body, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  if (!canonical) {
    failures.push("no <link rel=\"canonical\">");
  } else if (canonical.replace(/\/$/, "") !== url.replace(/\/$/, "")) {
    failures.push(`canonical points to ${canonical}`);
  }

  return failures;
}

async function main() {
  console.log(`Checking indexability of ${BASE}\n`);

  const robotsFailures = await checkRobotsTxt();
  console.log(
    robotsFailures.length
      ? `${red("FAIL")}  /robots.txt\n        ${robotsFailures.join("\n        ")}`
      : `${green("ok")}    /robots.txt`,
  );

  const { res: sitemapRes, body: sitemapBody } = await get(`${BASE}/sitemap.xml`);
  if (sitemapRes.status !== 200) {
    console.error(`\n${red("FAIL")}  /sitemap.xml returned ${sitemapRes.status} — nothing to check.`);
    process.exit(1);
  }

  const urls = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) {
    console.error(`\n${red("FAIL")}  /sitemap.xml lists no URLs.`);
    process.exit(1);
  }
  console.log(`${green("ok")}    /sitemap.xml ${dim(`(${urls.length} URLs)`)}\n`);

  // Sequential on purpose: a burst of parallel Googlebot-UA requests against
  // production is the kind of thing that trips rate limiting or WAF rules.
  let failed = 0;
  for (const url of urls) {
    const failures = await checkUrl(url);
    const path = url.replace(BASE, "") || "/";
    if (failures.length) {
      failed += 1;
      console.log(`${red("FAIL")}  ${path}\n        ${failures.join("\n        ")}`);
    } else {
      console.log(`${green("ok")}    ${path}`);
    }
  }

  const total = failed + robotsFailures.length;
  console.log("");
  if (total > 0) {
    console.error(red(`${failed} of ${urls.length} URLs failed${robotsFailures.length ? ", plus robots.txt" : ""}.`));
    process.exit(1);
  }
  console.log(green(`All ${urls.length} URLs are indexable.`));
}

main().catch((error) => {
  console.error(red(`seo-check crashed: ${error.stack || error.message}`));
  process.exit(1);
});
