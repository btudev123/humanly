# Contracts index — Wave 2

Read `docs/adr/0001-pricing-currency-availability-reviews.md` in full before touching any file
below — it has the rationale, the rejected alternatives, and every `[UNVERIFIED]` flag that needs
resolving before ship. This file is just the map of who owns what, so Luke and Mira don't collide.

Every file listed as "new — contract only" currently has real TypeScript signatures and thorough
doc comments but every function body is `throw new Error("not implemented")`. Implement against
the signature; don't change the signature without a conversation with Kyle first — these were
written to make specific mistakes (the AED/USD formatting asymmetry, the alias-vs-archive
resolution order, the second-embed collision) impossible, and a signature change can silently
reopen one of those.

## Workstream A — Service catalogue restructure

**Owner: Luke.** No contract file — the full spec (types, `retiredServiceProducts` shape,
`LEGACY_SLUG_ALIASES`, exact `getServiceProduct()` resolution order, the `lib/intake.ts` follow-on)
is written directly into ADR-0001, Decision A, because `lib/products.ts` itself is explicitly
Wave 2's file and Kyle does not touch it.

- `lib/products.ts` — edit directly per the ADR's spec.
- `lib/intake.ts` — edit in the same PR (dead `"corporate"` branch; see ADR Decision A).

## Workstream B — Multi-currency display

**Owner: Luke** (`lib/currency.ts`, `app/api/currency/route.ts`) **then Mira**
(`components/ui/PriceDisplay.tsx`, and wiring it into `/` and `/services` — both existing pages,
Mira's to edit, not touched here).

| File | Status | Owner |
| --- | --- | --- |
| `lib/currency.ts` | new — contract only | Luke |
| `app/api/currency/route.ts` | new — contract only | Luke |
| `components/ui/PriceDisplay.tsx` | new — contract only | Mira (implements render; may ask Luke to adjust `lib/currency.ts` signatures if the prop contract doesn't fit — talk to Kyle first per above) |

Sequencing: Luke's two files first (Mira's component imports `AedWholeAmount` from
`lib/currency.ts`). Mira does not touch `proxy.ts`, `next.config.js`'s `headers()`, or
`scripts/seo-check.mjs` — none of this workstream should require touching any of them; if it looks
like it does, stop and re-read Decision B's rejected-options list.

## Workstream C — Availability preview

**Owner: Luke** (`lib/cal.ts`, `app/api/availability/route.ts`, the `preferredSlot` addition to
`app/api/checkout/consultation/route.ts`) **then Mira** (the read-only slot-grid UI on `/booking`,
and passing the chosen slot through to `PaidScheduler`'s existing `config` prop in
`app/booking/schedule/page.tsx`).

| File | Status | Owner |
| --- | --- | --- |
| `lib/cal.ts` | new — contract only | Luke |
| `app/api/availability/route.ts` | new — contract only | Luke |
| `app/api/checkout/consultation/route.ts` | existing — add optional `preferredSlot` to the request schema and into `metadata` | Luke |
| `app/booking/schedule/page.tsx` | existing — read `order.metadata.preferredSlot`, pass into `PaidScheduler`'s `config` | Luke or Mira (touches both server resolution and the embed config — coordinate) |
| new slot-grid component on `/booking` | not contracted here (no file named in the plan's deliverable list) | Mira, against `AvailabilityApiResponse` from `app/api/availability/route.ts` |

**Do not** create a second `<Cal>`/`getCalApi()` embed anywhere for the preview. Read ADR-0001
Decision C before writing the preview UI — the collision risk is with `PaidScheduler`'s *global,
unnamespaced* handler, not just "don't reuse the same component instance."

## Workstream D — Review pipeline

**Owner: Luke**, all of it — no frontend-only piece is contracted in this ADR beyond the
`/review/[token]` page and a submission endpoint, both explicitly **not** written here because
they weren't named in the plan's deliverable list (see ADR Decision D's rollback section, which
lists exactly what exists to roll back). Mira builds `/review/[token]` once Luke's
`verifyReviewToken` and `setTestimonialStatus` exist; talk to Kyle before finalizing that page's
shape since it isn't specced.

| File | Status | Owner |
| --- | --- | --- |
| `lib/db/migrations.sql` | edited — `alter table testimonials` appended, ready to run as-is | — (done) |
| `lib/db/schema.ts` | edited — Drizzle documentation mirror of the same columns | — (done) |
| `lib/db/repository.ts` | edited — `getPublishedTestimonials`, `listTestimonials`, `setTestimonialStatus`, `getBookingsEligibleForReviewRequest` appended as contract-only stubs | Luke implements the four stub bodies |
| `lib/reviews.ts` | new — contract only (token generate/verify) | Luke |
| `app/api/cron/review-requests/route.ts` | new — contract only | Luke |
| `emails/ReviewRequestEmail.tsx` + `sendReviewRequest` in `lib/email/resend.tsx` | not created here — build against the existing `sendBookingConfirmation`/`sendPaymentReceipt` pattern already in that file | Luke |
| `.env.example` | edited — `CAL_API_KEY` (parity doc), `REVIEW_TOKEN_SECRET`, `CRON_SECRET` added | — (done); **add the real values to `.env.local` and Vercel before shipping** |

**Both Decision D `[UNVERIFIED]` flags are resolved (2026-09-03) — see the ADR.** `vercel.json`
now exists and is correct (but is still untracked: `git add vercel.json`). The cancellation flag
resolved into a **ship blocker**: `bookings.status` is stored uppercase (`ACCEPTED`), so
`getBookingsEligibleForReviewRequest`'s `where b.status = 'accepted'` matches nothing, and the
Cal webhook route sends a booking-*confirmation* email on every trigger it receives, including
`BOOKING_CANCELLED`. Do not enable the cron until the four fixes listed under ADR-0001 Decision D
land.

## Everything not listed here

Unchanged. In particular: `app/booking/schedule/page.tsx:23-52`'s payment gate,
`app/api/webhooks/cal/route.ts:65`'s `metadata.orderId` join, `proxy.ts`, and
`scripts/seo-check.mjs` are all byte-for-byte untouched by every workstream above. If any Wave 2
change looks like it requires touching one of those four, stop and raise it — that was a hard
constraint on this plan, not an oversight.

---

## Pre-ship status — 2026-09-04 (appended; nothing above is revised)

Owen (`quality`) gated Wave 2 and returned **BLOCK**. This section records what the gate found and
what moved since the tables above were written. Read the tables as the *original* plan and this
section as the current state; where they disagree, this section is newer.

### Workstream B is withdrawn, not implemented

The owner removed IP-based display currency. `lib/currency.ts`, `app/api/currency/route.ts`,
`components/ui/PriceDisplay.tsx` and `components/layout/CurrencySwitcher.tsx` are **deleted**.
Prices display in AED only. Charging never changed and is unaffected (AED for consultations, USD
cents for resources).

This closes both of Decision B's outstanding defects (D-B1's `force-dynamic`-defeats-`revalidate`
bug and D-B2's missing exchangerate-api.com attribution) by deletion rather than by fix, and it
retires the freshness gap the ADR added on 2026-09-03 — there is no approximate figure left to be
stale. Decision B's own "Rollback" section describes exactly this and required no migration.
The ADR's decision history stays as written; Decision B is superseded, not wrong-in-hindsight.

### Changed since the tables above

- **Review consent is a gate, not a flag.** `POST /api/reviews` requires an explicit binary
  `consentDisplay` with no default, independent of rating. Every rating is collected; nothing
  self-publishes. (Decision D anticipated the column; the required-no-default gate is new.)
- **Moderation UI exists.** Submissions land `status = 'pending'`, `published = false` and are
  approved in `/dashboard` before they are readable publicly.
- **`vercel.json` exists** and carries the one cron entry (`0 16 * * *`). It is still UNTRACKED as
  of this writing — `git add vercel.json`, or the cron never deploys. `CRON_SECRET` must
  be set as a Vercel project environment variable — Vercel sends it as `Authorization: Bearer`
  itself; there is no secret field in `vercel.json`.
- **Runbook added:** `docs/runbooks/review-request-cron.md`.

### Availability/Cal items closed in this pass (Luke)

- `app/api/availability/route.ts` — `tz` is client-controlled and reached both the upstream fetch
  cache key and a `funnel_events` insert on every request. It is now normalised to a fixed-offset
  bucket (`lib/cal.ts`'s `normaliseTimeZone`, 418 IANA zones → 26 buckets) before either, and the
  `slot_previewed` write is throttled to one row per product per minute per instance. The
  fail-closed `{ available: false, slots: [] }` + HTTP 200 contract is unchanged.
- `lib/cal.ts` — accepts both slot shapes (`"ISO"` and `{ start: "ISO" }`), so the documented-vs-
  actual contradiction in Cal.com's `/slots` schema degrades instead of failing closed. Verified
  live 2026-09-04: the API returns objects, and `timeZone=Etc/GMT-4` returns byte-identical
  payloads to `timeZone=Asia/Dubai`.
- `lib/products.ts` — `getCalLink`'s fallback now logs a `console.warn` (once per env var,
  server-side). V2 in the ADR stands unchanged as an **owner action**: `the-session`,
  `session-plus-plan` and `full-support` still do not exist as Cal.com event types.
- `components/booking/PaidScheduler.tsx` — takes a server-resolved `productName` prop instead of
  re-finding the product in the live catalogue, which mislabelled retired-slug orders. **This is a
  required-prop signature change**; the only call site is `app/booking/schedule/page.tsx`, whose
  payment gate is untouched.

`proxy.ts`, `next.config.js` and `scripts/seo-check.mjs` remain byte-for-byte untouched, as the
"Everything not listed here" section above requires.

### Decision C′ — auto-booking (2026-09-14)

| File | Change |
|---|---|
| `lib/calBooking.ts` | new — `bookPreferredSlot`, `waitForCalBooking`, `readCalBooking`; the only module that writes to Cal.com |
| `lib/db/repository.ts` | new `claimOrderCalBooking`, `setOrderCalBooking` (`orders.metadata.calBooking`) |
| `lib/cal.ts` | `fresh` option, `isSlotStillOpen`; cache 300s → 60s |
| `app/api/checkout/consultation/route.ts` | `409 { code: "slot_taken" }` when the picked slot is gone |
| `app/api/webhooks/stripe/route.ts` | calls `bookPreferredSlot` after marking paid; receipt omits the schedule CTA when booked |
| `app/booking/schedule/page.tsx` | auto-book → `redirect('/booking/done')`, else embed with `notice`. Payment gate untouched |
| `components/booking/PaidScheduler.tsx` | optional `notice` prop; Dubai-zone date parts |
| `components/booking/AvailabilityPreview.tsx` | Dubai-only; `full` = day buttons + time dropdown; `onAvailabilityChange` prop |
| `lib/products.ts` | `test-service` moved to `retiredServiceProducts` (no test product in production); `serviceProducts` = the 10 public services |

`app/api/webhooks/cal/route.ts` is unchanged — the auto-booking reuses its `metadata.orderId` join.
