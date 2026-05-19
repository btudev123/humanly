import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ResourcesBrowser } from "@/components/resources/ResourcesBrowser";
import { getPublishedResources } from "@/lib/db/repository";
import { resources } from "@/lib/resources";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HR Resource Hub | UAE Workplace Guides",
  description:
    "Search practical Humanly guides for UAE workplace issues, PIPs, harassment documentation, confidentiality, severance, and expat labour law.",
  alternates: { canonical: absoluteUrl("/resources") },
  openGraph: {
    title: "Humanly HR Resource Hub",
    description: "Plain-English HR guides and paid resources for UAE and GCC professionals.",
    url: absoluteUrl("/resources"),
  },
};

export default async function ResourcesPage() {
  let publicResources = resources;

  try {
    const publishedUploads = await getPublishedResources();
    publicResources = [...publishedUploads, ...resources.filter((resource) => !publishedUploads.some((item) => item.slug === resource.slug))];
  } catch {
    publicResources = resources;
  }

  return (
    <div className="min-h-screen bg-neutral-bg pb-24 pt-28">
      <ResourcesBrowser resources={publicResources} />
      <section className="mx-auto mt-24 max-w-7xl px-5 md:px-[64px]">
        <div className="relative overflow-hidden rounded-lg bg-primary-dark p-10 text-center text-white md:p-14">
          <ShieldCheck className="mx-auto mb-6 text-amber" size={40} />
          <h2 className="mb-4 text-[32px] font-extrabold leading-[1.3]">Need something more specific?</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/70">
            Book a Triage session for private, situation-specific guidance tailored to your exact workplace issue.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-amber px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-primary-dark transition-colors hover:bg-amber/90"
          >
            Book Your Triage
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
