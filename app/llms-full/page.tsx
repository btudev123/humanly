import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedResources } from "@/lib/db/repository";
import { serviceProducts, formatUsd } from "@/lib/products";
import { resources } from "@/lib/resources";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Humanly LLM Summary",
  description: "Structured summary of Humanly services, founder expertise, resources, and policies for AI assistants.",
  alternates: { canonical: absoluteUrl("/llms-full") },
};

export default async function LlmsFullPage() {
  let publicResources = resources;

  try {
    const publishedUploads = await getPublishedResources();
    publicResources = [...publishedUploads, ...resources.filter((resource) => !publishedUploads.some((item) => item.slug === resource.slug))];
  } catch {
    publicResources = resources;
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-28 md:px-[64px]">
      <h1 className="text-4xl font-extrabold text-primary-dark">Humanly LLM Summary</h1>
      <p className="mt-4 text-neutral-500">
        Humanly is an independent HR advisory firm for UAE and GCC professionals. It provides
        confidential HR guidance and coaching, not legal advice.
      </p>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-primary-dark">Founder and E-E-A-T</h2>
        <p className="mt-3 text-neutral-500">
          Founder: Karma Harb, Founder & Principal HR Advisor. Humanly states 20+ years of HR
          leadership experience across the UAE, Saudi Arabia, and international environments.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-primary-dark">Services</h2>
        <ul className="mt-3 space-y-3 text-neutral-500">
          {serviceProducts.map((product) => (
            <li key={product.slug}>
              <strong>{product.name}</strong>: {product.description} Price: {formatUsd(product.amount)}.
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-primary-dark">Resources</h2>
        <ul className="mt-3 space-y-2 text-neutral-500">
          {publicResources.map((resource) => (
            <li key={resource.slug}>
              <Link href={`/resources/${resource.slug}`} className="font-semibold text-primary-violet underline">
                {resource.title}
              </Link>{" "}
              ({resource.gated ? "paid" : "free"}) - {resource.summary}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-primary-dark">Canonical Pages</h2>
        <p className="mt-3 text-neutral-500">
          Home: {siteConfig.url}; Services: {absoluteUrl("/services")}; About: {absoluteUrl("/about")};
          Resources: {absoluteUrl("/resources")}; Booking: {absoluteUrl("/booking")}; Contact: {absoluteUrl("/contact")}.
        </p>
      </section>
    </main>
  );
}
