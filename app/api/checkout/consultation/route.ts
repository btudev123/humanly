import { z } from "zod";
import { getSellableServiceProduct, getStripePriceId, formatAed } from "@/lib/products";
import { allowedDetailLabels, composeStoredMessage, getIntakeForm } from "@/lib/intake";
import { createPendingOrder, attachStripeSession } from "@/lib/db/repository";
import { getSql, hasDatabase } from "@/lib/db/client";
import { recordFunnelEvent } from "@/lib/analytics/funnel";
import { sendLeadNotification } from "@/lib/email/resend";
import { absoluteUrl } from "@/lib/site";
import { getStripe, hasStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const consultationCheckoutSchema = z.object({
  productSlug: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  concern: z.string().max(500).optional(),
  urgency: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),
  /**
   * The service-specific intake answers that don't map onto the three canonical
   * columns — job posting link, interview stage, headcount, and so on. Bounded so a
   * crafted request can't use the lead email as an amplifier.
   */
  details: z
    .array(z.object({ label: z.string().max(120), value: z.string().max(2000) }))
    .max(20)
    .optional(),
  /**
   * ADR-0001 Decision C — the read-only availability preview's chosen slot, carried forward as a
   * PREFERENCE (never a hold — `lib/cal.ts` never writes to Cal.com). Stored at
   * `orders.metadata.preferredSlot`; `app/booking/schedule/page.tsx` reads it back to pre-fill
   * the paid Cal.com embed. Validated as a parseable, future-dated ISO instant below rather than
   * with `z.string().datetime()`, so a malformed value is dropped (never blocks checkout) instead
   * of rejecting the whole request.
   */
  preferredSlot: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  if (!hasDatabase() || !hasStripe()) {
    return Response.json(
      { error: "Payment infrastructure is not configured. Add DATABASE_URL and STRIPE_SECRET_KEY." },
      { status: 503 }
    );
  }

  let body: z.infer<typeof consultationCheckoutSchema>;
  try {
    body = consultationCheckoutSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Please fill in your name and a valid email." }, { status: 400 });
  }

  // Purchase-time resolution: live catalogue, or a legacy alias's live replacement — NEVER the
  // retired archive. `getServiceProduct()` resolves withdrawn products (that is its job, so old
  // orders stay readable), which here would let a POST for `lunch-and-learn` open a live Stripe
  // checkout for something Humanly no longer sells. ADR-0001 Decision A / V1.
  const product = getSellableServiceProduct(body.productSlug);
  if (!product) {
    return Response.json({ error: "Unknown consultation product." }, { status: 400 });
  }

  // Keep only the extra answers this service actually asks for; the labels are emailed
  // verbatim, so they're matched against the server's own copy of the form.
  const allowedLabels = allowedDetailLabels(getIntakeForm(product));
  const details = (body.details ?? []).filter(
    (detail) => allowedLabels.has(detail.label) && detail.value.trim().length > 0,
  );
  const storedMessage = composeStoredMessage(body.message, details);

  // Validate the preview-selected slot (ADR-0001 Decision C) — parseable and in the future, or
  // dropped entirely. A malformed/expired value never blocks checkout; it's a preference, not a
  // required field, and the paid Cal.com embed still works with none stored at all.
  let preferredSlot: string | null = null;
  if (body.preferredSlot) {
    const parsed = new Date(body.preferredSlot);
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()) {
      preferredSlot = parsed.toISOString();
    }
  }

  // Consultations are charged in AED (the Stripe account's settlement currency).
  const chargeCurrency = "aed";
  const chargeAmount = product.amountAed * 100; // AED minor units (fils)

  try {
    const order = await createPendingOrder({
      kind: "consultation",
      productSlug: product.slug,
      customerName: body.name,
      customerEmail: body.email,
      phone: body.phone,
      amount: chargeAmount,
      currency: chargeCurrency,
      metadata: {
        concern: body.concern,
        urgency: body.urgency,
        message: storedMessage,
        service: product.name,
        ...(preferredSlot ? { preferredSlot } : {}),
      },
    });

    if (storedMessage || body.concern || body.urgency) {
      const sql = getSql();
      await sql`
        insert into booking_intakes (order_id, concern, message, urgency)
        values (${order.id}::uuid, ${body.concern || null}, ${storedMessage || null}, ${body.urgency || null})
      `;
    }

    // Fire a lead notification as soon as the form is submitted so leads are
    // captured even if the visitor abandons before paying. Best-effort.
    void sendLeadNotification({
      service: product.name,
      priceFormatted: formatAed(product.amountAed) + (product.priceNote ?? ""),
      name: body.name,
      email: body.email,
      phone: body.phone,
      urgency: body.urgency,
      concern: body.concern,
      // The immediate email gets the free text and the extras as separate rows; the
      // database keeps them merged so the later paid/booked emails carry them too.
      message: body.message,
      details,
      paid: false,
      orderId: order.id,
    }).catch(() => {});

    const stripe = getStripe();
    const stripePriceId = getStripePriceId(product);
    const lineItem = stripePriceId
      ? { price: stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: chargeCurrency,
            unit_amount: chargeAmount,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    console.error("[checkout/consultation]", message);
    return Response.json(
      { error: "We couldn't start checkout. Please try again in a moment." },
      { status: 500 }
    );
  }
}
