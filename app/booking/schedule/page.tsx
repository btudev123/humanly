import type { Metadata } from "next";
import Link from "next/link";
import { PaidScheduler } from "@/components/booking/PaidScheduler";
import { getPaidOrderBySession, markOrderPaidFromSession } from "@/lib/db/repository";
import { CAL_USERNAME, getCalLink, getServiceProduct } from "@/lib/products";
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

  // Full read-path resolution — live catalogue, then the retired archive, then the alias map.
  // This is the one place that knows what was actually bought, so both the Cal link and the
  // page's product label are derived from it and passed down. `PaidScheduler` deliberately does
  // no lookup of its own: re-resolving against the *live* catalogue on the client is what made a
  // retired-slug order render as "The Session scheduling".
  const product = getServiceProduct(order.product_slug);

  // ADR-0001 Decision C — the slot the visitor picked in the pre-payment availability preview,
  // written to `orders.metadata` at checkout. A preference, not a hold: it only tells the embed
  // where to open. Dropped if it is malformed or already in the past, so a stale link never
  // deep-links the booker at a day that can't be booked.
  const rawPreferredSlot = order.metadata?.preferredSlot;
  let preferredSlot: string | undefined;
  if (typeof rawPreferredSlot === "string") {
    const parsed = new Date(rawPreferredSlot);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
      preferredSlot = parsed.toISOString();
    }
  }

  return (
    <PaidScheduler
      order={order}
      // The slug as charged, if nothing resolves it — same `product?.name || order.product_slug`
      // fallback the Stripe and Cal webhooks use on historical orders. Never a guessed product.
      productName={product?.name ?? order.product_slug}
      // Falls back to the live core-ladder default, never a retired slug: `full-support` is the
      // product `individual-advisory` was replaced by, and the old fallback also carried the
      // wrong Cal.com username (`talkhumanly`; the account is `talk-humanly`).
      calLink={product ? getCalLink(product) : `${CAL_USERNAME}/full-support`}
      preferredSlot={preferredSlot}
    />
  );
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
