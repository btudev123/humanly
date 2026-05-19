import type Stripe from "stripe";
import {
  markOrderPaidFromSession,
  markOrderStatusBySession,
} from "@/lib/db/repository";
import { getInvoiceForSession, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

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
        await markOrderPaidFromSession(session, invoice);
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoice = await getInvoiceForSession(session);
      await markOrderPaidFromSession(session, invoice);
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
