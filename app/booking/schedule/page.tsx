import type { Metadata } from "next";
import Link from "next/link";
import { PaidScheduler } from "@/components/booking/PaidScheduler";
import { getPaidOrderBySession, markOrderPaidFromSession } from "@/lib/db/repository";
import { getCalLink, getServiceProduct } from "@/lib/products";
import { getStripe, hasStripe, getInvoiceForSession } from "@/lib/stripe";
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

    // The Stripe webhook is asynchronous and may not have marked the order paid
    // by the time Stripe redirects here. Verify the session directly with Stripe
    // and promote the order so scheduling isn't blocked by that race.
    if (!order && hasStripe()) {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session && (session.payment_status === "paid" || session.mode === "subscription")) {
        const invoice = await getInvoiceForSession(session);
        order = await markOrderPaidFromSession(session, invoice);
      }
    }
  } catch (error) {
    return <ScheduleBlocked message="Scheduling is waiting for payment infrastructure to be configured." />;
  }

  if (!order || order.kind !== "consultation") {
    return <ScheduleBlocked message="Payment has not been confirmed for this scheduling link." />;
  }

  const product = getServiceProduct(order.product_slug);
  return <PaidScheduler order={order} calLink={product ? getCalLink(product) : "talkhumanly/individual-advisory"} />;
}

function ScheduleBlocked({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-margin-mobile py-36 text-center md:px-margin-desktop">
      <div className="rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-10 shadow-pop md:p-14">
        <h1 className="text-h1 font-display font-extrabold tracking-tight text-primary-dark">Scheduling is locked</h1>
        <p className="mt-4 text-body-lg leading-relaxed text-neutral-500">{message}</p>
        <Link
          href="/booking"
          className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop-sm"
        >
          Return to booking
        </Link>
      </div>
    </div>
  );
}
