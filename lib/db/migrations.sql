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
