import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { ResourceUnlockForm } from "@/components/resources/ResourceUnlockForm";
import { getResourceForSlug } from "@/lib/db/repository";
import { formatAed } from "@/lib/products";
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
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="text-4xl font-extrabold text-primary-dark">Resource not found</h1>
        <Link href="/resources" className="mt-6 inline-flex text-primary-violet underline">
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
            priceCurrency: "AED",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-neutral-bg px-5 py-28 md:px-[64px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto max-w-3xl">
        <Link href="/resources" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary-violet">
          <ArrowLeft size={16} />
          Back to resources
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-violet">{resource.category}</p>
        <h1 className="mt-4 text-[36px] font-extrabold leading-[1.12] text-primary-dark md:text-[56px]">
          {resource.title}
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-neutral-500">{resource.summary}</p>
        <div className="mt-8 grid gap-3 rounded-lg border border-neutral-300 bg-white p-5 text-sm text-neutral-500 sm:grid-cols-3">
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
            <ResourceUnlockForm resourceSlug={resource.slug} amount={resource.amount} />
          ) : (
            <a
              href={resource.pdf}
              download
              className="inline-flex items-center gap-2 rounded-full bg-primary-violet px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white"
            >
              <Download size={18} />
              Download free PDF
            </a>
          )}
        </section>
        {resource.gated && resource.amount && (
          <aside className="mt-6 rounded-lg border border-neutral-300 bg-white p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-primary-violet" size={22} />
              <p className="text-sm leading-relaxed text-neutral-500">
                This premium resource is {formatAed(resource.amount)}. The download link is generated after
                Stripe confirms payment.
              </p>
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
