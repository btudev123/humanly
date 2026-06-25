import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { ResourceUnlockForm } from "@/components/resources/ResourceUnlockForm";
import { getResourceForSlug } from "@/lib/db/repository";
import { aedFromUsdCents, formatAed } from "@/lib/products";
import { getResourceUrl, resources } from "@/lib/resources";

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceForSlug(slug);

  if (!resource) {
    return { title: "Resource Not Found" };
  }

  return {
    title: `${resource.title} | Humanly Resources`,
    description: resource.summary,
    keywords: resource.keywords,
    alternates: { canonical: getResourceUrl(resource) },
    openGraph: {
      title: resource.title,
      description: resource.summary,
      url: getResourceUrl(resource),
      type: "article",
      publishedTime: resource.updatedAt,
      modifiedTime: resource.updatedAt,
      authors: [resource.author],
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceForSlug(slug);

  if (!resource) {
    return (
      <div className="mx-auto max-w-2xl px-margin-mobile py-36 text-center md:px-margin-desktop">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-dark">Resource not found</h1>
        <Link href="/resources" className="mt-6 inline-flex font-bold text-primary-violet underline">
          Back to resources
        </Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": resource.gated ? "Product" : "Article",
    name: resource.title,
    headline: resource.title,
    description: resource.summary,
    url: getResourceUrl(resource),
    dateModified: resource.updatedAt,
    author: { "@type": "Organization", name: resource.author },
    reviewedBy: { "@type": "Person", name: resource.reviewer },
    ...(resource.gated && resource.amount
      ? {
          offers: {
            "@type": "Offer",
            price: resource.amount / 100,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link href="/resources" className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to resources
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-violet">{resource.category}</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.04] tracking-tight text-primary-dark">
          {resource.title}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-neutral-500">{resource.summary}</p>
        <div className="mt-8 grid gap-3 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 text-sm text-neutral-500 sm:grid-cols-3">
          <span>Updated {resource.updatedAt}</span>
          <span>Author: {resource.author}</span>
          <span>Reviewed by {resource.reviewer}</span>
        </div>
        <section className="prose prose-neutral mt-10 max-w-none text-neutral-700">
          <p>
            Use this guide as a practical starting point. It is written for professionals who need
            calm, documented next steps before they decide whether to escalate, negotiate, resign,
            or get legal advice.
          </p>
          <h2 className="text-2xl font-extrabold text-primary-dark">What this helps you do</h2>
          <ul>
            <li>Clarify what is happening and what evidence matters.</li>
            <li>Prepare questions before a difficult HR or manager conversation.</li>
            <li>Separate practical HR strategy from formal legal representation.</li>
          </ul>
          <p>
            Humanly provides HR guidance and coaching, not legal advice. For formal legal action,
            use this resource to prepare better questions for qualified counsel.
          </p>
        </section>
        <section className="mt-10">
          {resource.gated && resource.amount ? (
            <ResourceUnlockForm
              resourceSlug={resource.slug}
              amount={resource.amount}
              priceNote={resource.interval ? "/mo" : undefined}
              membership={resource.membership}
            />
          ) : (
            <a
              href={resource.pdf}
              download
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm"
            >
              <Download size={18} strokeWidth={2.5} />
              Download free PDF
            </a>
          )}
        </section>
        {resource.gated && resource.amount && (
          <aside className="mt-6 rounded-3xl border-2 border-primary-dark/20 bg-surface-container-low p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-primary-violet" size={22} />
              <p className="text-sm leading-relaxed text-neutral-500">
                {resource.membership
                  ? `Membership is ${formatAed(aedFromUsdCents(resource.amount))}/mo. Access is emailed to you after Stripe confirms your first payment.`
                  : `This resource is ${formatAed(aedFromUsdCents(resource.amount))}. Your download is emailed to you and unlocked on screen after Stripe confirms payment.`}
              </p>
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
