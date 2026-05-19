import type Stripe from "stripe";
import { getSql, hasDatabase } from "@/lib/db/client";
import { getResource, type Resource } from "@/lib/resources";

export type OrderRecord = {
  id: string;
  kind: "consultation" | "resource";
  status: string;
  product_slug: string;
  customer_name: string;
  customer_email: string;
  phone: string | null;
  amount: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_url: string | null;
  stripe_invoice_pdf_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  paid_at: string | null;
};

type ResourceRow = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  blob_url: string | null;
  public_path: string | null;
  amount: number | null;
  gated: boolean;
  published: boolean;
  metadata: Record<string, unknown> | null;
  updated_at: string;
};

function metadataString(metadata: Record<string, unknown> | null, key: string, fallback: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function metadataStringArray(metadata: Record<string, unknown> | null, key: string, fallback: string[]) {
  const value = metadata?.[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
}

function toPublicResource(row: ResourceRow): Resource {
  const updatedAt = row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    minutes: Number(row.metadata?.minutes) || 8,
    summary: row.summary,
    pdf: row.blob_url || row.public_path || `/resources/${row.slug}.pdf`,
    gated: row.gated,
    amount: row.amount || undefined,
    updatedAt,
    author: metadataString(row.metadata, "author", "Humanly HR Advisory"),
    reviewer: metadataString(row.metadata, "reviewer", "Karma Harb"),
    keywords: metadataStringArray(row.metadata, "keywords", [row.category, row.title]),
  };
}

export async function createPendingOrder(input: {
  kind: "consultation" | "resource";
  productSlug: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}) {
  const sql = getSql();
  const rows = (await sql`
    insert into orders (
      kind,
      status,
      product_slug,
      customer_name,
      customer_email,
      phone,
      amount,
      currency,
      metadata
    )
    values (
      ${input.kind},
      'pending',
      ${input.productSlug},
      ${input.customerName},
      ${input.customerEmail},
      ${input.phone || null},
      ${input.amount},
      ${input.currency || "aed"},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
    returning *
  `) as OrderRecord[];

  return rows[0];
}

export async function attachStripeSession(orderId: string, session: Stripe.Checkout.Session) {
  const sql = getSql();
  await sql`
    update orders
    set
      stripe_checkout_session_id = ${session.id},
      updated_at = now()
    where id = ${orderId}::uuid
  `;
}

export async function markOrderPaidFromSession(
  session: Stripe.Checkout.Session,
  invoice?: Stripe.Invoice | null
) {
  const orderId = typeof session.metadata?.orderId === "string" ? session.metadata.orderId : null;
  const sessionId = session.id;
  const invoiceId = typeof session.invoice === "string" ? session.invoice : invoice?.id || null;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;
  const invoiceUrl = invoice?.hosted_invoice_url || null;
  const invoicePdfUrl = invoice?.invoice_pdf || null;

  const sql = getSql();
  const rows = (await sql`
    update orders
    set
      status = 'paid',
      stripe_payment_intent_id = ${paymentIntentId},
      stripe_invoice_id = ${invoiceId},
      stripe_invoice_url = ${invoiceUrl},
      stripe_invoice_pdf_url = ${invoicePdfUrl},
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
    where
      (${orderId}::uuid is not null and id = ${orderId}::uuid)
      or stripe_checkout_session_id = ${sessionId}
    returning *
  `) as OrderRecord[];

  const order = rows[0];

  if (order?.kind === "resource") {
    await grantResourceEntitlement(order);
  }

  return order;
}

export async function markOrderStatusBySession(sessionId: string, status: string) {
  const sql = getSql();
  await sql`
    update orders
    set status = ${status}, updated_at = now()
    where stripe_checkout_session_id = ${sessionId}
  `;
}

export async function getPaidOrderBySession(sessionId: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from orders
    where stripe_checkout_session_id = ${sessionId}
      and status = 'paid'
    limit 1
  `) as OrderRecord[];

  return rows[0] || null;
}

export async function getOrderById(orderId: string) {
  const sql = getSql();
  const rows = (await sql`
    select *
    from orders
    where id = ${orderId}::uuid
    limit 1
  `) as OrderRecord[];

  return rows[0] || null;
}

export async function getPaidResourceOrder(sessionId: string, resourceSlug?: string | null) {
  const order = await getPaidOrderBySession(sessionId);
  if (!order || order.kind !== "resource") return null;
  if (resourceSlug && order.product_slug !== resourceSlug) return null;
  return order;
}

export async function getPublishedResources() {
  if (!hasDatabase()) return [];

  const sql = getSql();
  const rows = (await sql`
    select slug, title, category, summary, blob_url, public_path, amount, gated, published, metadata, updated_at
    from resources
    where published = true
    order by updated_at desc
  `) as ResourceRow[];

  return rows.map(toPublicResource);
}

export async function getResourceForSlug(slug: string | null | undefined) {
  const seededResource = getResource(slug);
  if (seededResource || !slug || !hasDatabase()) return seededResource || null;

  const sql = getSql();
  const rows = (await sql`
    select slug, title, category, summary, blob_url, public_path, amount, gated, published, metadata, updated_at
    from resources
    where slug = ${slug}
      and published = true
    limit 1
  `) as ResourceRow[];

  return rows[0] ? toPublicResource(rows[0]) : null;
}

export async function grantResourceEntitlement(order: OrderRecord) {
  const resource = await getResourceForSlug(order.product_slug);
  if (!resource) return;

  const sql = getSql();
  await sql`
    insert into resource_entitlements (order_id, resource_slug, customer_email)
    values (${order.id}::uuid, ${order.product_slug}, ${order.customer_email})
    on conflict do nothing
  `;
}

export async function hasResourceEntitlement(sessionId: string, resourceSlug: string) {
  const sql = getSql();
  const rows = (await sql`
    select re.id
    from resource_entitlements re
    join orders o on o.id = re.order_id
    where o.stripe_checkout_session_id = ${sessionId}
      and o.status = 'paid'
      and re.resource_slug = ${resourceSlug}
    limit 1
  `) as { id: string }[];

  return Boolean(rows[0]);
}

export async function recordBooking(input: {
  orderId?: string | null;
  uid: string;
  title?: string | null;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  meetingUrl?: string | null;
  status?: string | null;
  rawPayload: Record<string, unknown>;
}) {
  const sql = getSql();
  const rows = (await sql`
    insert into bookings (
      order_id,
      cal_booking_uid,
      title,
      attendee_name,
      attendee_email,
      start_time,
      end_time,
      meeting_url,
      status,
      raw_payload
    )
    values (
      ${input.orderId || null}::uuid,
      ${input.uid},
      ${input.title || null},
      ${input.attendeeName || null},
      ${input.attendeeEmail || null},
      ${input.startTime || null}::timestamptz,
      ${input.endTime || null}::timestamptz,
      ${input.meetingUrl || null},
      ${input.status || "accepted"},
      ${JSON.stringify(input.rawPayload)}::jsonb
    )
    on conflict (cal_booking_uid)
    do update set
      title = excluded.title,
      attendee_name = excluded.attendee_name,
      attendee_email = excluded.attendee_email,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      meeting_url = excluded.meeting_url,
      status = excluded.status,
      raw_payload = excluded.raw_payload,
      updated_at = now()
    returning *
  `) as Record<string, unknown>[];

  return rows[0];
}

export async function recordEmailEvent(input: {
  kind: string;
  recipient: string;
  status: string;
  providerId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!hasDatabase()) return;

  const sql = getSql();
  await sql`
    insert into email_events (kind, recipient, provider_id, status, metadata)
    values (
      ${input.kind},
      ${input.recipient},
      ${input.providerId || null},
      ${input.status},
      ${JSON.stringify(input.metadata || {})}::jsonb
    )
  `;
}

export async function getDashboardMetrics() {
  const sql = getSql();
  const [ordersSummary, bookingRows, resourceRows, funnelRows] = await Promise.all([
    sql`
      select
        coalesce(sum(amount) filter (where status = 'paid'), 0)::int as revenue,
        count(*) filter (where status = 'paid')::int as paid_orders,
        count(*) filter (where status = 'pending')::int as pending_orders
      from orders
    `,
    sql`select count(*)::int as count from bookings`,
    sql`select count(*)::int as count from resources`,
    sql`
      select event, count(*)::int as count
      from funnel_events
      group by event
      order by count desc
      limit 12
    `,
  ]);
  const orderStats = Array.isArray(ordersSummary)
    ? (ordersSummary as { revenue: number; paid_orders: number; pending_orders: number }[])[0]
    : undefined;
  const bookingStats = Array.isArray(bookingRows)
    ? (bookingRows as { count: number }[])[0]
    : undefined;
  const resourceStats = Array.isArray(resourceRows)
    ? (resourceRows as { count: number }[])[0]
    : undefined;
  const funnelStats = Array.isArray(funnelRows)
    ? (funnelRows as { event: string; count: number }[])
    : [];

  return {
    revenue: orderStats?.revenue || 0,
    paidOrders: orderStats?.paid_orders || 0,
    pendingOrders: orderStats?.pending_orders || 0,
    bookings: bookingStats?.count || 0,
    uploadedResources: resourceStats?.count || 0,
    funnel: funnelStats,
  };
}
