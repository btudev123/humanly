import type { Metadata } from "next";
import Link from "next/link";
import { PaidScheduler } from "@/components/booking/PaidScheduler";
import { getPaidOrderBySession } from "@/lib/db/repository";
import { getCalLink, getServiceProduct } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule Your Paid Session",
  description: "Paid Humanly customers can choose a confidential consultation time.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/booking/schedule") },
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <ScheduleBlocked message="Missing Stripe checkout session." />;
  }

  let order = null;
  try {
    order = await getPaidOrderBySession(sessionId);
  } catch (error) {
    return <ScheduleBlocked message="Scheduling is waiting for payment infrastructure to be configured." />;
  }

  if (!order || order.kind !== "consultation") {
    return <ScheduleBlocked message="Payment has not been confirmed for this scheduling link." />;
  }

  const product = getServiceProduct(order.product_slug);
  return <PaidScheduler order={order} calLink={product ? getCalLink(product) : "talkhumanly/triage"} />;
}

function ScheduleBlocked({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <h1 className="text-4xl font-extrabold text-primary-dark">Scheduling is locked</h1>
      <p className="mt-4 text-lg leading-relaxed text-neutral-500">{message}</p>
      <Link
        href="/booking"
        className="mt-8 inline-flex rounded-full bg-primary-violet px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white"
      >
        Return to booking
      </Link>
    </div>
  );
}
