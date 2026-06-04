import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ResourcesBrowser } from "@/components/resources/ResourcesBrowser";
import { Scribble } from "@/components/ui/Scribble";
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
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      <ResourcesBrowser resources={publicResources} />
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-center text-on-primary shadow-pop-orange md:p-14">
          <Scribble variant="spiral" color="#ff6a1a" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute bottom-8 left-10 hidden h-8 w-8 animate-float md:block" />
          <div className="relative z-10">
            <ShieldCheck className="mx-auto mb-6 text-accent-orange" size={40} />
            <h2 className="font-display text-h2 font-extrabold tracking-tight">Need something more specific?</h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-body-lg text-on-primary/70">
              Book a Triage session for private, situation-specific guidance tailored to your exact workplace issue.
            </p>
            <Link
              href="/booking"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
            >
              Book Your Triage
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
