import { z } from "zod";
import { getServiceProduct, getStripePriceId } from "@/lib/products";
import { createPendingOrder, attachStripeSession } from "@/lib/db/repository";
import { getSql, hasDatabase } from "@/lib/db/client";
import { recordFunnelEvent } from "@/lib/analytics/funnel";
import { absoluteUrl } from "@/lib/site";
import { getStripe, hasStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const consultationCheckoutSchema = z.object({
  productSlug: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  concern: z.string().optional(),
  urgency: z.string().optional(),
  message: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  if (!hasDatabase() || !hasStripe()) {
    return Response.json(
      { error: "Payment infrastructure is not configured. Add DATABASE_URL and STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  const body = consultationCheckoutSchema.parse(await request.json());
  const product = getServiceProduct(body.productSlug);

  if (!product) {
    return Response.json({ error: "Unknown consultation product." }, { status: 400 });
  }

  const order = await createPendingOrder({
    kind: "consultation",
    productSlug: product.slug,
    customerName: body.name,
    customerEmail: body.email,
    phone: body.phone,
    amount: product.amount,
    currency: product.currency,
    metadata: {
      concern: body.concern,
      urgency: body.urgency,
      service: product.name,
    },
  });

  if (body.message || body.concern || body.urgency) {
    const sql = getSql();
    await sql`
      insert into booking_intakes (order_id, concern, message, urgency)
      values (${order.id}::uuid, ${body.concern || null}, ${body.message || null}, ${body.urgency || null})
    `;
  }

  const stripe = getStripe();
  const stripePriceId = getStripePriceId(product);
  const lineItem = stripePriceId
    ? { price: stripePriceId, quantity: 1 }
    : {
        price_data: {
          currency: product.currency,
          unit_amount: product.amount,
          product_data: {
            name: product.name,
            description: product.description,
          },
          ...(product.mode === "subscription" && product.interval
            ? { recurring: { interval: product.interval } }
            : {}),
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: product.mode,
    customer_email: body.email,
    client_reference_id: order.id,
    line_items: [lineItem],
    allow_promotion_codes: true,
    metadata: {
      orderId: order.id,
      kind: "consultation",
      productSlug: product.slug,
    },
    success_url: product.needsScheduling
      ? `${absoluteUrl("/booking/schedule")}?session_id={CHECKOUT_SESSION_ID}`
      : `${absoluteUrl("/booking/done")}?session_id={CHECKOUT_SESSION_ID}&kind=async`,
    cancel_url: `${absoluteUrl("/payment-failed")}?kind=consultation&product=${product.slug}`,
    ...(product.mode === "payment" ? { invoice_creation: { enabled: true } } : {}),
  });

  await attachStripeSession(order.id, session);
  await recordFunnelEvent({
    event: "checkout_created",
    path: "/booking",
    productSlug: product.slug,
    customerEmail: body.email,
    metadata: { orderId: order.id, kind: "consultation" },
  });

  return Response.json({ url: session.url });
}
