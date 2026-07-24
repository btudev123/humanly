import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import { ResourcesBrowser } from "@/components/resources/ResourcesBrowser";
import { Scribble } from "@/components/ui/Scribble";
import { getPublishedResources } from "@/lib/db/repository";
import { getResourceCopy } from "@/lib/sanity/queries";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/resources");
}

export default async function ResourcesPage() {
  // Sanity marketing copy merged over the in-code catalogue (falls back to in-code
  // when Studio is empty). Pricing/gating still come from lib/resources.ts.
  const resources = await getResourceCopy();
  let publicResources = resources;

  try {
    const publishedUploads = await getPublishedResources();
    publicResources = [
      ...publishedUploads,
      ...resources.filter((r) => !publishedUploads.some((u) => u.slug === r.slug)),
    ];
  } catch {
    publicResources = resources;
  }

  return (
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      {/* Page header */}
      <section className="relative mx-auto mb-12 max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#fda544" className="absolute left-[10%] top-0 hidden h-8 w-8 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[10%] top-6 hidden h-16 w-16 opacity-50 md:block" />

        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <span className="h-2 w-2 rounded-full bg-accent-orange" /> Resource Hub
        </span>
        <h1 className="text-h1 mx-auto mt-6 max-w-3xl font-display font-extrabold tracking-tight text-primary-dark">
          Practical guides for moments HR makes complicated.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
          Guides, scripts, toolkits, and courses written by HR experts. Pay once, own it forever.
        </p>

        {/* Link to free tools */}
        <Link
          href="/tools"
          className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-6 py-3 text-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint"
        >
          <Wrench size={15} strokeWidth={2.5} />
          Looking for free tools? They live here
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </section>

      <ResourcesBrowser resources={publicResources} />

      {/* Bottom CTA */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-center text-on-primary shadow-pop-orange md:p-14">
          <Scribble variant="spiral" color="#fda544" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute bottom-8 left-10 hidden h-8 w-8 animate-float md:block" />
          <div className="relative z-10">
            <ShieldCheck className="mx-auto mb-6 text-accent-orange" size={40} />
            <h2 className="text-h2 font-display font-extrabold tracking-tight">Need something more specific?</h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-body-lg text-on-primary/70">
              Book a confidential consultation for private, situation-specific guidance tailored to your exact workplace issue.
            </p>
            <Link
              href="/booking"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
            >
              Book a Consultation
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
