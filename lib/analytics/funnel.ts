import { hasDatabase, getSql } from "@/lib/db/client";

export async function recordFunnelEvent(input: {
  event: string;
  path?: string;
  productSlug?: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!hasDatabase()) return;

  const sql = getSql();
  await sql`
    insert into funnel_events (event, path, product_slug, customer_email, metadata)
    values (
      ${input.event},
      ${input.path || null},
      ${input.productSlug || null},
      ${input.customerEmail || null},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
  `;
}
