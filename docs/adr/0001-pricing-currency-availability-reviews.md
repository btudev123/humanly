# ADR-0001: Service catalogue restructure, display-currency, pre-payment availability, and review pipeline

- **Status:** Accepted
- **Date:** 2026-09-03
- **Owner:** Kyle (architect). Implementation: Luke (backend-dev), Mira (frontend-dev). Gate: Owen (quality).
- **Scope:** `talkhumanly.com` — single-tenant marketing/commerce site. There is no per-customer
  data partition in this schema (no `tenant_id`/`org_id` on any table in `lib/db/schema.ts`); the
  only access boundary is Clerk admin auth on `/dashboard` + `/api/dashboard/*`, gated by
  `ADMIN_EMAILS` (`lib/auth/admin.ts`). The multi-tenancy section of the operating rules is
  therefore **not applicable** to this repo — stated explicitly rather than assumed, per the
  standing instruction not to skip that check.

This ADR bundles four decisions that ship together because two of them (B, C) share a hard
constraint — `proxy.ts`'s narrowed Clerk matcher and the static generation of `/` and `/services` —
and all four touch `lib/products.ts`, `orders`, or both.

---

## Decision A — Service catalogue restructure

**Decision, in one sentence:** `ServiceCategory` becomes `"core" | "specialist" | "retainer"`
(deleting `"corporate"`), and every slug ever charged — including the five being removed from the
live catalogue — stays resolvable by `getServiceProduct()` through a three-step lookup: live
catalogue → alias map → retired archive.

### Why this needs a decision instead of a straight edit

`orders.product_slug` is a bare `varchar`, not a foreign key (this schema has no foreign keys
anywhere — confirmed by reading `lib/db/schema.ts` and `lib/db/migrations.sql` in full). It stores
whatever slug was live *at the moment of purchase* and is never rewritten. Three call sites read it
back through `getServiceProduct()` on historical orders, indefinitely:

- `app/booking/schedule/page.tsx:51` — resolves the Cal link to show after payment.
- `app/api/webhooks/stripe/route.ts` (`sendConsultationReceipt`, `notifyPaidConsultationLead`) —
  resolves the product name/price for the receipt and lead-notification emails.
- `app/api/webhooks/cal/route.ts` — indirectly, via `order.product_slug` used as the `service` label
  when no title is present.

If `serviceProducts` simply loses five entries, `getServiceProduct()` returns `undefined` for any
past order against `individual-advisory`, `extended-advisory`, `uae-relocation-qa`,
`lunch-and-learn`, or `hr-compliance-advisory` — a subscription retainer renewing next month, a
pending Stripe session mid-checkout, or a six-month-old order a client emails about. Every
call site above already has an `undefined`-safe fallback (`product?.name || order.product_slug`,
etc.), so nothing crashes — but the receipt silently degrades to a raw slug string, the Cal link
falls back to the wrong generic event type, and reporting can no longer join a slug to a price.
That is a data-integrity regression, not a crash, which is exactly the kind of failure that goes
unnoticed until Karma asks why an old client's invoice says `individual-advisory`.

### Options considered

1. **Soft-delete in place** — keep removed products in `serviceProducts` with an `active: false`
   flag, filter them out of public UI iteration. Rejected: the array is iterated directly by both
   `ServicesCatalog.tsx` and `BookingFunnel.tsx` (confirmed by grep — both import `serviceProducts`
   and filter/map it themselves), so every current and future consumer of that array would need to
   remember to filter `active`. One missed filter re-lists a discontinued product for sale. An
   inactive product also has no natural "this slug now means something else" story for the renamed
   `interview-prep` (800→950 AED) and `interview-prep-package` (2000→2400 AED) price changes,
   which aren't removals at all.
2. **Rewrite `orders.product_slug` at read time via a migration** (bulk-update historical rows to
   point removed slugs at their replacement) — rejected: destroys the historical record. An order
   that was actually sold as `individual-advisory` at 1200 AED under `category: "session"` should
   still say that a year from now; silently relabelling it as `full-support` (a different tier, a
   different feature set) misrepresents what the client paid for and what any refund/dispute
   process would need to reference. Money-adjacent history is exactly the data you don't rewrite.
3. **Two arrays, no alias map** — a `serviceProducts` (live) and `retiredServiceProducts` (archive),
   with `getServiceProduct()` checking both, but no `LEGACY_SLUG_ALIASES`. Rejected on its own:
   doesn't solve the *rename* cases. `interview-prep` and `interview-prep-package` keep their slugs
   (only the price changes) so they need no alias — but `individual-advisory` doesn't map to any
   single retired record with unambiguous current pricing context; the receipt/lead emails for a
   *future* order can never reference it (it's gone from checkout), so the only place it's read is
   historical orders, which the retired archive alone actually serves. The alias map earns its
   place for a narrower reason: three products are being deleted with a stated intent
   ("individual-advisory → full-support" etc.) so that anything that *isn't* reading pure historical
   pricing (e.g. a stale bookmarked `/booking?service=individual-advisory` link, or an old
   marketing email) redirects a *visitor* to a live equivalent instead of 404ing. That's a live-UX
   concern, separate from the archive's historical-integrity concern — hence both mechanisms.
4. **Chosen: live catalogue + `LEGACY_SLUG_ALIASES` + `retiredServiceProducts` archive**, three-step
   resolution in `getServiceProduct()`.

### Resolution order (exact contract for `getServiceProduct()`)

```
getServiceProduct(slug):
  1. exact match in `serviceProducts` (live)      → return it, unchanged behaviour
  2. slug is a key in `LEGACY_SLUG_ALIASES`        → return the LIVE product the alias points to
  3. exact match in `retiredServiceProducts`       → return the retired record AS RECORDED
     (its own name/price/category at time of sale — never the alias target)
  4. no match anywhere                             → return undefined (existing behaviour)
```

Step 2 and step 3 must stay in that order and must not be merged: a **live** call site
(`/booking?service=individual-advisory` from an old email, or a future checkout POST body)
should land on `full-support` and let the visitor buy at today's price and terms. A **historical**
order lookup for `individual-advisory` must *not* be silently rewritten to `full-support`'s
1200 AED / 60-min / "best" framing — it must return the retired record's own stored shape
(1200 AED already, coincidentally, but `extended-advisory` was 1800 AED for 90 minutes and must
never report as `full-support`'s 1200/60min). Concretely: **`getServiceProduct()` never applies the
alias to a slug that is *also* present in `retiredServiceProducts`** — the two are keyed off the
same set of five removed slugs but serve opposite lookups. The alias map exists for callers passing
a slug that *isn't yet an order* (checkout requests, `?service=` query params); the archive exists
for callers reading a slug that *is already an order*. Both eventually call `getServiceProduct()`,
so the function itself cannot tell which caller it's serving — which is why the order matters:
resolving through the alias *first* would make every historical `individual-advisory` order report
as `full-support`, which is Option 2, rejected above, by accident. Resolving through the archive
first would make `?service=individual-advisory` render the (removed, non-purchasable) retired
product on `/booking` instead of redirecting to `full-support`.

**Practical resolution of that tension:** the alias is consulted only by *checkout-time* code paths
(new order creation) before the retired archive is ever reached; the retired archive is consulted
only by *order-read* code paths. Since `getServiceProduct(slug)` is a single shared function used by
both, the contract Luke implements is: **try live catalogue, then retired archive, then alias** —
i.e. archive before alias — so that a slug already recorded in `retiredServiceProducts` (the
historical-integrity case, which is the irreversible one if gotten wrong) always wins over the
alias (the UX-redirect case, which is recoverable — a stale link just needs the caller to redirect,
which `/booking`'s existing `?service=` handling already treats as "not found in
`serviceProducts`" and falls back to the default selection). Luke: implement archive-before-alias;
the three call sites that read *orders* only ever pass a `product_slug` that was actually charged,
so they always hit either the live catalogue or the archive — never the alias — making this
ordering safe for both use cases without the caller needing to know which one it is.

### Which exported list the public UI maps over

`serviceProducts` stays the single export that `ServicesCatalog.tsx` and `BookingFunnel.tsx`
iterate (unchanged import, unchanged filter-by-category logic in both files) — it contains **only**
the ten live products (three-tier core ladder + four specialist + three retainers). `LEGACY_SLUG_ALIASES`
and `retiredServiceProducts` are net-new exports that neither existing UI file imports; they exist
solely for `getServiceProduct()`'s internal resolution and for the webhook/schedule read paths that
call it directly. This is a **zero-diff for `ServicesCatalog.tsx` and `BookingFunnel.tsx`** — they
never see retired products because they never import the archive, and `getServiceProduct()` is
never called by either file (confirmed by grep: both import `serviceProducts` directly, not
`getServiceProduct`).

### Shape (spec for Luke — `lib/products.ts` is his file to edit, not written here)

```ts
export type ServiceCategory = "core" | "specialist" | "retainer";

export type ServiceProduct = {
  // ...existing fields, unchanged...
  category: ServiceCategory;
  tier?: "good" | "better" | "best"; // core ladder only; undefined for specialist/retainer
};

/** Slugs removed from the live catalogue, kept exactly as they were priced/named when sold.
 *  Read-only history — `getServiceProduct()` returns these unmodified. Never merge this into
 *  `serviceProducts`; never let public UI iterate it. */
export const retiredServiceProducts: ServiceProduct[] = [
  /* individual-advisory, extended-advisory, uae-relocation-qa, lunch-and-learn,
     hr-compliance-advisory — full ServiceProduct records exactly as they read today,
     category left as "session"/"corporate" (the OLD ServiceCategory values — see below) */
];

/** Old slug → live slug a *new* checkout/lookup should resolve to. Consulted only when the
 *  requested slug is absent from BOTH `serviceProducts` and `retiredServiceProducts`... */
```

Wait — that last comment is wrong and worth flagging precisely because it's the mistake this ADR
exists to prevent: **the alias keys (`individual-advisory`, `extended-advisory`,
`uae-relocation-qa`) are exactly the slugs that *also* exist in `retiredServiceProducts`.** So the
correct implementation note for Luke is: check `retiredServiceProducts` **before**
`LEGACY_SLUG_ALIASES`, per the resolution order above — not "alias consulted when absent from the
archive," which would never fire.

```ts
export const LEGACY_SLUG_ALIASES: Record<string, string> = {
  "individual-advisory": "full-support",
  "extended-advisory": "full-support",
  "uae-relocation-qa": "dubai-job-search",
};

export function getServiceProduct(slug: string | null | undefined): ServiceProduct | undefined {
  if (!slug) return undefined;
  return (
    serviceProducts.find((p) => p.slug === slug) ??
    retiredServiceProducts.find((p) => p.slug === slug) ??
    serviceProducts.find((p) => p.slug === LEGACY_SLUG_ALIASES[slug])
  );
}
```

Note `retiredServiceProducts` entries keep the **old** `ServiceCategory` values (`"session"`,
`"corporate"`) that are being deleted from the type — so `ServiceProduct["category"]` must widen
for retired records, or `retiredServiceProducts` must be typed as a distinct
`RetiredServiceProduct` shape carrying `category: string` instead of the narrowed union. **Flag for
Luke:** decide between widening `category` to `ServiceCategory | (string & {})` on the shared type
(simplest, but weakens the live catalogue's type safety) or a separate
`RetiredServiceProduct = Omit<ServiceProduct, "category"> & { category: string }` type
(cleaner, more code). Recommendation: the separate type — the live catalogue is the one place
category exhaustiveness matters (category labels, filters), and retired records are read-only pass
throughs that only ever get their `.name`/`.amountAed`/`.category` string-interpolated into an
email, never switched on.

### `lib/intake.ts` follow-on (flagged, not this ADR's to fix)

`getIntakeForm()` falls back to `product.category === "corporate"` and `FORMS_BY_SLUG` keys three of
the five removed slugs (`uae-relocation-qa`, `lunch-and-learn`, `hr-compliance-advisory`). Once
`"corporate"` is removed from `ServiceCategory`, that branch is unreachable dead code (harmless —
TypeScript will flag the comparison as impossible once `category` is narrowed, which is a
compile-time signal, not a runtime bug) and the three `FORMS_BY_SLUG` entries become orphaned but
harmless (still resolvable for retired-order lookups, if `getIntakeForm` is ever called with a
retired product — grep shows it currently is only called from `BookingFunnel.tsx` against the live
catalogue, so this is inert). **Luke: touch `lib/intake.ts` in the same PR as `lib/products.ts`**
to remove the dead `"corporate"` branch cleanly rather than leaving a comparison TypeScript can't
prove is impossible if `category`'s type ends up widened per the flag above.

### Consequences

- Positive: every past order — including subscriptions still renewing — keeps resolving to correct
  historical pricing/name/Cal link forever, with no migration of `orders` required.
- Positive: `?service=<old-slug>` links (bookmarks, old marketing emails, indexed search results
  for `/booking?service=individual-advisory`) redirect to a real, purchasable product instead of
  silently falling through to the default selection.
- Negative: `getServiceProduct()` grows from an O(1)-ish `.find()` to up to three linear scans.
  Immaterial at current catalogue size (10 live + 5 retired) — flagged only so a future catalogue
  of hundreds of products doesn't inherit this without noticing.
- Negative: two lookup tables to keep in sync by hand if a sixth product is ever retired. No
  registry/lint enforces "every removed slug gets an archive entry" — that discipline is manual.
- Negative: `retiredServiceProducts` duplicates the full `ServiceProduct` shape (description,
  features, forWho, etc.) for records nothing renders — only `.name`, `.amountAed`, `.priceNote`,
  and `.category` are ever read from a retired lookup (per the three call sites above). Carrying
  the full shape is deliberate: a partial "receipt-only" type would need its own maintenance and
  buys nothing, since these records never change again.

### What would make this decision wrong later

- If a retired product needs to be **revived** (e.g. `lunch-and-learn` comes back with the same
  slug) — the archive entry and the live entry would collide. Revisit: rename the returning slug,
  or add explicit precedence rules to `getServiceProduct()` beyond "live wins," which today's
  three-step order already handles (live is checked first) — so this is actually already safe,
  documented here as the check that confirms it, not a gap.
- If order volume against removed slugs stays material two years out (i.e., `extended-advisory`
  keeps showing up in support tickets), consider whether it should have stayed live instead of
  removed — a product decision, not an architecture one, but the trigger to raise it.
- If a sixth-plus product is retired without a corresponding `retiredServiceProducts` entry (the
  manual-sync risk above materializing), historical orders for it silently degrade exactly as
  described in "why this needs a decision." Trigger: any `getServiceProduct()` call site's fallback
  path (`product?.name || order.product_slug`) actually firing in production logs — that fallback
  firing at all means an archive entry is missing.

### Rollback

Revert the `lib/products.ts` diff. `orders.product_slug` was never rewritten, so every historical
order is exactly as valid under the old flat array as under the new one — this decision has no
migration step and therefore no forward-only state to unwind.

---

## Decision B — Multi-currency display, AED-only charging

**Decision, in one sentence:** Stripe keeps charging exactly what it charges today (AED, unchanged);
a new `/api/currency` route derived from `x-vercel-ip-country` supplies a client component with a
target currency and conversion rates, and that client component is the *only* thing that ever shows
a non-AED figure — server-rendered pages always show AED first.

### Options considered

1. **Geo-detect in `proxy.ts`** (read country there, set a cookie or rewrite headers before the page
   renders) — rejected outright, and this is the hard constraint the plan already names. Widening
   `proxy.ts`'s matcher — or even adding logic to the file's exported `config.matcher` — is exactly
   the regression `scripts/seo-check.mjs` exists to catch (it fails CI on that regression by design,
   per the comment block in `proxy.ts` itself, which documents the August 2026 deindexing incident).
   Reading `x-vercel-ip-country` doesn't require `proxy.ts` at all — it's available in any Route
   Handler or Server Component via `headers()` — so there's no upside to the risk.
2. **Server-side geo in `/` and `/services` themselves** (read the header in the page component,
   render the converted price directly) — rejected. Both routes are statically generated (confirmed:
   neither has `export const dynamic` and both are plain async Server Components with no
   `searchParams`/`headers()` read today). Reading a per-request header inside them forces Next to
   treat the route as dynamic, losing the static generation the site currently depends on for those
   two pages, and produces a page that no longer matches what `npm run seo:check` fetches with a
   generic Googlebot UA carrying no meaningful geo signal — Google would see whatever currency
   Vercel's crawl-time IP resolves to, inconsistently, which is worse for SEO than a consistent AED
   figure.
3. **Client-only, no server AED render** (blank/skeleton price until the client fetches currency) —
   rejected. Violates the constraint that the server-rendered price must be cacheable and match the
   charged amount for JSON-LD; a loading skeleton on every price on `/services` is also a worse
   Core Web Vitals story (CLS) than rendering AED immediately and swapping in place.
4. **Cal.com's or Stripe's native geo/multi-currency support** — rejected: Stripe Checkout can
   present multi-currency at the payment step, but the plan's hard constraint is that *charging*
   stays 100% AED (Stripe untouched) — this is a display-only feature by explicit instruction, so
   Stripe's own currency presentation isn't in scope regardless of its capability.
5. **Chosen:** server renders AED (static, cacheable, matches `orders.currency` / `orders.amount`
   exactly), a client component fetches `/api/currency` after mount and swaps in a converted,
   clearly-approximate figure.

### Why the asymmetry note on `formatUsd`/`formatAed` matters here

`lib/products.ts` today has `formatUsd(cents)` (divides by 100) and `formatAed(wholeDirhams)`
(does not divide) sitting next to each other with only a doc comment distinguishing them — a real,
already-present foot-gun (nothing currently calls them incorrectly, per grep, but nothing stops a
future call from doing so either). `currency.ts` must not add a third convention. Its contract:
**every amount that enters or leaves `lib/currency.ts` is a whole-unit amount** (matching
`ServiceProduct.amountAed`'s own convention) — never a minor-unit (cents/fils) amount. The type
contracts below use nominal branding so a plain `number` cannot be passed where a branded whole-unit
amount is expected without going through an explicit conversion, which is the concrete mechanism
that makes the asymmetry "impossible to get wrong" rather than just documented against.

### Consequences

- Positive: `/` and `/services` keep their static generation; AED is always the first-paint price,
  matching what Stripe will actually charge and what any current/future JSON-LD `priceCurrency`
  states.
- Positive: `proxy.ts`'s matcher and `seo-check.mjs` are both completely untouched — zero risk to
  the indexability fix that shipped in the prior commit.
- Negative: every priced element flashes from AED to local currency after mount for non-AED
  visitors — an unavoidable consequence of "server can't know geo for a static page." Mitigate with
  a fast, low-jank swap (no layout shift — same string length budget) rather than eliminating it.
- Negative: `open.er-api.com` is a third-party dependency with no SLA on record here.
  **[RESOLVED 2026-09-03 — CONFIRMED, with two defects]** Terms verified at
  <https://www.exchangerate-api.com/docs/free>: the Open Access endpoint needs no API key, is
  explicitly licensed for "either personal or **commercial** currency conversion purposes,"
  permits caching, forbids re-distribution, **requires attribution** (`<a
  href="https://www.exchangerate-api.com">Rates By Exchange Rate API</a>` "on the pages you're
  using these rates with"), refreshes **once per 24h**, and is rate-limited — "If you only
  request once every 24 hours you won't need to read any more of this section… Rate limited IP's
  will receive HTTP code 429 responses. After 20 minutes the rate limit will finish."
  So 86400s is exactly the right TTL. Two defects found in the implementation, both filed for
  Luke: (D-B1) `export const dynamic = "force-dynamic"` in `app/api/currency/route.ts:34`
  **defeats** the `next: { revalidate: 86400 }` on line 48 — Next's own docs
  (<https://nextjs.org/docs/app/guides/caching-without-cache-components>, "Caching and
  Revalidating (Previous Model)", which applies because `cacheComponents` is not enabled in
  `next.config.js`) state `force-dynamic` "is equivalent to … setting the option of every
  `fetch()` request … to `{ cache: 'no-store', next: { revalidate: 0 } }` [and] setting the
  segment config to `export const fetchCache = 'force-no-store'`", and `force-no-store`
  "forces all fetch requests to be re-fetched every request even if they provide a
  `'force-cache'` option." One upstream call per visitor ⇒ guaranteed 429s. (D-B2) the required
  attribution link is rendered nowhere on the site.
  The 86400s cache plus `FALLBACK_RATES` bounds the blast radius of an outage to "stale or
  hardcoded rates," never a broken page, by design — but see the freshness gap below.
- Negative **[added 2026-09-03]**: neither `CurrencyApiResponse` nor `PriceDisplay` can tell a
  live rate from `FALLBACK_RATES`, so a provider outage (or a 429 from D-B1) silently renders an
  approximate figure off hardcoded rates with no signal. AED↔USD is pegged (3.6725) so USD is
  safe indefinitely; GBP/CAD/AUD float. Per the standing rule — never display a wrong number,
  fall back to AED-only instead — the fix is to surface freshness, not to remove the fallback:
  add `ratesFresh: boolean` (or `ratesAsOf: number | null`, from the provider's own
  `time_last_update_unix`) to `CurrencyApiResponse`, and have `PriceDisplay` render AED-only
  when it is false.
- Negative: `FALLBACK_RATES` will drift from real exchange rates the longer an outage or a forgotten
  update persists. This is accepted risk for a **display-only, approximate, "≈"-prefixed** figure —
  explicitly not the charged amount — but the trigger below names when it stops being acceptable.

### What would make this decision wrong later

- If a customer disputes a charge because a displayed (converted) price didn't match what Stripe
  charged them in AED — the "≈" + "charged in AED" copy is the mitigation; if disputes happen
  anyway, the fix is clearer/larger copy, not a new architecture.
- If Vercel ever stops sending `x-vercel-ip-country` (platform change) or the site moves off Vercel
  — `currencyForCountry(undefined)` already defaults to USD per the spec, so this degrades safely,
  but it's the trigger to revisit geo detection entirely (e.g. a client-side geolocation API prompt,
  which has its own UX cost).
- If Stripe Checkout is ever asked to charge in the visitor's local currency (a genuine pricing
  strategy change, not this ADR's scope) — this whole display-only layer becomes redundant with
  Stripe's native presentment currency and should be removed, not layered under it.

### Rollback

Delete `lib/currency.ts`, `app/api/currency/route.ts`, `components/ui/PriceDisplay.tsx`, and any
import of `PriceDisplay` from `/` or `/services` (Wave 2's edit, reverted). No schema, no `orders`
data, no Stripe configuration is touched by this decision, so rollback is a pure code revert with no
migration to unwind.

---

## Decision C — Read-only availability preview before payment

**Decision, in one sentence:** A new server-only `lib/cal.ts` calls Cal.com's v2 `/slots` API
(read-only, no booking capability) to render our own slot grid pre-payment, while the existing paid,
booking-capable `PaidScheduler` embed and its `metadata.orderId` join stay byte-for-byte unchanged.

### Options considered

1. **A second `<Cal>` embed pre-payment** — rejected, and this is the plan's named hard constraint.
   `@calcom/embed-react`'s `getCalApi()` returns a **global** handler (confirmed:
   `PaidScheduler.tsx` calls `getCalApi()` with no namespace argument and registers `cal("on", ...)`
   against it). A second, unnamespaced embed rendered anywhere else on the same client — even on a
   different page, if both mount within the same session — would share that global handler, so the
   `bookingSuccessfulV2` listener `PaidScheduler` registers (which drives the redirect to
   `/booking/done`) could fire off a booking made in the *pre-payment* preview embed instead of the
   paid one, or fail to fire at all if the preview embed's own listener races it. Namespacing
   (`getCalApi({ namespace: "preview" })`) would avoid the collision but doesn't avoid the deeper
   problem: **a second embed is bookable.** Cal's embed always renders a live booking flow; there is
   no "preview only, can't submit" mode documented for the embed component itself
   **[RESOLVED 2026-09-03 — CONFIRMED; constraint honoured by the implementation]** The installed
   types (`node_modules/@calcom/embed-react/dist/embed-react/src/Cal.d.ts`) expose exactly
   `calOrigin | calLink | initConfig | namespace | config | embedJsUrl`; there is no read-only /
   disabled-submit option anywhere in `PrefillAndIframeAttrsConfig` or `KnownConfig`
   (`@calcom/embed-core/dist/src/embed-iframe.d.ts:13`, `.../types.d.ts:37`). `getCalApi()`'s
   `namespace` argument exists but, as argued below, namespacing was never the whole answer.
   The built `AvailabilityPreview.tsx` avoids the collision the right way — it imports nothing
   from `@calcom/embed-react` and renders our own chips off `/api/availability` (verified: a repo
   grep for `getCalApi|@calcom/embed` matches only `PaidScheduler.tsx:5,43`). One embed, one
   global handler, no second bookable surface — so a second embed risks a visitor
   completing a real Cal.com booking with no linked `orderId`, no payment, and no
   `metadata[orderId]` for the webhook to join against, silently producing an unpaid `bookings` row
   indistinguishable from a paid one except by the (nullable) `order_id` column.
2. **Cal.com's native Stripe app** (Cal.com collects payment itself via its Stripe integration) —
   rejected. This would move the payment gate *into* Cal.com, which contradicts the plan's explicit
   instruction not to change `app/booking/schedule/page.tsx:23-52`'s payment gate or the
   `metadata.orderId` join in the webhook, and more fundamentally would split "the source of truth
   for whether someone paid" between Stripe (current) and Cal.com's own payment records — this repo
   already has a working, webhook-verified Stripe-first payment flow; introducing a second payment
   surface is a strictly worse architecture for reconciliation, not a lateral one.
3. **Poll Cal.com's public booking page and scrape/iframe it read-only** — rejected without much
   discussion: fragile, against Cal.com's terms in spirit, and the documented v2 `/slots` REST
   endpoint already does exactly this job with a stable contract.
4. **Chosen:** `GET /v2/slots` via `lib/cal.ts`, our own presentational grid, `CAL_API_KEY`
   (present in `.env.local`, referenced by zero code today — confirmed by grep) — read availability
   only, never write.

### How a previewed slot survives into the paid embed

The preview is explicitly a *preference*, not a hold — Cal.com's `/slots` endpoint returns
availability, not a reservation, so a slot shown in the preview can be taken by someone else before
this visitor pays (accepted; the plan does not ask for a hold/lock mechanism, and adding one would
mean writing to Cal.com pre-payment, which is exactly the "bookable surface" this ADR avoids).
Contract for carrying the preference forward:

1. The consultation checkout POST body (`app/api/checkout/consultation/route.ts` — Wave 2's file,
   unchanged by me) gains one optional field, `preferredSlot?: string` (ISO instant), which
   `createPendingOrder`'s existing free-form `metadata` JSONB column already accommodates with no
   schema change — `metadata.preferredSlot` sits next to the existing `concern`/`urgency`/`message`
   metadata keys.
2. `app/booking/schedule/page.tsx` (Wave 2's file) reads `order.metadata.preferredSlot` alongside
   the `product` it already resolves, and — if present and still in the future — passes it into
   `PaidScheduler`'s existing `config` prop as an additional Cal.com embed config key
   (`config.date` per Cal's month/date deep-link convention).
   **[RESOLVED 2026-09-03 — key names CONFIRMED; step 2 NOT IMPLEMENTED — defect]**
   Config keys: the Cal.com Booker reads exactly three query params —
   `date` (`YYYY-MM-DD`), `month` (`YYYY-MM`) and `slot` (the timeslot string) — see
   `packages/features/bookings/Booker/store.ts` on `calcom/cal.com@main`, lines 457
   (`selectedDate: getQueryParam("date") || null`), 520-523 (`month: getQueryParam("month") || …`)
   and 677 (`selectedTimeslot: getQueryParam("slot") || null`). Every `config` key is forwarded
   verbatim as an iframe query param — `createIframe` → `buildFilteredQueryParams` in the
   installed `node_modules/@calcom/embed-core/dist/embed/embed.js` sets each entry of `config`
   (minus `iframeAttrs`) on the iframe URL, which is why `metadata[orderId]` already works. So
   `config.month` + `config.date` (+ optional `config.slot`) is the correct wiring.
   Implementation gap: `app/booking/schedule/page.tsx:51-52` never reads
   `order.metadata.preferredSlot` and never passes `preferredSlot` to `PaidScheduler`, and
   `PaidScheduler.tsx` computes `heading` from the prop (line 37) but renders a hardcoded string
   (line 81) and passes no `date`/`month`/`slot` into `config` (lines 110-121). The preference is
   written at checkout (`app/api/checkout/consultation/route.ts:98`) and read by nothing.
   This is additive to `PaidScheduler`'s existing `config` object — no other prop changes.
3. If the preferred slot is no longer available by the time the embed loads (someone else took it),
   Cal's own UI handles that the same way it already handles any unavailable-slot selection — no
   new error path is needed because the embed was never told to *commit* to that slot, only to open
   pre-scrolled/pre-selected to it.

This keeps the payment gate (`app/booking/schedule/page.tsx:23-52`) and the webhook's
`metadata.orderId` join completely untouched, per the constraint — the preference rides in the
*existing* `orders.metadata` column, not a new one.

### Consequences

- Positive: a visitor sees real availability before paying, which the plan identifies as a
  conversion lever, without a single write path to Cal.com opening up pre-payment.
- Positive: `CAL_API_KEY` — sitting unused in `.env.local` today — gets its first consumer, and its
  scope (read `/slots` only) is the minimum the feature needs.
- Negative: the preview can show a slot that's gone by the time the visitor pays and reaches the
  real embed (accepted — see above; no lock mechanism was in scope).
- Negative: `getAvailableSlots` returning `[]` on **any** failure (rate limit, timeout, malformed
  `calLinkEnv`, Cal.com outage) is a deliberately fail-closed contract for the preview grid — it
  degrades to "no times shown" rather than surfacing an error state that implies something is
  broken about booking itself (which still works, unaffected, at `/booking/schedule`). Trade-off:
  a real Cal.com outage looks identical to "this service has no availability" in the preview, which
  could read as a dead end. Mitigate in copy (Mira's call), not in `lib/cal.ts`'s contract.
- Negative: `cal-api-version: 2024-09-04` is a hard, dated pin (Cal's v2 API is versioned per
  header, not per URL). If Cal.com deprecates that version, `getAvailableSlots` fails closed (empty
  array) rather than erroring loudly — same trade-off as above, silent until someone notices the
  preview grid is permanently empty.

### What would make this decision wrong later

- If Cal.com ships an official "hold this slot for N minutes" primitive — worth revisiting whether
  the preview should reserve, not just preview, closing the "slot taken between preview and payment"
  gap. **[RESOLVED 2026-09-03 — the ADR was WRONG: this primitive already exists.]** Cal.com v2
  documents `Reserve a slot` — "Make a slot not available for others to book for a certain period
  of time… defaults to 5 minutes" — plus `Get reserved slot`, `Update a reserved slot` and
  `Delete a reserved slot` (<https://cal.com/docs/api-reference/v2/slots/reserve-a-slot.md>,
  listed in <https://cal.com/docs/llms.txt>). This trigger has therefore already fired. It does
  **not** change Decision C for this wave — reserving is a *write* to Cal.com pre-payment, which
  is precisely the surface this decision closed, and holds would need an expiry/release story
  tied to Stripe checkout abandonment. Revisit as its own ADR if "slot taken between preview and
  payment" shows up in real support volume; do not bolt it on here.
- If the 300s cache on `getAvailableSlots` causes visibly stale availability at the volume this site
  actually sees (a slot shown as open for up to 5 minutes after it's taken) — tune the TTL down;
  the number was chosen as a starting point to bound Cal.com API load, not derived from traffic
  data `[NEEDS DATA: booking volume/concurrency to size this properly]`.
- If `cal-api-version: 2024-09-04` is deprecated by Cal.com — the fail-closed empty-array behavior
  means this could go unnoticed without monitoring; Jonas (`platform`) should own alerting on
  `getAvailableSlots`'s failure branch once this ships, not just the ADR noting the risk.

### Rollback

Delete `lib/cal.ts` and `app/api/availability/route.ts`; drop `preferredSlot` from the checkout
metadata payload and from `PaidScheduler`'s config (Wave 2's edits, reverted). `CAL_API_KEY` goes
back to being unused. No schema change, no `orders` migration — `metadata.preferredSlot` on any
order created while this was live is simply an inert extra key in a JSONB column already tolerant
of extra keys (every other metadata consumer reads named keys and ignores the rest, per
`metaStr()`'s pattern in both webhook routes).

---

## Decision D — Review pipeline

**Decision, in one sentence:** `testimonials` gains a moderation workflow (`status` +
rating/consent/booking-link columns, no foreign keys — matching this schema's existing convention
of zero FKs anywhere) driven by a stateless HMAC-signed review-request link, sent by a
`CRON_SECRET`-guarded daily job three to four days after a booking's `end_time`.

### Options considered

1. **A `reviews` table separate from `testimonials`**, with `testimonials` staying write-only/admin
   -curated as it is today and a new table holding customer-submitted, unmoderated reviews. Rejected:
   doubles the read surface (`getPublishedTestimonials` would need to union two tables or the site
   needs two carousels) for no benefit the plan asks for — the plan explicitly extends
   `testimonials` with a `status` column, i.e. customer submissions and admin-curated quotes go
   through the *same* moderation gate before either is published. One table, one gate.
2. **Session-based auth for the review link** (a magic-link login rather than a stateless signed
   token) — rejected. This site has no customer account system at all (Clerk is admin-only, scoped
   to `/dashboard`); building one just to gate a single-use review form is a large addition for a
   narrow need. A stateless HMAC token scoped to one `cal_booking_uid` with a 60-day expiry gives
   the same one-time, unguessable-URL security property (can't enumerate other bookings' review
   links) without any session state, matching the pattern this repo already uses for webhook
   signature verification (`crypto.timingSafeEqual`, already imported in
   `app/api/webhooks/cal/route.ts` — same primitive, same constant-time-compare discipline, reused
   here rather than reinvented).
3. **Foreign key from `testimonials`/review submissions to `bookings`/`orders`** — rejected, matching
   this schema's stated convention: `lib/db/schema.ts` declares no foreign keys on any of its nine
   tables (`orders`, `bookings`, `booking_intakes`, `resource_entitlements`, etc. all reference each
   other only by bare `uuid`/`varchar` columns with no `references()`). `cal_booking_uid` on
   `testimonials` follows that same convention — a plain `varchar(200)`, joined at query time the
   same way `bookings.order_id` already is. Introducing the repo's first FK here, for one feature,
   would be inconsistent with every other join in the schema and is out of scope for this ADR to
   unilaterally decide to change project-wide.
4. **Chosen:** extend `testimonials` in place per the migration below; stateless HMAC token; daily
   cron.

### Token contract

`token = "<cal_booking_uid>.<sig>"` where `sig = HMAC-SHA256("<cal_booking_uid>.<expiry_unix>",
REVIEW_TOKEN_SECRET)`, URL form `/review/<cal_booking_uid>.<sig>`. **Flag:** the plan's stated URL
form (`/review/<uid>.<sig>`) does not itself carry the expiry — so verification must either (a)
re-derive expiry from `bookings.end_time + 60 days` by looking up `cal_booking_uid` before checking
the signature, or (b) the token must actually encode expiry too
(`<uid>.<expiry>.<sig>`, three dot-separated segments) so verification is self-contained and doesn't
require a DB read just to know whether to bother checking the signature. **Recommendation: encode
expiry in the token** (`<uid>.<expiry>.<sig>`) — it costs nothing in URL length that matters, and it
means a request with a garbage/expired token can be rejected before touching the database at all,
which is the better failure mode for a public, unauthenticated endpoint. This is a deviation from
the plan's literal two-segment URL form, flagged here rather than silently implemented either way —
Luke should confirm this reading before building `/review/[token]`
[UNVERIFIED: whether the two-segment form was a deliberate simplification the plan's author intended
or shorthand — the three-segment form is what `lib/reviews.ts` below actually implements].

**[RESOLVED 2026-09-03 — Cal.com `uid` character set: DISMISSED as a risk; the throw is fine.]**
Cal.com types the booking uid as `short.SUUID` — see `uid: short.SUUID` in
`packages/features/bookings/lib/handleNewBooking/createBooking.ts` (line 20) on
`calcom/cal.com@main`. `short-uuid`'s default translator is `flickrBase58`
(<https://github.com/oculus42/short-uuid> README: "Default is `flickrBase58`", sample output
`mhvXdrZT4jP5T8vBxuvm75`), a Base58 alphabet — alphanumeric only, no `.`, no `/`, no padding
characters. A `.` in a `cal_booking_uid` is therefore not reachable through any normal Cal.com
booking. The `throw` in `generateReviewToken` is also the *right* failure mode as built: the cron
calls `buildReviewPath` inside its per-booking `try/catch`
(`app/api/cron/review-requests/route.ts:60-91`), so a hypothetical dotted uid increments `failed`
and the batch continues — it cannot crash the run. No change required; Luke should just downgrade
the `[UNVERIFIED]` comment in `lib/reviews.ts:54-55` to a citation of this paragraph.

### Cron selection contract

Daily job selects `bookings` where `end_time` is between `now() - 4 days` and `now() - 3 days`,
`status = 'accepted'`, deduplicated via `email_events` (`kind = 'review_request'`) — i.e. a booking
is only ever sent one review request, checked by whether an `email_events` row already exists for
that recipient+kind (matching the existing `recordEmailEvent` pattern already used by every other
outbound email in `lib/email/resend.tsx`, reused rather than inventing a `reviews_sent` flag on
`bookings`).

### Consequences

- Positive: no new auth system, no FK added, no change to any existing route or the payment/booking
  flow — this is additive-only against `testimonials` and one new cron route.
- Positive: reuses three patterns already proven in this codebase (HMAC constant-time compare from
  the Cal webhook; `email_events` dedup from the email layer; JSONB-metadata-style additive columns
  from `orders`) rather than introducing new primitives.
- Negative: a stateless token can't be revoked individually — only by rotating
  `REVIEW_TOKEN_SECRET`, which invalidates *every* outstanding review link at once. Acceptable for a
  low-stakes, 60-day-expiry, write-a-review link; would not be acceptable if this pattern were reused
  for anything higher-stakes (e.g. an invoice or account-access link) — flagged so it isn't copied
  there by default.
- Negative: `bookings.status = 'accepted'` is the only status this schema's `recordBooking` ever sets
  today besides whatever Cal.com's webhook sends verbatim (`stringValue(payload.status) ||
  "accepted"`, per `app/api/webhooks/cal/route.ts:115`) — so a booking Cal.com marks
  `cancelled`/`rescheduled` between being booked and the 3-4 day window is excluded correctly *only
  if* Cal.com's webhook actually updates that row's `status` on cancellation.

  **[RESOLVED 2026-09-03 — the cancellation mechanism CONFIRMED WORKING; but the eligibility
  query is broken for a different reason, and two adjacent defects were found. SHIP BLOCKER.]**

  *(a) The route.* `app/api/webhooks/cal/route.ts` is a single `POST` with no `triggerEvent`
  branch (confirmed by reading it in full): it unwraps `body.payload`, requires a `uid`, upserts
  via `recordBooking` with `status: stringValue(payload.status) || "accepted"` (line 115), then
  unconditionally sends `sendBookingConfirmation` (line 136) and `sendLeadNotification` (line 156)
  for *every* event it receives.

  *(b) Cal.com's catalogue.* Per <https://cal.com/docs/developing/guides/automation/webhooks>,
  every booking event is delivered to the same subscribed URL as
  `{ triggerEvent, createdAt, payload }`. The `BOOKING_CANCELLED` payload carries the **same
  `uid`**, plus `startTime`/`endTime`/`attendees`, `cancellationReason`, and
  **`"status": "CANCELLED"`** (both the `2021-10-20` and `2026-07-27` payload versions).
  `BOOKING_RESCHEDULED` carries a **new** `uid` plus `rescheduleUid` (the previous booking's uid)
  and `"status": "ACCEPTED"` — so **`uid` is NOT stable across a reschedule**.
  `BOOKING_NO_SHOW_UPDATED` carries only `{ message, attendees[], bookingUid, bookingId }` — no
  `status`, no times.

  So the ADR's assumption was right in mechanism: a cancellation, if subscribed, does land on this
  route and `on conflict … do update set status = excluded.status` does write `CANCELLED`.
  Three things break anyway:

  1. **The eligibility query matches zero rows, ever.** Cal.com sends `status` **uppercase**
     (`"ACCEPTED"`), `recordBooking` stores it verbatim, and a read of the production DB confirms
     every existing row is `ACCEPTED` (`select status, count(*) from bookings` → `ACCEPTED | 3`).
     `getBookingsEligibleForReviewRequest` filters `where b.status = 'accepted'` —
     case-sensitive — so the cron is inert. The cancellation gap this flag worried about is
     currently masked by the cron never sending anything at all.
  2. **A cancellation currently sends a booking-*confirmation* email.** Subscribing
     `BOOKING_CANCELLED` (which is what makes the status flip work) makes the route email the
     customer "your booking is confirmed", with the dead meeting link, at the moment they cancel.
     Fixing the cron therefore *requires* fixing the route first — they cannot ship separately.
  3. **Reschedule leaves an orphaned `accepted` row with a stale `end_time`.** The old booking's
     row is never touched (new `uid` ⇒ new row), so the cron would ask "how was your session?"
     3-4 days after a slot that never happened — and, because dedup is per `attendee_email`,
     that wrong email also permanently suppresses the correct one. A `BOOKING_NO_SHOW_UPDATED`
     event would additionally null out `start_time`/`end_time`/`title`/`meeting_url` and reset
     `status` to `accepted`, because the upsert overwrites every column with `excluded.*`.

  **Fixes (Luke), all four required before the cron is enabled:**
  - `app/api/webhooks/cal/route.ts`: read `const trigger = stringValue(body.triggerEvent)`; send
    `sendBookingConfirmation`/`sendLeadNotification` only for `BOOKING_CREATED` and
    `BOOKING_RESCHEDULED`; record-only for everything else.
  - `recordBooking`: normalise on write (`status: (payload.status ?? "accepted").toLowerCase()`)
    **and** make the upsert non-destructive — `set title = coalesce(excluded.title, bookings.title)`
    and the same `coalesce` for `start_time`, `end_time`, `meeting_url`, `status` — so a partial
    payload (`BOOKING_NO_SHOW_UPDATED`) can't wipe a row.
  - On `BOOKING_RESCHEDULED`, if `payload.rescheduleUid` is present, mark the superseded row:
    `update bookings set status = 'rescheduled', updated_at = now() where cal_booking_uid = $1`.
  - Backfill once: `update bookings set status = lower(status);`
    Rollback: none needed — `lower('accepted') = 'accepted'`, so re-running is idempotent, and the
    only pre-existing value is `ACCEPTED`.

  **Defensive filter for `getBookingsEligibleForReviewRequest`, correct regardless of whether the
  `BOOKING_CANCELLED` trigger is actually subscribed in the Cal.com dashboard** (which cannot be
  determined from this repo — Jonas must confirm it in Cal.com → Settings → Webhooks, and it is
  the one item here that stays `[UNVERIFIED: Cal.com webhook subscription trigger list]`):

  ```sql
  and lower(b.status) = 'accepted'
  -- the last event we saw for this uid was not a cancellation/rejection, independent of `status`
  and coalesce(b.raw_payload->>'triggerEvent', '') not in ('BOOKING_CANCELLED', 'BOOKING_REJECTED')
  -- and this booking was not superseded by a later one on the same order (reschedule)
  and not exists (
    select 1 from bookings b2
    where b2.order_id = b.order_id and b2.end_time > b.end_time
  )
  ```

  `raw_payload` already stores the whole request body including `triggerEvent`, so the second
  clause needs no schema change and holds even if `status` handling regresses again.

### What would make this decision wrong later

- If review submissions need their own moderation queue *separate* from admin-curated testimonials
  (e.g. customer reviews need a different approval SLA or different fields than hand-picked quotes)
  — split the table then, not preemptively now.
- If the unverified cancellation-webhook gap above is confirmed real: a booking cancelled after the
  fact still gets a review-request email 3-4 days after its original `end_time`. Trigger to revisit:
  first support complaint about a review request for a call that didn't happen.
- If `REVIEW_TOKEN_SECRET` rotation is ever needed for a reason *other* than a security incident
  (e.g. routine rotation policy), every outstanding link breaks simultaneously with no grace period
  — revisit with a dual-secret verification window (accept signatures from the current and previous
  secret for some overlap) if routine rotation becomes a requirement.

### Rollback

**Schema:** the migration only adds nullable/defaulted columns and one index — `alter table ...
add column if not exists` and `create index if not exists` are both idempotent and additive. Rollback
is:

```sql
drop index if exists testimonials_status_idx;
alter table testimonials
  drop column if exists rating,
  drop column if exists status,
  drop column if exists location,
  drop column if exists cal_booking_uid,
  drop column if exists submitted_email,
  drop column if exists consent_display,
  drop column if exists submitted_at;
```

Safe at any time — nothing else in the schema references these columns via FK (there are none), and
no existing route reads them today (`app/api/dashboard/testimonials/route.ts`'s current `POST`
doesn't touch any of the seven new columns). **Code rollback:** delete
`app/api/cron/review-requests/route.ts`, `lib/reviews.ts`, and revert the `lib/db/repository.ts`
additions (`getPublishedTestimonials`, `listTestimonials`, `setTestimonialStatus`) and the mirrored
`lib/db/schema.ts` columns. Un-schedule the Vercel Cron entry.
**[RESOLVED 2026-09-03 — DISMISSED; Wave 2 created it.]** `vercel.json` now exists (untracked —
`git status` shows `?? vercel.json`; it must be committed or the cron never deploys) and declares
`{"crons":[{"path":"/api/cron/review-requests","schedule":"0 16 * * *"}]}`. Vercel's docs
(<https://vercel.com/docs/cron-jobs/manage-cron-jobs>, "Securing cron jobs") confirm the auth
model the route already implements: "The value of the variable will be automatically sent as an
`Authorization` header when Vercel invokes your cron job", i.e. `Bearer $CRON_SECRET`. Rollback is
deleting the `crons` array from `vercel.json` and redeploying.

---

## Shared migration/rollback sequencing

Apply in this order (each is independently safe to stop after, per its own rollback above):

1. **D's schema migration** first and alone — pure additive DDL, zero behavioural change until code
   reads the new columns. Lowest-risk change to land and verify against production data before
   anything else touches.
2. **A** (`lib/products.ts` + `lib/intake.ts`) — no schema change, pure code. Verify against a
   sampling of real historical `orders.product_slug` values (including at least one row for each of
   the five retired slugs, if any exist) before merging, per Decision A's resolution-order contract.
3. **B and C** — independent of each other and of A/D; both are additive (`app/api/currency`,
   `app/api/availability`, new components) with the caveat that C's `preferredSlot` metadata key
   should land *after* A, so the checkout route (Wave 2's file) is only edited once for both the new
   catalogue and the new metadata field rather than twice.

No step in this ADR requires taking the site down, disabling checkout, or pausing the Stripe/Cal.com
webhooks.

---

## Post-implementation verification (2026-09-03, Kyle)

Every `[UNVERIFIED]` above was resolved in place against a primary source. Two further defects
surfaced that this ADR did not anticipate:

### V1 — Decision A's resolution order is implemented backwards (data-integrity defect)

The contract is emphatic: **live → retired archive → alias**. `lib/products.ts:488-500` implements
**live → alias → archive**:

```ts
const aliased = LEGACY_SLUG_ALIASES[slug];
if (aliased) { const replacement = serviceProducts.find(p => p.slug === aliased); if (replacement) return replacement; }
return retiredServiceProducts.find(p => p.slug === slug);
```

Because all three alias keys are also archive entries, the archive branch is unreachable for
`individual-advisory`, `extended-advisory` and `uae-relocation-qa` — every historical order for
those slugs now resolves to its live replacement. That is Option 2 (rejected: "money-adjacent
history is exactly the data you don't rewrite") reintroduced by accident. Concretely, an
`extended-advisory` order (1800 AED / 90 min) reports as `full-support` (1200 AED / 60 min) in the
Stripe receipt (`app/api/webhooks/stripe/route.ts:32,69,84`), on the schedule page
(`app/booking/schedule/page.tsx:51`), and in the review email
(`app/api/cron/review-requests/route.ts:61`) — and is graded against `full-support`'s 17-18 day
review window rather than the 3-4 day one (`lib/db/repository.ts:572-578`).

Note the project `CLAUDE.md` currently documents the *implemented* order ("resolves live →
`LEGACY_SLUG_ALIASES` → retired archive, which is what keeps historical orders readable"). Its
stated justification is false under that order. `CLAUDE.md` outranks this ADR, so **the owner
decides**, but the two cannot both stand: either swap the code to archive-before-alias and correct
that `CLAUDE.md` sentence, or keep the current order and delete the "keeps historical orders
readable" claim, accepting that retired orders report as their replacements.

Recommended fix (one function, plus one call site that must move regardless):
1. `lib/products.ts` — swap the two branches so the archive is checked before the alias map.
2. `app/api/checkout/consultation/route.ts:56` — switch `getServiceProduct` to
   `getSellableServiceProduct`. This is required **either way**: today a POST with
   `lunch-and-learn` or `hr-compliance-advisory` (retired, no alias) resolves out of the archive
   and creates a live Stripe checkout for a withdrawn product; after the swap, all five retired
   slugs would. `getSellableServiceProduct` is the function `CLAUDE.md` already names for
   purchase-time resolution, and `app/api/availability/route.ts:53` and
   `BookingFunnel.tsx:93` already use it.

### V2 — three of the four core-ladder Cal.com event types do not exist (ship blocker)

`lib/products.ts:534-535` falls back to `${CAL_USERNAME}/${product.slug}` when a product's
`calLinkEnv` is unset, and `CAL_USERNAME` defaults to `"talkhumanly"` (line 525).
`NEXT_PUBLIC_CAL_LINK_THE_SESSION`, `_SESSION_PLUS_PLAN`, `_FULL_SUPPORT` and `_DOCUMENT_REVIEW`
are absent from `.env.local`, so the fallback is what runs. Live calls to Cal.com's v2 slots API
with the account's own `CAL_API_KEY` show:

- the account username is **`talk-humanly`**, not `talkhumanly` — `username=talkhumanly` returns
  `NotFoundException: User with username talkhumanly not found`. `.env.example:51-64` documents
  the wrong username throughout.
- under `talk-humanly`, `interview-prep`, `interview-prep-package` and `document-review` return
  slots; **`the-session`, `session-plus-plan` and `full-support` all 404** — the event types have
  not been created.

Consequences: the availability preview is permanently empty for the entire core ladder (the
primary conversion path), and — worse — after paying, `PaidScheduler` renders an embed pointed at
a non-existent Cal link, so a paying customer cannot book at all.
`app/booking/schedule/page.tsx:52`'s hardcoded fallback `"talkhumanly/individual-advisory"` is
wrong for the same reason. Owner action (Karma/Jonas): create the three event types, then set the
four `NEXT_PUBLIC_CAL_LINK_*` vars in `.env.local` and Vercel. Luke: correct the `CAL_USERNAME`
default and the `.env.example` values to `talk-humanly`, and make `getCalLink`'s fallback loud
(log) rather than silent.

Also confirmed while verifying: `lib/cal.ts`'s query shape (`eventTypeSlug` + `username` +
`start` + `end` + `timeZone`) and its `{ data: { "YYYY-MM-DD": [{ start }] } }` parser match the
live response exactly, and `cal-api-version: 2024-09-04` is the *current required* value, not a
deprecated pin (<https://cal.com/docs/api-reference/v2/slots/get-available-time-slots-for-an-event-type.md>:
"Must be set to 2024-09-04"). The published schema for that endpoint contradicts its own example
(schema says the default format is an array of strings; the example — and the live API — return
`[{ start }]` objects), so a `typeof slot === "string" ? slot : slot.start` tolerance in
`lib/cal.ts` is cheap insurance against a future format flip that would otherwise fail closed and
silently.

### V3 — availability route hardening (2026-09-04, Luke; appended, nothing above revised)

Owen's gate added one defect this ADR did not anticipate, on the route Decision C created.
`GET /api/availability` is public and unauthenticated, and its `tz` query parameter reached two
places a caller-controlled string should not: the upstream Cal.com URL — which *is* the Next Data
Cache key, so varying `tz` across IANA zones missed the 300s cache on every request and hammered
Cal.com with our own `CAL_API_KEY` — and a `funnel_events` insert on every single call.

Fixed by bucketing rather than rejecting (rejecting would break the timezone picker in
`AvailabilityPreview`): `normaliseTimeZone()` in `lib/cal.ts` maps all 418 IANA identifiers onto
26 fixed-offset zones (`Etc/GMT+12` … `Etc/GMT-14`, plus `UTC`), applied both in the route and
again inside `getAvailableSlots` so a future caller cannot reopen the hole. The `slot_previewed`
write is throttled to one row per product per minute per instance. Decision C's fail-closed
contract (`{ available: false, slots: [] }`, HTTP 200) is unchanged.

Verified live against Cal.com's v2 `/slots` with this account's key, 2026-09-04:
`timeZone=Etc/GMT-4` and `timeZone=Asia/Dubai` return identical payloads
(`"2026-09-08T09:00:00.000+04:00"`), and `timeZone=UTC` returns the same instants as `Z` — so the
bucket is a cache-key change, not a behaviour change. The same calls re-confirmed that slots come
back as `{ start }` objects; the `typeof slot === "string" ? slot : slot.start` tolerance this
section recommended is now implemented, so a future flip to the *documented* string form degrades
instead of silently emptying the preview.

V2 is unchanged and still open as an **owner action** — the three missing core-ladder event types
have not been created. `getCalLink()` now logs a `console.warn` (once per env var, server-side)
whenever it takes the fallback, so this is visible in production logs rather than silent.

## `[NEEDS DATA]`

- Booking volume/concurrency, to size `getAvailableSlots`'s 300s cache TTL against real traffic
  (Decision C).
- Confirmation of whether any live `orders` row actually references the five slugs being retired
  (Decision A) — informs whether the archive is precautionary or immediately load-bearing.
  Still open: the `select product_slug, status, count(*) from orders group by 1,2` needed to
  answer it was blocked by the sandbox on 2026-09-03. The `bookings` read that *was* permitted
  showed only 3 rows total, all `ACCEPTED`, all with an `order_id` — so volume here is small and
  V1 above is currently a latent defect rather than an actively-firing one. It should still be
  fixed before it isn't.
- Whether `BOOKING_CANCELLED` (and `BOOKING_RESCHEDULED`) are actually subscribed on the Cal.com
  webhook that points at `/api/webhooks/cal` — a dashboard setting, not visible from this repo.
  Jonas to confirm; the defensive filter in Decision D is written to be correct either way.
