import type Stripe from "stripe";
import { getSql, hasDatabase } from "@/lib/db/client";
import { getResource, type Resource } from "@/lib/resources";
import { getServiceProduct } from "@/lib/products";

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

  const tierValue = Number(row.metadata?.tier);
  const tier = ([1, 2, 3, 4].includes(tierValue) ? tierValue : 2) as Resource["tier"];

  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    tier,
    minutes: Number(row.metadata?.minutes) || 8,
    format: metadataString(row.metadata, "format", "PDF download"),
    audience: metadataString(row.metadata, "audience", "Global employees"),
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
      ${input.currency || "usd"},
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

/**
 * Upsert one Cal.com booking, keyed on `cal_booking_uid`.
 *
 * Non-destructive on update (ADR-0001 Decision D): Cal.com delivers every booking trigger to the
 * same endpoint, and some payloads are partial — `BOOKING_NO_SHOW_UPDATED` carries only
 * `{ message, attendees, bookingUid, bookingId }`, no times, no title, no status. The old
 * `set col = excluded.col` blanked `start_time`/`end_time`/`meeting_url`/`title` on any such
 * event and reset `status`, which silently destroys the row the review cron reads. Every field a
 * partial payload can omit is therefore `coalesce`d against the stored value.
 *
 * `status` is deliberately NOT `coalesce(excluded.status, bookings.status)`: the insert branch
 * has to default it to `'accepted'` (the column is `not null`), so `excluded.status` is never
 * null and that coalesce would be a no-op. It is compared against the caller's own value
 * instead, so "the event told us a status" wins and "the event said nothing" keeps what we had —
 * which is what lets `cancelled`/`rescheduled` survive a later partial event.
 *
 * Callers pass `status` already lower-cased; see `app/api/webhooks/cal/route.ts`.
 */
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
  const status = input.status || null;
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
      ${status || "accepted"},
      ${JSON.stringify(input.rawPayload)}::jsonb
    )
    on conflict (cal_booking_uid)
    do update set
      title = coalesce(excluded.title, bookings.title),
      -- Owen S2: these two were raw overwrites. BOOKING_NO_SHOW_UPDATED sends an attendee
      -- with an email but NO name, so the webhook wrote a placeholder over the real attendee
      -- name and the review email then opened "Hi Humanly client". Coalesced like every other
      -- column, and the webhook now passes null rather than a literal so this SQL is the only
      -- thing deciding. (No backticks in SQL comments: this is a template literal.)
      attendee_name = coalesce(excluded.attendee_name, bookings.attendee_name),
      attendee_email = coalesce(excluded.attendee_email, bookings.attendee_email),
      start_time = coalesce(excluded.start_time, bookings.start_time),
      end_time = coalesce(excluded.end_time, bookings.end_time),
      meeting_url = coalesce(excluded.meeting_url, bookings.meeting_url),
      -- explicit cast: the driver sends an untyped null when the event carried no status,
      -- which Postgres can't resolve inside coalesce on its own.
      status = coalesce(${status}::varchar, bookings.status),
      raw_payload = excluded.raw_payload,
      updated_at = now()
    returning *
  `) as Record<string, unknown>[];

  return rows[0];
}

/**
 * Mark the booking a reschedule superseded (ADR-0001 Decision D).
 *
 * `BOOKING_RESCHEDULED` carries a NEW `uid` plus `rescheduleUid` (the old one), so the upsert
 * above creates a second row and never touches the first. Left alone, the old row keeps
 * `accepted` and its stale `end_time`, and the review cron asks "how was your session?" about a
 * slot that never happened — worse, dedup is per `attendee_email`, so that wrong send
 * permanently suppresses the right one.
 *
 * Only moves a row that is still `accepted`, so a booking already `cancelled` isn't relabelled.
 * Returns the number of rows moved (0 is normal — e.g. a reschedule of a booking made outside
 * this site's funnel, which we never recorded).
 */
export async function markBookingRescheduled(uid: string): Promise<number> {
  const sql = getSql();
  const rows = (await sql`
    update bookings
    set status = 'rescheduled', updated_at = now()
    where cal_booking_uid = ${uid}
      and lower(status) = 'accepted'
    returning cal_booking_uid
  `) as { cal_booking_uid: string }[];

  return rows.length;
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

// ── Review pipeline (ADR-0001, Decision D) ──────────────────────────────────────────────────
// See `docs/adr/0001-pricing-currency-availability-reviews.md` for the full decision and
// `docs/lifecycle/2026-09-review-request-sequence.md` (Imogen) for the consent/timing spec these
// functions are implemented against.

export type TestimonialStatus = "pending" | "approved" | "rejected";

/**
 * The exact two display-consent options offered on the review form
 * (`docs/lifecycle/2026-09-review-request-sequence.md` §6 — literal copy quoted below). Stored as
 * a short key rather than the full sentence because `testimonials.consent_display` is
 * `varchar(40)`; the mapping is 1:1, not an invented third option.
 *
 *  - `REVIEW_CONSENT_PUBLISH` = "Yes, you can publish this — with my role and location, never my name."
 *  - `REVIEW_CONSENT_PRIVATE` = "No, keep this between us."
 *
 * Only `REVIEW_CONSENT_PUBLISH` may ever result in `published = true` — enforced in SQL in
 * `setTestimonialStatus` and `getPublishedTestimonials`, not just in application code, per
 * Imogen's flagged gate-blocking gap.
 */
export const REVIEW_CONSENT_PUBLISH = "public_role_location" as const;
export const REVIEW_CONSENT_PRIVATE = "private" as const;
export type ReviewConsentDisplay = typeof REVIEW_CONSENT_PUBLISH | typeof REVIEW_CONSENT_PRIVATE;

/** One row of `testimonials`, including the columns added for the review pipeline. */
export type TestimonialRecord = {
  id: string;
  type: "text" | "video" | "instagram";
  quote: string | null;
  person_label: string | null;
  role_label: string | null;
  media_url: string | null;
  transcript: string | null;
  published: boolean;
  verified: boolean;
  rating: number | null;
  status: TestimonialStatus;
  location: string | null;
  cal_booking_uid: string | null;
  submitted_email: string | null;
  consent_display: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Public-site read: `status = 'approved' and published = true`, newest first. This is the ONLY
 * testimonials query anything outside `/dashboard` should ever call — it never returns a
 * `pending`/`rejected` row regardless of what else changes about moderation.
 *
 * Also filters on `consent_display = REVIEW_CONSENT_PUBLISH` — belt and braces alongside the
 * same check in `setTestimonialStatus`, so a row that somehow got `published = true` without
 * consent (a manual DB edit, a future caller that bypasses `setTestimonialStatus`) still cannot
 * render on the public site.
 */
export async function getPublishedTestimonials(): Promise<TestimonialRecord[]> {
  if (!hasDatabase()) return [];

  const sql = getSql();
  const rows = (await sql`
    select *
    from testimonials
    where status = 'approved'
      and published = true
      and (consent_display = ${REVIEW_CONSENT_PUBLISH} or consent_display is null)
    order by created_at desc
  `) as TestimonialRecord[];

  return rows;
}

/**
 * Admin-dashboard read: every row regardless of `status`, for the moderation queue. Gated by
 * `requireAdminApi()` at the ROUTE layer (same as every other `/api/dashboard/*` handler) — this
 * function itself performs no authorization check, matching every other function in this file.
 */
export async function listTestimonials(filter?: { status?: TestimonialStatus }): Promise<TestimonialRecord[]> {
  const sql = getSql();
  const rows = filter?.status
    ? ((await sql`
        select *
        from testimonials
        where status = ${filter.status}
        order by created_at desc
      `) as TestimonialRecord[])
    : ((await sql`
        select *
        from testimonials
        order by created_at desc
      `) as TestimonialRecord[]);

  return rows;
}

/**
 * Discriminated result for `setTestimonialStatus`, so the dashboard can show WHY an approve was
 * refused rather than a silent no-op (Imogen's flagged gate-blocking gap,
 * `docs/lifecycle/2026-09-review-request-sequence.md` §6).
 */
export type SetTestimonialStatusResult =
  | { ok: true; testimonial: TestimonialRecord }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "consent_required" };

/**
 * Moderate one row. Setting `status: "approved"` MUST also set `published = true` in the same
 * update (per ADR-0001 Decision D) — there is no DB trigger enforcing this, so this function is
 * the single place that invariant is guaranteed. Setting `"pending"` or `"rejected"` does NOT
 * touch `published` (an admin un-approving a previously-published quote is a separate, deliberate
 * action, not implied by a status change alone).
 *
 * **Consent gate (fixed per Imogen's review, §6 of the lifecycle doc):** approving a row can only
 * publish it if `consent_display = REVIEW_CONSENT_PUBLISH`, OR `consent_display is null` (an
 * admin-curated quote entered directly via `app/api/dashboard/testimonials` POST, which never
 * sets this column — a different consent basis: Karma authored/sourced it herself, not a
 * customer submission through the token flow). A customer-submitted row with
 * `REVIEW_CONSENT_PRIVATE` can NEVER be approved-to-publish, full stop — enforced in the SQL
 * `where` clause itself, not just a JS guard, so no future caller can bypass it by skipping a
 * check. If the where clause matches zero rows, a follow-up read distinguishes "no such row" from
 * "row exists but consent refuses publication" so the caller gets an honest reason.
 */
export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatus,
): Promise<SetTestimonialStatusResult> {
  const sql = getSql();

  if (status !== "approved") {
    // "pending"/"rejected" leave `published` untouched — see doc comment above.
    const rows = (await sql`
      update testimonials
      set status = ${status}, updated_at = now()
      where id = ${id}::uuid
      returning *
    `) as TestimonialRecord[];

    return rows[0] ? { ok: true, testimonial: rows[0] } : { ok: false, reason: "not_found" };
  }

  // Approving a row also publishes it, in the same update, so the invariant can never be
  // half-applied — but the WHERE clause is the actual enforcement point for consent, not a
  // condition checked in JS after the fact.
  const rows = (await sql`
    update testimonials
    set status = 'approved', published = true, updated_at = now()
    where id = ${id}::uuid
      and (consent_display = ${REVIEW_CONSENT_PUBLISH} or consent_display is null)
    returning *
  `) as TestimonialRecord[];

  if (rows[0]) return { ok: true, testimonial: rows[0] };

  // The update matched nothing — find out whether that's because the row doesn't exist, or
  // because it exists but explicitly refused consent.
  const existing = (await sql`
    select id from testimonials where id = ${id}::uuid limit 1
  `) as { id: string }[];

  return existing[0] ? { ok: false, reason: "consent_required" } : { ok: false, reason: "not_found" };
}

export type ReviewEligibleBooking = {
  cal_booking_uid: string;
  order_id: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  end_time: string | null;
  product_slug: string | null;
};

/**
 * Selection query for `app/api/cron/review-requests/route.ts`. Per
 * `docs/lifecycle/2026-09-review-request-sequence.md` §1, the window is NOT a single fixed
 * 3-4-day cut for every product:
 *
 *  - Core/specialist one-off sessions: `end_time` 3-6 days ago (ADR-0001 specified 3-4; widened
 *    per Owen S1 — see `STANDARD_WINDOW` below for why a 1-day window made retries impossible).
 *  - `full-support` (14 days of async WhatsApp access after the session): `end_time` 17-20 days
 *    ago, so the request lands after the engagement window closes, not mid-engagement.
 *  - Retainer-category products: excluded entirely in v1 — no `cancelled_at`/subscription-status
 *    field exists to detect when the relationship actually wraps (Imogen's §1, option (b)).
 *
 * Implementation follows Imogen's recommended option (b): a wide SQL prefilter (`end_time` in
 * the last 21 days, `status = 'accepted'`), joined to `orders` (inner join — also applies
 * Imogen's recommended `orders.status = 'paid'` filter, so nothing solicits feedback on an
 * unpaid/order-less booking) to get `product_slug`, then the exact per-category day-window is
 * applied here in TypeScript against `getServiceProduct(product_slug).category`/`.slug` —
 * `lib/products.ts` stays the single source of truth for that classification rather than
 * duplicating it in SQL.
 *
 * Dedup: excludes any booking whose `attendee_email` already has a **successfully sent**
 * `email_events` row (`kind = 'review_request'`, `status = 'sent'`) — the same pattern every
 * other outbound email in this codebase relies on (`recordEmailEvent`). Per-email-address, not
 * per-booking, by design (Imogen's §3): this is also what stops a returning client from getting a
 * second request after a second visit.
 *
 * The `status = 'sent'` clause matters: `sendReviewRequest` records an `email_events` row on
 * *every* outcome, including `error` and `skipped_missing_resend_key`. Without it, one Resend
 * outage or one run with no API key configured permanently consumed that customer's only review
 * request — the row suppressed all future attempts while no email ever left the building.
 * The per-product window is three days wide (Owen S1), so the two scheduled runs after a failed
 * one re-select the same booking and genuinely retry it.
 *
 * Status matching is case-insensitive on purpose. Cal.com sends `"ACCEPTED"` and this route used
 * to store it verbatim, so every pre-existing row is uppercase; the webhook now lower-cases on
 * write and `migrations.sql` backfills the old rows, but `lower()` here means the query is
 * correct whichever convention a given row was written under. Without it this query matched zero
 * rows and the cron was inert (ADR-0001 Decision D).
 *
 * Three independent filters guard "this session actually happened", because each of them can be
 * defeated on its own:
 *  1. `lower(b.status) = 'accepted'` — depends on Cal.com delivering the cancellation event.
 *  2. `raw_payload->>'triggerEvent'` not a cancellation/rejection — belt and braces alongside
 *     `status`, correct even if status handling regresses again. `raw_payload` already stores the
 *     whole request body, so this needs no schema change.
 *  3. `not exists (a later booking on the same order)` — correct even if `BOOKING_RESCHEDULED` is
 *     not subscribed at all, which is the one thing this repo cannot verify.
 *
 * Residual after all three: a reschedule to an EARLIER slot, delivered without a usable
 * `rescheduleUid` (so `markBookingRescheduled` never retires the old row) and with the
 * cancellation trigger unsubscribed, still leaves an eligible stale row. Filter 3 keys off
 * "later", so it cannot catch that one. Named rather than papered over.
 *
 * `[UNVERIFIED: whether BOOKING_CANCELLED / BOOKING_RESCHEDULED are actually subscribed on the
 * Cal.com webhook pointing at /api/webhooks/cal — a dashboard setting, not visible from this
 * repo (Jonas to confirm). Both filters below are written to be correct either way.]`
 */
export async function getBookingsEligibleForReviewRequest(): Promise<ReviewEligibleBooking[]> {
  const sql = getSql();
  const rows = (await sql`
    select b.cal_booking_uid, b.order_id, b.attendee_name, b.attendee_email, b.end_time,
           o.product_slug
    from bookings b
    join orders o on o.id = b.order_id
    where lower(b.status) = 'accepted'
      and coalesce(b.raw_payload->>'triggerEvent', '') not in ('BOOKING_CANCELLED', 'BOOKING_REJECTED')
      and o.status = 'paid'
      -- Owen B5 / ADR-0001 Decision D, the third filter the ADR specified and the build dropped.
      -- Correct REGARDLESS of whether BOOKING_RESCHEDULED is subscribed on the Cal.com webhook:
      -- a reschedule arrives as a NEW row (new uid), so a later booking on the same order means
      -- this row's slot never happened. order_id is non-null here (inner join above), and a null
      -- b2.end_time compares as unknown, so neither can widen this.
      and not exists (
        select 1
        from bookings b2
        where b2.order_id = b.order_id
          and b2.end_time > b.end_time
      )
      and b.end_time between now() - interval '21 days' and now() - interval '3 days'
      and b.attendee_email is not null
      and b.attendee_email <> ''
      and not exists (
        select 1
        from email_events e
        where e.kind = 'review_request'
          and e.recipient = b.attendee_email
          and e.status = 'sent'
      )
    order by b.end_time asc
  `) as ReviewEligibleBooking[];

  return rows.filter((row) => isWithinReviewRequestWindow(row.product_slug, row.end_time));
}

/**
 * Per-product day-window check, applied in TypeScript per Imogen's recommendation — see the doc
 * comment on `getBookingsEligibleForReviewRequest` above. Returns `false` (exclude) for
 * retainers, for any slug `getServiceProduct` can't resolve, or for a booking outside its
 * category's window.
 */
/**
 * Owen S1: these windows were 1.0 day wide (`[3,4]` / `[17,18]`) against a cron that runs once
 * every 24 hours at a fixed time — so every booking was evaluated by exactly ONE run, ever, and a
 * Resend outage during that run lost that customer's only review request permanently. Widened to
 * three days so the next two scheduled runs are genuine retries. Duplicates are impossible: the
 * `email_events` dedup in the query above only counts a row with `status = 'sent'`, so a booking
 * leaves the eligible set the moment an email actually goes out.
 *
 * `full-support` keeps its 14-day-async-window offset (lifecycle doc §1) and is widened by the
 * same three days.
 *
 * Keep `maxDays` at or below the SQL prefilter's `end_time >= now() - interval '21 days'`, or the
 * extra days here select nothing.
 */
const STANDARD_WINDOW = { minDays: 3, maxDays: 6 } as const;
const FULL_SUPPORT_WINDOW = { minDays: 17, maxDays: 20 } as const;

function isWithinReviewRequestWindow(productSlug: string | null, endTime: string | null): boolean {
  if (!productSlug || !endTime) return false;

  const product = getServiceProduct(productSlug);
  if (!product || product.category === "retainer") return false;

  const ageDays = (Date.now() - new Date(endTime).getTime()) / (24 * 60 * 60 * 1000);
  const { minDays, maxDays } = product.slug === "full-support" ? FULL_SUPPORT_WINDOW : STANDARD_WINDOW;

  return ageDays >= minDays && ageDays <= maxDays;
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
