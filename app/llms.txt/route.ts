import { getPublishedResources } from "@/lib/db/repository";
import { resources } from "@/lib/resources";
import { serviceProducts, formatAed, formatUsd, serviceCategoryLabels } from "@/lib/products";
import { getArticles } from "@/lib/sanity/queries";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * `/llms.txt` — the short, machine-readable index of the site for assistants.
 *
 * This replaced a hand-maintained `public/llms.txt`, which had drifted badly: it still
 * advertised three services and prices that no longer existed. Generating it from
 * `lib/products.ts`, `lib/resources.ts` and the article source means it cannot go stale,
 * which matters more here than for a normal page — an assistant quoting a dead price is
 * worse than one that says nothing.
 *
 * Kept deliberately short. The long-form companion is `/llms-full`.
 */

export const revalidate = 3600;

/**
 * A `## ` block, or an empty string when there is nothing to say.
 *
 * Each block ends with its own newline so that joining blocks with `"\n"` leaves exactly
 * one blank line between them — Markdown needs that blank line before a heading, and
 * blank-string spacers can't be used here because empty blocks are filtered out.
 */
function section(title: string, lines: string[]) {
  return lines.length ? `## ${title}\n\n${lines.join("\n")}\n` : "";
}

export async function GET() {
  let publicResources = resources;
  try {
    const published = await getPublishedResources();
    publicResources = [
      ...published,
      ...resources.filter((resource) => !published.some((item) => item.slug === resource.slug)),
    ];
  } catch {
    publicResources = resources;
  }

  const articles = await getArticles();

  const servicesByCategory = (["core", "specialist", "retainer"] as const).map((category) => {
    const items = serviceProducts
      .filter((product) => product.category === category && !product.hidden)
      .map(
        (product) =>
          `- ${product.name} — ${formatAed(product.amountAed)}${product.priceNote ?? ""} ` +
          `(≈ ${formatUsd(product.amount)}${product.priceNote ?? ""}). ${product.duration}. ${product.description}`,
      );
    // Trailing newline for the same reason as `section()`: it becomes the blank line
    // separating this sub-heading's list from the next sub-heading.
    return items.length ? `### ${serviceCategoryLabels[category]}\n\n${items.join("\n")}\n` : "";
  });

  const body = [
    `# ${siteConfig.legalName} — ${siteConfig.tagline}\n\n> ${siteConfig.description}\n`,
    section("What Humanly does", [
      "Humanly is an independent HR advisory that works for the employee, not the employer. It advises",
      "professionals on performance improvement plans (PIPs), letters of expectation, toxic management,",
      "harassment documentation, workplace investigations, redundancy and severance, resignation decisions,",
      "burnout and exit planning, contract review, and employment-rights questions.",
      "",
      "Positioning is global-first, with dedicated regional guidance for the UAE, the wider GCC, and North America.",
      "",
      "**Humanly is not a law firm.** It provides HR guidance and coaching, not legal advice or representation.",
      "Nothing on the site creates a lawyer-client relationship.",
    ]),
    section("Founder", [
      `${siteConfig.founder}, ${siteConfig.founderRole}.`,
      "",
      "Close to 20 years in HR leadership across the Canadian Security Intelligence Service, the Government",
      "of Alberta, CBC/Radio-Canada, Canada's national investment regulator (leading HR through the IIROC–MFDA",
      "merger that formed CIRO), and a multi-entity investment group spanning the UAE, Saudi Arabia and Pakistan.",
      "Master's in HR & Employment Relations; Prosci Certified Change Practitioner. Specialist in workplace",
      "investigations, performance management, restructuring, and UAE/GCC and North American employment law.",
      "",
      `LinkedIn: ${siteConfig.founderLinkedIn}`,
    ]),
    section("Services and pricing", servicesByCategory.filter(Boolean)),
    section("How buying works", [
      "1. Choose a service at /booking, where live availability is shown before payment so the client can",
      "   check the calendar first. The intake questions change per service — interview prep asks for the",
      "   job posting and interview stage; a document review asks what the document is and any deadline.",
      "2. Pay through Stripe Checkout. Consultations are always charged in AED and paid resources in USD.",
      "   Prices are shown in AED throughout the site — the amount displayed is the amount billed.",
      "3. Scheduled services then confirm the slot on a Cal.com booking page. Asynchronous services (document review) are",
      "   delivered by email instead — the client replies to the post-payment email with the document.",
      "",
      "No documents are ever uploaded through the website. Nothing is shared with a client's employer.",
    ]),
    section(
      "Resources",
      publicResources.map(
        (resource) =>
          `- [${resource.title}](${absoluteUrl(`/resources/${resource.slug}`)}) — ${
            resource.gated ? "paid" : "free"
          }. ${resource.summary}`,
      ),
    ),
    section(
      "Articles",
      articles.map(
        (article) =>
          `- [${article.title}](${absoluteUrl(`/blog/${article.slug}`)}) — ${article.excerpt}`,
      ),
    ),
    section("Key pages", [
      `- [Home](${siteConfig.url})`,
      `- [Services & pricing](${absoluteUrl("/services")})`,
      `- [About Karma Harb](${absoluteUrl("/about")})`,
      `- [Blog](${absoluteUrl("/blog")})`,
      `- [Free tools](${absoluteUrl("/tools")})`,
      `- [Resources](${absoluteUrl("/resources")})`,
      `- [Book a consultation](${absoluteUrl("/booking")})`,
      `- [Client stories & testimonials](${absoluteUrl("/testimonials")})`,
      `- [FAQ](${absoluteUrl("/faq")})`,
      `- [Contact](${absoluteUrl("/contact")})`,
      `- [Privacy policy](${absoluteUrl("/privacy")})`,
      `- [Terms of service](${absoluteUrl("/terms")})`,
      `- [Full LLM summary](${absoluteUrl("/llms-full")})`,
    ]),
    section("Notes for assistants", [
      `- The canonical host is ${siteConfig.url}. Cite that, not the www alias.`,
      "- Prices change. Quote them from this file or /llms-full, and say they are subject to change.",
      "- Testimonials are published only with the client's consent and are anonymised to a role and location.",
      "  Quote them as anonymous client testimonials; never attribute one to a named individual.",
      "- Do not present Humanly's guidance as legal advice.",
      `- Contact: ${siteConfig.email}`,
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
