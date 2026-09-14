import type Stripe from "stripe";
import {
  markOrderPaidFromSession,
  markOrderStatusBySession,
  type OrderRecord,
} from "@/lib/db/repository";
import { getResourceForSlug } from "@/lib/db/repository";
import { sendResourceDelivery, sendLeadNotification, sendPaymentReceipt } from "@/lib/email/resend";
import { getInvoiceForSession, getStripe } from "@/lib/stripe";
import { formatUsd, formatAed, getServiceProduct } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";
import { recordFunnelEvent } from "@/lib/analytics/funnel";
import { bookPreferredSlot } from "@/lib/calBooking";

function metaStr(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "string" && value ? value : null;
}

/**
 * Client-facing receipt + invoice, sent as soon as payment lands — before (and
 * independently of) scheduling, so a client who never picks a time still gets an
 * invoice. Invoice URLs are read off the order rather than off `invoice_creation`,
 * which only applies to `mode: "payment"` — the retainer subscriptions get their
 * invoice from Stripe directly.
 */
async function sendConsultationReceipt(
  order: OrderRecord | undefined | null,
  session: Stripe.Checkout.Session,
  /** True when the picked slot was already booked — the receipt then has no "Choose your time"
   *  button; Cal.com's `BOOKING_CREATED` webhook sends the booking confirmation instead. */
  alreadyBooked = false
) {
  if (!order || order.kind !== "consultation") return;

  const product = getServiceProduct(order.product_slug);
  const priceFormatted = product
    ? formatAed(product.amountAed) + (product.priceNote ?? "")
    : formatAed(Math.round(order.amount / 100));

  try {
    await sendPaymentReceipt({
      to: order.customer_email,
      name: order.customer_name,
      service: product?.name || order.product_slug,
      priceFormatted,
      scheduleUrl: product?.needsScheduling && !alreadyBooked
        ? absoluteUrl(`/booking/schedule?session_id=${encodeURIComponent(session.id)}`)
        : null,
      invoiceUrl: order.stripe_invoice_url,
      invoicePdfUrl: order.stripe_invoice_pdf_url,
      orderId: order.id,
    });
  } catch {
    // Best-effort; payment is already recorded and the invoice stays in Stripe.
  }
}

/**
 * `checkout_paid` — the missing "actually paid" row `funnel_events` never recorded
 * (docs/cro/2026-09-pricing-page-cro.md, Track B item 7). Fired here, at the point Stripe
 * confirms payment. Best-effort: a funnel-recording failure must never block delivery of the
 * receipt/lead-notification emails that follow.
 *
 * Marcus's spec also calls for the identical event in the race-condition fallback path in
 * `app/booking/schedule/page.tsx` (`markOrderPaidFromSession`) — that call site sits inside
 * lines 23-52 of that file, which `docs/adr/CONTRACTS.md` lists as byte-for-byte frozen (the
 * payment gate). Not added here; flagged for Kyle/Jonas to decide how to close that gap without
 * touching the frozen block.
 */
async function recordCheckoutPaid(order: OrderRecord | undefined | null) {
  if (!order) return;
  const product = getServiceProduct(order.product_slug);
  try {
    await recordFunnelEvent({
      event: "checkout_paid",
      productSlug: order.product_slug,
      customerEmail: order.customer_email,
      metadata: { orderId: order.id, tier: product?.tier ?? null, kind: order.kind },
    });
  } catch {
    // Best-effort; payment is already recorded and the order row is the source of truth.
  }
}

async function notifyPaidConsultationLead(order: OrderRecord | undefined | null) {
  if (!order || order.kind !== "consultation") return;
  const product = getServiceProduct(order.product_slug);
  const priceFormatted = product
    ? formatAed(product.amountAed) + (product.priceNote ?? "")
    : formatAed(Math.round(order.amount / 100));
  try {
    await sendLeadNotification({
      service: metaStr(order.metadata, "service") || product?.name || order.product_slug,
      priceFormatted,
      name: order.customer_name,
      email: order.customer_email,
      phone: order.phone,
      urgency: metaStr(order.metadata, "urgency"),
      concern: metaStr(order.metadata, "concern"),
      message: metaStr(order.metadata, "message"),
      paid: true,
      orderId: order.id,
    });
  } catch {
    // Best-effort; payment is already recorded.
  }
}

/**
 * Book the Dubai-time slot the client picked before paying (ADR-0001 Decision C′). Done here, not
 * only on `/booking/schedule`, so the slot is taken even if the client closes the tab after
 * Stripe. Idempotent — the schedule page may race this and only one of them books. Cal.com's own
 * `BOOKING_CREATED` webhook then sends the confirmation and lead emails. Best-effort: a failure
 * leaves the paid embed on `/booking/schedule` as the fallback.
 */
async function autoBookPreferredSlot(order: OrderRecord | undefined | null): Promise<boolean> {
  try {
    return (await bookPreferredSlot(order)).status === "booked";
  } catch (error) {
    console.error("[webhooks/stripe] auto-booking failed", order?.id, error);
    return false;
  }
}

export const runtime = "nodejs";

async function deliverResourceIfNeeded(
  order: OrderRecord | undefined | null,
  session: Stripe.Checkout.Session,
  invoice?: Stripe.Invoice | null
) {
  if (!order || order.kind !== "resource") return;

  const resource = await getResourceForSlug(order.product_slug);
  if (!resource) return;

  const accessUrl = resource.membership
    ? absoluteUrl(`/resources/unlocked?session_id=${encodeURIComponent(session.id)}`)
    : absoluteUrl(
        `/api/resources/download?session_id=${encodeURIComponent(session.id)}&slug=${encodeURIComponent(resource.slug)}`
      );

  try {
    await sendResourceDelivery({
      to: order.customer_email,
      name: order.customer_name,
      title: resource.title,
      accessUrl,
      membership: resource.membership,
      priceFormatted: resource.amount ? formatUsd(resource.amount) : null,
      invoiceUrl: invoice?.hosted_invoice_url || null,
    });
  } catch {
    // Email delivery is best-effort; the resource stays unlockable via the success page.
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json({ error: "Stripe webhook signature configuration is missing." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" || session.mode === "subscription") {
        const invoice = await getInvoiceForSession(session);
        const order = await markOrderPaidFromSession(session, invoice);
        await recordCheckoutPaid(order);
        const booked = await autoBookPreferredSlot(order);
        await deliverResourceIfNeeded(order, session, invoice);
        await sendConsultationReceipt(order, session, booked);
        await notifyPaidConsultationLead(order);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoice = await getInvoiceForSession(session);
      const order = await markOrderPaidFromSession(session, invoice);
      await recordCheckoutPaid(order);
      const booked = await autoBookPreferredSlot(order);
      await deliverResourceIfNeeded(order, session, invoice);
      await sendConsultationReceipt(order, session, booked);
      await notifyPaidConsultationLead(order);
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await markOrderStatusBySession(session.id, event.type === "checkout.session.expired" ? "expired" : "failed");
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
