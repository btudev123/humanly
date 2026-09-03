import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  kind: varchar("kind", { length: 40 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  stripeProductId: varchar("stripe_product_id", { length: 200 }),
  stripePriceId: varchar("stripe_price_id", { length: 200 }),
  active: boolean("active").notNull().default(true),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: varchar("kind", { length: 40 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("pending"),
  productSlug: varchar("product_slug", { length: 160 }).notNull(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  stripeInvoiceUrl: text("stripe_invoice_url"),
  stripeInvoicePdfUrl: text("stripe_invoice_pdf_url"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookingIntakes = pgTable("booking_intakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull(),
  concern: varchar("concern", { length: 200 }),
  message: text("message"),
  urgency: varchar("urgency", { length: 80 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id"),
  calBookingUid: varchar("cal_booking_uid", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  attendeeName: varchar("attendee_name", { length: 200 }),
  attendeeEmail: varchar("attendee_email", { length: 320 }),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  meetingUrl: text("meeting_url"),
  status: varchar("status", { length: 60 }).notNull().default("accepted"),
  rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resourcesTable = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 160 }).notNull(),
  summary: text("summary").notNull(),
  blobUrl: text("blob_url"),
  publicPath: text("public_path"),
  amount: integer("amount"),
  gated: boolean("gated").notNull().default(true),
  published: boolean("published").notNull().default(false),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resourceEntitlements = pgTable("resource_entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull(),
  resourceSlug: varchar("resource_slug", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 320 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 40 }).notNull().default("text"),
  quote: text(),
  personLabel: varchar("person_label", { length: 160 }),
  roleLabel: varchar("role_label", { length: 160 }),
  mediaUrl: text("media_url"),
  transcript: text(),
  published: boolean("published").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  // ── ADR-0001, Decision D: review pipeline. Schema documentation only — Drizzle is not the
  // migration runner in this project (see `lib/db/migrations.sql`, applied by hand); this block
  // must stay in lockstep with the `alter table testimonials` migration there. No foreign keys,
  // matching every other table in this file.
  /** 1–5. Null until a customer submits a review; admin-curated quotes may leave this null too. */
  rating: integer("rating"),
  /** `"pending" | "approved" | "rejected"`. Approving a row also sets `published = true`
   *  (application logic in `setTestimonialStatus`, not a DB trigger). */
  status: varchar("status", { length: 40 }).notNull().default("pending"),
  location: varchar("location", { length: 160 }),
  /** Joins to `bookings.cal_booking_uid` at query time — no FK, matching this schema's convention.
   *  Also the subject of the HMAC review-link token; see `lib/reviews.ts`. */
  calBookingUid: varchar("cal_booking_uid", { length: 200 }),
  /** The email address the review-request link was sent to / the reviewer submitted with.
   *  Distinct from any `orders.customer_email` — no FK, so not guaranteed to match one. */
  submittedEmail: varchar("submitted_email", { length: 320 }),
  /** Display consent, exactly two values, both defined in `lib/db/repository.ts`:
   *  `REVIEW_CONSENT_PUBLISH` = `"public_role_location"` ("Yes, publish this — with my role and
   *  location, never my name") and `REVIEW_CONSENT_PRIVATE` = `"private"` ("No, keep this between
   *  us"). Null on an admin-curated quote entered through the dashboard, which never goes through
   *  the consent form.
   *
   *  Corrected per Owen S8: this used to document `"name_and_role"` / `"anonymous"` /
   *  `"full_quote"`, none of which the code ever wrote, and `"full_quote"` implied a
   *  publish-with-name tier the site explicitly does not offer
   *  (`docs/lifecycle/2026-09-review-request-sequence.md` §6 — the choice is binary, and
   *  attribution is role + location only, for everyone).
   *
   *  Kept as a plain `varchar` rather than a DB enum so adding an option needs no migration —
   *  but only the two constants above are valid today, and `getPublishedTestimonials` /
   *  `setTestimonialStatus` both gate publication on `REVIEW_CONSENT_PUBLISH` in SQL. */
  consentDisplay: varchar("consent_display", { length: 40 }),
  /** When a customer submitted the review — distinct from `createdAt`, which for an admin-curated
   *  quote is when the row was entered into the dashboard, not when any customer acted. */
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Index mirror for documentation — the actual index is created by `lib/db/migrations.sql`
 *  (`testimonials_status_idx`), not by Drizzle, per this project's hand-applied-SQL convention. */

export const funnelEvents = pgTable("funnel_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  event: varchar("event", { length: 120 }).notNull(),
  path: varchar("path", { length: 320 }),
  productSlug: varchar("product_slug", { length: 160 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailEvents = pgTable("email_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: varchar("kind", { length: 120 }).notNull(),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }),
  status: varchar("status", { length: 80 }).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
