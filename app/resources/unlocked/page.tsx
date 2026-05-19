import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";
import { getPaidResourceOrder, getResourceForSlug } from "@/lib/db/repository";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resource Unlocked",
  description: "Your paid Humanly resource is ready to download.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/resources/unlocked") },
};

export default async function ResourceUnlockedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let order = null;

  if (sessionId) {
    try {
      order = await getPaidResourceOrder(sessionId);
    } catch {
      order = null;
    }
  }

  const resource = order ? await getResourceForSlug(order.product_slug) : null;

  if (!sessionId || !order || !resource) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-4xl font-extrabold text-primary-dark">Resource is still locked</h1>
        <p className="mt-4 text-neutral-500">Payment has not been confirmed for this download link.</p>
        <Link href="/resources" className="mt-8 inline-flex rounded-full bg-primary-violet px-8 py-4 text-white">
          Back to resources
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg px-5 py-32 text-center md:px-[64px]">
      <div className="mx-auto max-w-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="text-green-600" size={42} />
        </div>
        <h1 className="text-[32px] font-extrabold leading-[1.2] text-primary-dark md:text-[48px]">
          Resource unlocked
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-500">{resource.title}</p>
        <a
          href={`/api/resources/download?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(resource.slug)}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-violet px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white"
        >
          <Download size={18} />
          Download PDF
        </a>
      </div>
    </div>
  );
}
