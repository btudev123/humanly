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
      <div className="mx-auto max-w-xl px-margin-mobile py-36 text-center md:px-margin-desktop">
        <div className="rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-10 shadow-pop">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-dark">Resource is still locked</h1>
          <p className="mt-4 text-neutral-500">Payment has not been confirmed for this download link.</p>
          <Link href="/resources" className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop-sm">
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-36 text-center md:px-margin-desktop">
      <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-10 shadow-pop md:p-14">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-dark bg-[#25D366]/15">
          <CheckCircle2 className="text-[#1da851]" size={42} />
        </div>
        <h1 className="font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          {resource.membership ? "Membership active" : "Resource unlocked"}
        </h1>
        <p className="mt-4 text-body-lg leading-relaxed text-neutral-500">{resource.title}</p>
        {resource.membership ? (
          <p className="mt-6 text-neutral-500">
            Welcome aboard. We&apos;ve emailed {order.customer_email} with your access details and
            what to expect each month. Reply to that email any time you need help.
          </p>
        ) : (
          <a
            href={`/api/resources/download?session_id=${encodeURIComponent(sessionId)}&slug=${encodeURIComponent(resource.slug)}`}
            className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm"
          >
            <Download size={18} strokeWidth={2.5} />
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}
