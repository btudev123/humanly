create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug varchar(120) not null unique,
  kind varchar(40) not null,
  name varchar(200) not null,
  description text,
  amount integer not null,
  currency varchar(10) not null default 'usd',
  stripe_product_id varchar(200),
  stripe_price_id varchar(200),
  active boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  kind varchar(40) not null,
  status varchar(40) not null default 'pending',
  product_slug varchar(160) not null,
  customer_name varchar(200) not null,
  customer_email varchar(320) not null,
  phone varchar(80),
  amount integer not null,
  currency varchar(10) not null default 'usd',
  stripe_checkout_session_id varchar(255) unique,
  stripe_payment_intent_id varchar(255),
  stripe_invoice_id varchar(255),
  stripe_invoice_url text,
  stripe_invoice_pdf_url text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists booking_intakes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  concern varchar(200),
  message text,
  urgency varchar(80),
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid,
  cal_booking_uid varchar(200) not null unique,
  title varchar(255),
  attendee_name varchar(200),
  attendee_email varchar(320),
  start_time timestamptz,
  end_time timestamptz,
  meeting_url text,
  status varchar(60) not null default 'accepted',
  raw_payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  slug varchar(160) not null unique,
  title varchar(255) not null,
  category varchar(160) not null,
  summary text not null,
  blob_url text,
  public_path text,
  amount integer,
  gated boolean not null default true,
  published boolean not null default false,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resource_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  resource_slug varchar(160) not null,
  customer_email varchar(320) not null,
  created_at timestamptz not null default now(),
  unique(order_id, resource_slug)
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  type varchar(40) not null default 'text',
  quote text,
  person_label varchar(160),
  role_label varchar(160),
  media_url text,
  transcript text,
  published boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists funnel_events (
  id uuid primary key default gen_random_uuid(),
  event varchar(120) not null,
  path varchar(320),
  product_slug varchar(160),
  customer_email varchar(320),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  kind varchar(120) not null,
  recipient varchar(320) not null,
  provider_id varchar(255),
  status varchar(80) not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ADR-0001, Decision D: review pipeline. `testimonials` was write-only (admin-curated quotes,
-- `verified` hard-coded false). This adds a moderation workflow (`status`) plus the columns a
-- customer-submitted, cal-booking-linked review needs. No foreign keys, matching this schema's
-- existing convention of zero FKs anywhere — `cal_booking_uid` is a plain varchar joined at query
-- time, the same way `bookings.order_id` already is. Idempotent: safe to re-run.
--
-- Rollback (see the ADR for the full rollback section):
--   drop index if exists testimonials_status_idx;
--   alter table testimonials
--     drop column if exists rating,
--     drop column if exists status,
--     drop column if exists location,
--     drop column if exists cal_booking_uid,
--     drop column if exists submitted_email,
--     drop column if exists consent_display,
--     drop column if exists submitted_at;
alter table testimonials
  add column if not exists rating integer,
  add column if not exists status varchar(40) not null default 'pending',
  add column if not exists location varchar(160),
  add column if not exists cal_booking_uid varchar(200),
  add column if not exists submitted_email varchar(320),
  add column if not exists consent_display varchar(40),
  add column if not exists submitted_at timestamptz;
create index if not exists testimonials_status_idx on testimonials (status);

-- ADR-0001, Decision D / Owen B4: one review per booking, enforced by the DATABASE.
-- `app/api/reviews/route.ts` pre-checks with `select ... limit 1` before inserting, which is a
-- TOCTOU: a double-clicked submit, or a token replayed any time inside its 60-day life, can
-- interleave two requests between the select and the insert and store two reviews for one
-- booking — while the form promises "one review per session". The pre-check stays (it is cheap
-- and produces a friendlier 409); this index is what actually makes the promise true, and the
-- route now also catches the resulting `23505` and returns the same 409.
--
-- The dedup below MUST run first: `create unique index` errors out if duplicates already exist,
-- which would abort this file mid-way. It is deliberately NON-destructive — no row is deleted and
-- no `status` is changed. It detaches every duplicate after the earliest submission for a uid by
-- nulling `cal_booking_uid`, so the review text survives in the moderation queue and the earliest
-- (genuine) submission keeps the booking link. A detached row is identifiable afterwards as
-- `submitted_at is not null and cal_booking_uid is null` — a shape the token flow never produces
-- on its own, since it always writes both.
-- Expected to match ZERO rows on a fresh database and on production as of 2026-09-03 (the review
-- form has never been live). Idempotent: after the first run no duplicates remain.
--
-- Consequence worth knowing: a detached duplicate no longer blocks a further submission for that
-- booking, because both the pre-check and the index key off `cal_booking_uid`.
--
-- Rollback: drop index if exists testimonials_cal_booking_uid_key;
--   (the detach cannot be rolled back — inspect the rows above before running against a database
--   where duplicates actually exist).
with ranked as (
  select
    id,
    row_number() over (
      partition by cal_booking_uid
      order by coalesce(submitted_at, created_at) asc, id asc
    ) as rn
  from testimonials
  where cal_booking_uid is not null
)
update testimonials t
set cal_booking_uid = null, updated_at = now()
from ranked
where ranked.id = t.id
  and ranked.rn > 1;

-- Partial on purpose: a plain unique index already permits many NULLs in Postgres, so the
-- predicate changes nothing semantically, but it keeps the index to the rows that matter
-- (customer submissions) and it is still usable by the route's `where cal_booking_uid = $1`,
-- which implies `is not null`.
create unique index if not exists testimonials_cal_booking_uid_key
  on testimonials (cal_booking_uid)
  where cal_booking_uid is not null;

-- Backfill, and it is load-bearing: `status` lands with `not null default 'pending'`, so every
-- testimonial that existed before this migration is stamped `pending`, while
-- `getPublishedTestimonials()` (lib/db/repository.ts) requires `status = 'approved' and
-- published = true`. Without this statement the public carousel empties the moment the DDL above
-- is applied. A row that was already `published = true` was approved by an admin under the old
-- (published-only) model, so `approved` is the faithful translation of that state.
--
-- Safe to re-run, but only because of the guard below — the naked statement is NOT (see Owen S7).
--
-- It cannot resurrect a rejected row: `status = 'pending'` excludes anything an admin has since
-- moved to `rejected` (or back to `approved`). It also cannot auto-approve a *customer*
-- submission — those always carry `cal_booking_uid` + `submitted_at` from the `/review/<token>`
-- flow, and both are required to be null here, so every token-submitted review still goes
-- through the dashboard moderation gate exactly as designed.
--
-- Owen S7: the predicate below — `(published, pending, no cal_booking_uid, no submitted_at)` —
-- is EXACTLY the row shape `app/api/dashboard/testimonials` POST creates when an admin adds a
-- curated quote with "published" ticked (it inserts `published` from the request body and lets
-- `status` fall to its `'pending'` default, writing neither review-pipeline column). So a second
-- run of this file, months later, would silently approve every admin-entered row that is waiting
-- in the moderation queue — a migration quietly performing a moderation action nobody took.
--
-- Guard: run only while the moderation workflow has never been used, i.e. while no testimonial
-- has ever been moved off `'pending'`. That is true by construction before this migration first
-- runs (the `status` column did not exist) and stops being true as soon as anyone approves or
-- rejects anything, which makes the statement effectively one-shot.
--
-- Residual, documented rather than hidden: on a database where this ran, nothing was ever
-- approved or rejected afterwards, and an admin then created a published-and-pending curated
-- quote, a re-run would still approve it. That case is mild (the admin ticked "published", so
-- approving matches their intent) and is closed properly by the dashboard POST inserting an
-- explicit `status` — flagged to the owner of that route rather than fixed from here.
--
-- Known residual (pre-existing, NOT closed by the guard): `setTestimonialStatus(id, 'pending')`
-- deliberately leaves `published` untouched, so un-approving a curated quote recreates the
-- (published, pending) state — and if that was the last non-pending row, the guard passes again
-- and a re-run re-approves it. Un-publish when un-approving.
do $backfill$
begin
  if exists (select 1 from testimonials where status <> 'pending') then
    raise notice 'testimonials status backfill skipped: moderation has already been used';
    return;
  end if;

  update testimonials
  set status = 'approved'
  where published = true
    and status = 'pending'
    and cal_booking_uid is null
    and submitted_at is null;
end
$backfill$;

-- ADR-0001, Decision D: one case convention for `bookings.status`. Cal.com sends it uppercase
-- (`"ACCEPTED"`) and `app/api/webhooks/cal/route.ts` stored it verbatim, so every existing row is
-- `ACCEPTED` while `getBookingsEligibleForReviewRequest` matched `'accepted'` — the review cron
-- selected nothing, ever. The webhook now lower-cases on write; this aligns the rows written
-- before it did. Idempotent (`lower('accepted') = 'accepted'`) and needs no rollback.
update bookings set status = lower(status) where status <> lower(status);
