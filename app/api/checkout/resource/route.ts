import { z } from "zod";
import { attachStripeSession, createPendingOrder, getResourceForSlug } from "@/lib/db/repository";
import { recordFunnelEvent } from "@/lib/analytics/funnel";
import { hasDatabase } from "@/lib/db/client";
import { absoluteUrl } from "@/lib/site";
import { getStripe, hasStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const resourceCheckoutSchema = z.object({
  resourceSlug: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(request: Request) {
  if (!hasDatabase() || !hasStripe()) {
    return Response.json(
      { error: "Payment infrastructure is not configured. Add DATABASE_URL and STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const body = resourceCheckoutSchema.parse(await request.json());
  const resource = await getResourceForSlug(body.resourceSlug);

  if (!resource || !resource.gated || !resource.amount) {
    return Response.json({ error: "This resource is not available for paid unlock." }, { status: 400 });
  }

  const isSubscription = Boolean(resource.interval);

  const order = await createPendingOrder({
    kind: "resource",
    productSlug: resource.slug,
    customerName: body.name,
    customerEmail: body.email,
    amount: resource.amount,
    currency: "usd",
    metadata: {
      resourceTitle: resource.title,
      category: resource.category,
    },
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    customer_email: body.email,
    client_reference_id: order.id,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: resource.amount,
          product_data: {
            name: resource.title,
            description: resource.summary,
          },
          ...(isSubscription && resource.interval
            ? { recurring: { interval: resource.interval } }
            : {}),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      kind: "resource",
      productSlug: resource.slug,
    },
    ...(isSubscription ? {} : { invoice_creation: { enabled: true } }),
    success_url: `${absoluteUrl("/resources/unlocked")}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${absoluteUrl(`/resources/${resource.slug}`)}?payment=cancelled`,
  });

  await attachStripeSession(order.id, session);
  await recordFunnelEvent({
    event: "resource_checkout_created",
    path: `/resources/${resource.slug}`,
    productSlug: resource.slug,
    customerEmail: body.email,
    metadata: { orderId: order.id },
  });

  return Response.json({ url: session.url });
}
