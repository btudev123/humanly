import type Stripe from "stripe";
import {
  markOrderPaidFromSession,
  markOrderStatusBySession,
  type OrderRecord,
} from "@/lib/db/repository";
import { getResourceForSlug } from "@/lib/db/repository";
import { sendResourceDelivery, sendLeadNotification } from "@/lib/email/resend";
import { getInvoiceForSession, getStripe } from "@/lib/stripe";
import { formatUsd, formatAed, getServiceProduct } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

function metaStr(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "string" && value ? value : null;
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
        await deliverResourceIfNeeded(order, session, invoice);
        await notifyPaidConsultationLead(order);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoice = await getInvoiceForSession(session);
      const order = await markOrderPaidFromSession(session, invoice);
      await deliverResourceIfNeeded(order, session, invoice);
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
