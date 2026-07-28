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
  `/checkout`, `/success`, `/payment-failed`, `/privacy`, `/terms`, `/studio` (Sanity Studio).
  SEO: `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`, `app/llms-full/`,
  `app/icon.svg` (favicon).
- `components/` — `layout/` (Navbar, Footer, BrandLogo), `booking/`, `resources/`, `dashboard/`,
  `reviews/`, `ui/`.
- `lib/` — **`products.ts`** (services source of truth: USD cents, Cal/Stripe env maps),
  **`resources.ts`** (tiered resource catalog), **`site.ts`** (site config),
  **`intake.ts`** (per-service booking intake forms), `related.ts` (keyword-driven internal links),
  `seo.ts` + `pageMeta.ts`, `sanity/` (fetch + queries),
  `stripe.ts`, `email/resend.tsx`, `db/` (schema, repository, client), `analytics/funnel.ts`.
- `emails/` — `BookingConfirmationEmail.tsx`, `ResourceDeliveryEmail.tsx`.
- `app/api/` — `checkout/`, `webhooks/stripe/`, `webhooks/cal/`, `resources/`, `dashboard/`.

## Key conventions
- **Brand & design**: see `DESIGN.md`. Poppins everywhere; palette `#3f1b73` / `#7c35e3` / `#fda544`.
  Use the CSS variables / Tailwind tokens (`text-primary-dark`, `bg-accent-orange`, …), not raw hex.
- **Logo**: `<BrandLogo />` (transparent SVG mark + live Poppins wordmark). Never reship a logo with a
  baked-in background.
- **Canonical host is the apex `https://talkhumanly.com`** (`www` redirects to it). Everything
  outward-facing derives from `siteConfig.url` / `absoluteUrl()` — never hard-code a host.
- **Sanity Studio is at `/studio`** (`app/studio/[[...tool]]`, `basePath: '/studio'`). `/sanity/*`
  308-redirects there. The apex must be a CORS origin in Sanity Manage → API.
- Services/pricing flow: `lib/products.ts` → Stripe checkout (`app/api/checkout`) → success redirect.
  Scheduled services redirect to `/booking/schedule` (Cal.com embed); async items email a delivery link.
  `/booking?service=<slug>` preselects a service.
- **Booking intake is per-service** (`lib/intake.ts`): each service declares its own questions, which
  map onto the three `booking_intakes` columns (`concern`/`urgency`/`message`) plus labelled extras.
  Nothing is ever uploaded through the site — document review asks the client to reply to the
  post-payment email instead.
- Payment-confirmation emails fire from the **Stripe** webhook (resource delivery) and the **Cal.com**
  webhook (booking confirmation) via `lib/email/resend.tsx`.
- Money is stored in **USD cents** and charged in USD. AED is shown for display only (reference rate).
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
