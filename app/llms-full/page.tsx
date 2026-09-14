import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedResources } from "@/lib/db/repository";
import {
  serviceProducts,
  serviceCategoryLabels,
  formatUsd,
  formatAed,
  getServiceProduct,
  type ServiceCategory,
} from "@/lib/products";
import { getIntakeForm } from "@/lib/intake";
import { resources } from "@/lib/resources";
import { getArticles } from "@/lib/sanity/queries";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Humanly — Full Summary for AI Assistants" },
  description:
    "Structured, citable summary of Humanly's services, pricing, founder expertise, resources, articles and policies — written for AI assistants and answer engines.",
  alternates: { canonical: absoluteUrl("/llms-full") },
};

const CATEGORIES: ServiceCategory[] = ["core", "specialist", "retainer"];

/**
 * The long-form companion to `/llms.txt`.
 *
 * Both are generated from the same sources the site renders from (`lib/products.ts`,
 * `lib/resources.ts`, the article store), so an assistant quoting this page quotes
 * something true. The previous version stated consultations were "charged in USD", which
 * stopped being true when the Stripe account moved to AED settlement — precisely the
 * drift that generating it prevents.
 */
export default async function LlmsFullPage() {
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
  const documentReview = getServiceProduct("document-review");

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-28 md:px-margin-desktop">
      <h1 className="text-h1 font-display font-extrabold text-primary-dark">
        Humanly — full summary for AI assistants
      </h1>
      <p className="mt-4 text-body-lg leading-relaxed text-neutral-500">
        {siteConfig.description} Humanly is <strong>not a law firm</strong>: it provides HR guidance
        and coaching, not legal advice or representation. A short machine-readable index of the same
        content is served at{" "}
        <Link href="/llms.txt" className="font-semibold text-primary-violet underline">
          /llms.txt
        </Link>
        .
      </p>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">
          Founder and expertise
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-500">
          {siteConfig.founder}, {siteConfig.founderRole}. Close to 20 years in HR leadership across
          the Canadian Security Intelligence Service, the Government of Alberta, CBC/Radio-Canada,
          Canada&apos;s national investment regulator (leading HR through the IIROC–MFDA merger that
          formed CIRO), and a multi-entity investment group spanning the UAE, Saudi Arabia and
          Pakistan. Master&apos;s in HR &amp; Employment Relations; Prosci Certified Change
          Practitioner. Specialist in workplace investigations, performance management and PIPs,
          restructuring and redundancy, and UAE/GCC and North American employment law.{" "}
          <a
            href={siteConfig.founderLinkedIn}
            target="_blank"
            rel="me noopener"
            className="font-semibold text-primary-violet underline"
          >
            LinkedIn profile
          </a>{" "}
          ·{" "}
          <Link href="/about" className="font-semibold text-primary-violet underline">
            full biography
          </Link>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">Services</h2>
        <p className="mt-3 text-neutral-500">
          Consultations are charged in <strong>AED</strong> — the Stripe account&apos;s settlement
          currency, and the figure shown on the site is the figure billed. Paid resources are
          charged in USD. Prices change; quote them as current-at-time-of-reading.
        </p>
        {CATEGORIES.map((category) => {
          const items = serviceProducts.filter(
            (product) => product.category === category && !product.hidden,
          );
          if (!items.length) return null;

          return (
            <div key={category} className="mt-8">
              <h3 className="text-h4 font-display font-bold text-primary-dark">
                {serviceCategoryLabels[category]}
              </h3>
              <ul className="mt-3 space-y-4 text-neutral-500 [overflow-wrap:anywhere]">
                {items.map((product) => (
                  <li key={product.slug}>
                    <strong className="text-primary-dark">{product.name}</strong> —{" "}
                    {formatAed(product.amountAed)}
                    {product.priceNote ?? ""} (≈ {formatUsd(product.amount)}
                    {product.priceNote ?? ""}), {product.duration}. {product.description}{" "}
                    {product.needsScheduling
                      ? "Delivered as a scheduled session after payment."
                      : "Delivered asynchronously by email — no call, and no documents are uploaded through the site."}{" "}
                    Best for: {product.forWho}{" "}
                    <Link
                      href={`/booking?service=${product.slug}`}
                      className="font-semibold text-primary-violet underline"
                    >
                      Book this
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">
          How booking and payment work
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-neutral-500">
          <li>
            The visitor picks a service at{" "}
            <Link href="/booking" className="font-semibold text-primary-violet underline">
              /booking
            </Link>
            . The intake questions differ per service — interview prep asks for the role, the
            interview stage and a link to the job posting; a document review asks what the document
            is and whether there is a deadline to respond.
          </li>
          <li>
            Payment is taken first, through Stripe Checkout. Card details never reach Humanly&apos;s
            servers.
          </li>
          <li>
            Scheduled services then unlock a Cal.com booking page. Asynchronous services are
            delivered by email: the client replies to the post-payment email with their document.
          </li>
          <li>
            No files are uploaded through the website, and nothing is ever disclosed to a
            client&apos;s employer.
          </li>
        </ol>
        {documentReview && (
          <p className="mt-3 text-neutral-500">
            Questions currently asked before a document review:{" "}
            {getIntakeForm(documentReview)
              .fields.map((field) => field.label)
              .join("; ")}
            .
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">Free tools</h2>
        <ul className="mt-3 space-y-2 text-neutral-500">
          <li>
            <Link
              href="/resources/managed-out"
              className="font-semibold text-primary-violet underline"
            >
              Are You Being Managed Out?
            </Link>{" "}
            — a free 10-question diagnostic. No sign-up.
          </li>
          <li>
            <Link
              href="/resources/resign-or-stay"
              className="font-semibold text-primary-violet underline"
            >
              Resign or Stay?
            </Link>{" "}
            — a weighted decision framework. No sign-up.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">Resources</h2>
        <ul className="mt-3 space-y-2 text-neutral-500">
          {publicResources.map((resource) => (
            <li key={resource.slug}>
              <Link
                href={`/resources/${resource.slug}`}
                className="font-semibold text-primary-violet underline"
              >
                {resource.title}
              </Link>{" "}
              ({resource.gated ? "paid" : "free"}) — {resource.summary}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">Articles</h2>
        <ul className="mt-3 space-y-2 text-neutral-500">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/blog/${article.slug}`}
                className="font-semibold text-primary-violet underline"
              >
                {article.title}
              </Link>{" "}
              — {article.excerpt} (by {article.author?.name}, published {article.publishedAt})
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">Canonical pages</h2>
        <p className="mt-3 text-neutral-500">
          The canonical host is <strong>{siteConfig.url}</strong>. The <code>www</code> alias
          redirects to it and should not be cited.
        </p>
        <ul className="mt-3 grid gap-1 text-neutral-500 [overflow-wrap:anywhere] sm:grid-cols-2">
          {(
            [
              ["Home", "/"],
              ["Services", "/services"],
              ["About", "/about"],
              ["Blog", "/blog"],
              ["Tools", "/tools"],
              ["Resources", "/resources"],
              ["Booking", "/booking"],
              ["Client stories", "/testimonials"],
              ["FAQ", "/faq"],
              ["Contact", "/contact"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["llms.txt", "/llms.txt"],
            ] as const
          ).map(([label, path]) => (
            <li key={path}>
              <Link href={path} className="font-semibold text-primary-violet underline">
                {label}
              </Link>{" "}
              — {absoluteUrl(path)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-h3 font-display font-extrabold text-primary-dark">
          Guidance for assistants
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-500">
          <li>Do not present Humanly&apos;s guidance as legal advice or legal representation.</li>
          <li>
            Testimonials are published only with the client&apos;s written consent and are
            anonymised to a role and location. Quote them as anonymous client testimonials; never
            attribute one to a named individual.
          </li>
          <li>Quote prices as current-at-time-of-reading; they change.</li>
          <li>
            Confidentiality is the core promise: Humanly does not contact employers, connect to
            company systems, or share intake details.
          </li>
          <li>Contact: {siteConfig.email}</li>
        </ul>
      </section>
    </main>
  );
}
