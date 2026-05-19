import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin";
import { getSql, hasDatabase } from "@/lib/db/client";
import { getStripe, hasStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const priceSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  kind: z.string().default("consultation"),
  amount: z.number().int().positive(),
  mode: z.enum(["payment", "subscription"]).default("payment"),
});

export async function POST(request: Request) {
  const blocked = await requireAdminApi();
  if (blocked) return blocked;
  if (!hasDatabase()) return Response.json({ error: "DATABASE_URL is missing." }, { status: 503 });

  const body = priceSchema.parse(await request.json());
  let stripeProductId: string | null = null;
  let stripePriceId: string | null = null;

  if (hasStripe()) {
    const stripe = getStripe();
    const product = await stripe.products.create({
      name: body.name,
      metadata: { slug: body.slug, kind: body.kind },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: "aed",
      unit_amount: body.amount,
      ...(body.mode === "subscription" ? { recurring: { interval: "month" } } : {}),
      metadata: { slug: body.slug, kind: body.kind },
    });
    stripeProductId = product.id;
    stripePriceId = price.id;
  }

  const sql = getSql();
  await sql`
    update products set active = false, updated_at = now() where slug = ${body.slug};
    insert into products (slug, kind, name, amount, currency, stripe_product_id, stripe_price_id, active)
    values (${body.slug}, ${body.kind}, ${body.name}, ${body.amount}, 'aed', ${stripeProductId}, ${stripePriceId}, true)
    on conflict (slug)
    do update set
      name = excluded.name,
      amount = excluded.amount,
      stripe_product_id = excluded.stripe_product_id,
      stripe_price_id = excluded.stripe_price_id,
      active = true,
      updated_at = now()
  `;

  return Response.json({ ok: true, stripePriceId });
}
