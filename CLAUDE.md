# CLAUDE.md

Guidance for working in this repository.

## What this is
`talkhumanly.com` — the marketing + commerce site for **Humanly**, an independent, confidential HR
advisory founded by Karma Harb. Visitors learn about advisory services, buy paid resources, and book
consultations. Positioning is **global-first** with regional guides for the UAE, GCC & North America.


## Stack
- **Next.js 16 (App Router) + React 19**, TypeScript.
- **Tailwind CSS v4** (config-less; theme tokens in `app/globals.css` `@theme`).
- **Clerk** (admin dashboard auth) · **Stripe** (checkout, USD) · **Resend** (transactional email,
  React Email) · **Drizzle ORM + Neon Postgres** · **Cal.com** embed (scheduling) ·
  framer-motion / gsap / three (motion & 3D hero).
- Dev server: `npm run dev` → http://localhost:3001. Build: `npm run build`. Node 22 (`.nvmrc`).

## Layout
- `app/` — routes: `/` (home), `/services`, `/about`, `/resources` (+ `[slug]`), `/blog` (+ `[slug]`),
  `/tools`, `/booking` (+ `/schedule`, `/done`), `/contact`, `/faq`, `/dashboard` (admin),
  `/checkout`, `/success`, `/payment-failed`, `/privacy`, `/terms`, `/studio` (Sanity Studio),
  `/review/[token]` (tokenised review form, noindex).
  SEO: `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`, `app/llms-full/`,
  `app/icon.svg` (favicon).
- `components/` — `layout/` (Navbar, Footer, BrandLogo), `booking/`, `resources/`, `dashboard/`,
  `reviews/`, `ui/`.
- `lib/` — **`products.ts`** (services source of truth: AED prices, Cal/Stripe env maps),
  **`resources.ts`** (tiered resource catalog), **`site.ts`** (site config),
  **`intake.ts`** (per-service booking intake forms), `related.ts` (keyword-driven internal links),
  `seo.ts` + `pageMeta.ts`, `sanity/` (fetch + queries), `cal.ts` (read-only Cal.com slots),
  `reviews.ts` (review-link tokens), `stripe.ts`, `email/resend.tsx`,
  `db/` (schema, repository, client), `analytics/funnel.ts`.
- `emails/` — `BookingConfirmationEmail.tsx`, `ResourceDeliveryEmail.tsx`, `ReviewRequestEmail.tsx`.
- `app/api/` — `checkout/`, `webhooks/stripe/`, `webhooks/cal/`, `resources/`, `dashboard/`,
  `availability/` (Cal.com slot preview), `reviews/`, `cron/review-requests/`.
- `docs/` — `adr/` (decisions + the contracts index), `runbooks/` (what to do when something
  scheduled breaks), plus the copy/design/CRO/SEO briefs a wave was built against.
- `vercel.json` — Vercel Cron schedules. Currently one entry: the daily review-request job.

## Key conventions
- **Brand & design**: see `DESIGN.md`. Poppins everywhere; palette `#3f1b73` / `#7c35e3` / `#fda544`.
  Use the CSS variables / Tailwind tokens (`text-primary-dark`, `bg-accent-orange`, …), not raw hex.
- **Logo**: `<BrandLogo />` (transparent SVG mark + live Poppins wordmark). Never reship a logo with a
  baked-in background.
- **Pricing-card pattern — the Monthly Retainers strip on `/services` is the reference.** Signed off
  by the owner (Sept 2026) as the house treatment; every other pricing/service card should match it
  rather than invent its own. The pattern: violet-tint fill with a violet border (not flat cream
  with a hairline outline), then title → subtitle → price → short paragraph → violet circle-check
  bullets → a solid deep-purple pill CTA pinned to the bottom of the card. The price is a large
  bold figure with a *smaller, muted* suffix (`/mo`, duration), so the figure never out-shouts the
  service name. Cards are equal height with the CTAs aligned on one baseline even when a label
  wraps. Before styling a new card, read that strip in `components/services/ServicesCatalog.tsx`
  and reuse it — the specialist strip was rebuilt to match after the flat-cream version shipped and
  read as a bare price list.
- **Canonical host is the apex `https://talkhumanly.com`** (`www` redirects to it). Everything
  outward-facing derives from `siteConfig.url` / `absoluteUrl()` — never hard-code a host.
- **Sanity Studio is at `/studio`** (`app/studio/[[...tool]]`, `basePath: '/studio'`). `/sanity/*`
  308-redirects there. The apex must be a CORS origin in Sanity Manage → API.
- **Service catalogue** (`lib/products.ts`) has three categories: `core` (the Goldilocks ladder —
  The Session / Session + Plan / Full Support), `specialist` (interview prep, job search, document
  review) and `retainer` (monthly subscriptions). The old `corporate` category was retired in
  Sept 2026 — Humanly sells employee-side advisory only.
  **Never delete a product entry.** `orders.product_slug` stores the slug at purchase time, so
  withdrawn products move to `retiredServiceProducts` and stay there; `getServiceProduct()` resolves
  live → retired archive → `LEGACY_SLUG_ALIASES`, and that order is what keeps historical orders
  readable. The archive is checked **before** the alias map on purpose: all three alias keys are
  also archive entries, so alias-first made an `extended-advisory` order (1800 AED / 90 min) read
  back as `full-support` (1200 AED / 60 min) in the receipt and on the schedule page — rewriting
  money-adjacent history. Use `getSellableServiceProduct()` when resolving a slug for *purchase*;
  that one never returns a retired product.
- Services/pricing flow: `lib/products.ts` → Stripe checkout (`app/api/checkout`) → success redirect.
  Visitors pick a **Dubai-time slot before paying** (day buttons → time dropdown, `Asia/Dubai`
  only, fed by `lib/cal.ts` → `/api/availability`). Nothing is written to Cal.com pre-payment; the
  slot is re-checked uncached at checkout (409 if taken) and **auto-booked after payment** by
  `lib/calBooking.ts`, called from the Stripe webhook and `/booking/schedule` (idempotent claim on
  `orders.metadata.calBooking`). If Cal.com refuses it, `/booking/schedule` falls back to the paid
  Cal.com embed (ADR-0001 Decision C′). Async items email a delivery link.
  `/booking?service=<slug>&slot=<iso>` preselects a service/time and resolves retired slugs.
  There is **no test product in production** (owner, 2026-09-14): `test-service` is in the retired
  archive only (name/price resolve for old orders; not sellable; its Cal link env is unset and its
  event type deleted). `/booking/schedule` refuses any product with `needsScheduling: false`, so
  neither an old test order nor a Document Review order can open a live calendar. Cal.com has exactly the 10 catalogue event
  types, all `hidden` from the public cal.com profile (so nobody books a paid service for free) and
  timezone-locked; hidden types still serve slots and direct/API bookings. The Cal.com webhook
  must point at the **apex** — `www` 308s and Cal.com does not follow redirects.
- **Booking intake is per-service** (`lib/intake.ts`): each service declares its own questions, which
  map onto the three `booking_intakes` columns (`concern`/`urgency`/`message`) plus labelled extras.
  Nothing is ever uploaded through the site — document review asks the client to reply to the
  post-payment email instead.
- Payment-confirmation emails fire from the **Stripe** webhook (resource delivery) and the **Cal.com**
  webhook (booking confirmation) via `lib/email/resend.tsx`.
- **Money.** Consultations are priced and **charged in AED** (`amountAed`, whole dirhams) — the Stripe
  account's settlement currency. Paid *resources* are priced and charged in **USD cents**. The USD
  figure on a service is a derived reference, never authored by hand and never billed.
  Prices are **displayed in AED everywhere** — there is no IP-based display currency. The
  geo-keyed conversion layer (`lib/currency.ts`, `/api/currency`, `PriceDisplay`,
  `CurrencySwitcher`) was built in Sept 2026 and removed the same week: an approximate figure a
  visitor could not reconcile against the AED they were actually charged bought less than it
  cost. Don't reintroduce it as an implementation detail — it is a pricing decision.
  JSON-LD `priceCurrency` is always `AED`.
  ⚠️ If a `STRIPE_PRICE_*` env var is set, **Stripe's stored price wins and `amountAed` is ignored for
  the actual charge** — code and Stripe can diverge silently. Check both when repricing.
- **Geo must never go through `proxy.ts`.** Widening that matcher deindexed the site in Aug 2026
  (see the comment in `proxy.ts`); `npm run seo:check` fails if it is widened.
- **Reviews** are collected by a daily cron (`/api/cron/review-requests`, scheduled in `vercel.json`
  and authenticated by the `Bearer $CRON_SECRET` header Vercel sends itself) → tokenised
  `/review/<token>` form → `POST /api/reviews` → `testimonials` with `status='pending'` → approved in
  `/dashboard` before anything is published. The token is a stateless HMAC over
  `REVIEW_TOKEN_SECRET`, so rotating that secret invalidates every outstanding review link at once.
  Every rating is requested and accepted; routing low ratings away from the public form is review
  gating and is not done here. Display consent is a separate, required, binary answer — a 1-star
  review and a "don't publish this" 5-star review both reach Karma, and neither publishes itself.
  Runbook: `docs/runbooks/review-request-cron.md`.
- Add a new page → also update `app/sitemap.ts`, footer/nav links, and internal links.

## Environment caveats (IMPORTANT — repo is in a partially-broken sync state)
- **Git**: the real repository with history is **`.git.nosync`** (the `.nosync` suffix keeps iCloud
  from corrupting it). The plain `.git` directory is **invalid/corrupt**; `.git.corrupt-bak` is a
  corrupt backup; `.git 2` / `.git 3` are symlinks to `.git.nosync`. **Do not delete `.git.nosync`.**
  To make `git` work without renaming inside the sync folder, a `.git` *file* containing
  `gitdir: ./.git.nosync` is the safe fix (pending owner confirmation).
- **node_modules**: the complete install lives in `~/.humanly-store/node_modules` (symlinked as
  `node_modules 2`); the in-tree `./node_modules` is incomplete. Run `npm install` to restore a
  working in-tree install before `npm run build`/typecheck.
- Keep **one** `.env` (currently `.env.local` + `.env.example`). See `.env.example` for all keys.

## Working agreement
- Map both sides of a change before making it; reuse existing utilities (`lib/`, `cn` in `lib/utils.ts`).
- Don't introduce new patterns when an existing one fits. Don't burn tokens on prose.
- Surface contradictions instead of guessing (e.g. the `.git` discovery above).
