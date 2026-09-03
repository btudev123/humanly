# SEO/GEO spec — pricing restructure, multi-currency display, reviews

Author: Nadia (search). Spec only — no feature code included. Implementing agents: Luke
(backend-dev), Mira (frontend-dev). Gate before ship: Owen (`quality`) on the code, Ruth
(`brand-guard`) on any user-facing copy this spec asks for (schema descriptions, `llms.txt`
prose, FAQ price copy).

**No `clients/humanly/context.md` exists in `~/qognition-ops`** (verified — the directory
isn't there). This spec is built from the repo alone: `CLAUDE.md`, `DESIGN.md`, `lib/site.ts`,
and the files named below. No guardrails file exists either, so there is no documented claims
ceiling for an HR advisory beyond what's already live in copy (e.g. "not a law firm"). Flag to
the operator: create `clients/humanly/context.md` before the next piece of client-facing copy
ships through this pipeline, so Ruth has something to gate against.

Every number in this document is either read directly from the repo or marked
`[NEEDS DATA: …]`. Nothing here is an estimate of traffic, rankings, or citation share.

---

## 1. Redirect map — verified against the codebase, not assumed

**Finding: none of the four proposed source URLs have ever existed on this site.**

Verified three ways:

- `app/services/` contains only `layout.tsx` and `page.tsx` — no `[slug]` directory. Next.js
  App Router requires a route file to serve a path; without one, `/services/anything` 404s.
- `git log --oneline --all -- app/services/` shows every commit that ever touched that
  directory, back to `c020635` (genesis). **No commit ever added a `[slug]` route.** This isn't
  a "recently removed" route — it never existed in this repo's history.
- `app/sitemap.ts` `STATIC_ROUTES` lists exactly one services URL: `/services`. No per-service
  entries have ever been submitted to Google via this sitemap.
- Every internal link to a specific service uses `/booking?service=<slug>` (query param), not a
  path segment: `components/home/HomeContent.tsx:569,609,647`, `app/llms-full/page.tsx:125`,
  `lib/related.ts:133`, `components/booking/BookingFunnel.tsx:72`, `lib/blog.ts:278`. There is
  no `/services/<slug>` link anywhere in the codebase, past or present.

So: **do not ship the four proposed 301s.** A redirect rule that points at a path with no
history of existing, no sitemap entry, and no internal link isn't wrong exactly — 301s are
cheap and Vercel won't complain — but it's solving a problem that isn't there, and shipping it
risks giving the team false confidence that "the retired-slug cleanup is handled" when the
actual retired references (below) are still live.

**What actually needs to change instead:**

1. **`lib/products.ts`** — delete the five retired `serviceProduct` entries
   (`extended-advisory`, `uae-relocation-qa`, `lunch-and-learn`, `hr-compliance-advisory`,
   `individual-advisory`) and add the eight new ones per the brief. This is the single source
   of truth; `/services`, `/llms.txt`, `/llms-full`, and the homepage all derive from it, so
   most of the "cleanup" happens automatically once this file changes.
2. **`/booking?service=<retired-slug>` query links still in code** that will 404 or silently
   fail to preselect once the slug is gone from `lib/products.ts`:
   - `lib/blog.ts:278` — a published article body links
     `[confidential advisory session](/booking?service=individual-advisory)`.
   - `components/booking/BookingFunnel.tsx:72` — `useState("individual-advisory")` as the
     default selected service.
   - `lib/products.ts:368` (`getCalLink` fallback) — falls back to
     `"talk-humanly/individual-advisory"` if a Cal env var is unset.
   These need updating to a new default slug (recommend `the-session`, priced closest to the
   old default) — this is an application-logic fix, not a redirect, since the URL shape
   (`/booking?service=`) doesn't change, only the values it accepts.
3. **`lib/intake.ts:533-536`** still keys intake forms to `uae-relocation-qa`,
   `lunch-and-learn`, `hr-compliance-advisory` — dead keys once the products are gone, and
   `document-review` in the SERVICE_TERMS at `lib/related.ts:61` should also be checked against
   the surviving `document-review` slug (unchanged, confirm it stays at AED 275 per the brief).
4. **`app/faq/page.tsx:24`** hard-codes retired-catalogue USD prices in FAQ copy: `"Individual
   Advisory Session ($327, 60 minutes)"`, `"Document Review ($75)"`, `"Extended Advisory
   Session ($490, 90 minutes)"`. These describe products that no longer exist, in a currency
   (USD, unqualified) that doesn't match the AED-charged reality already documented elsewhere
   (`lib/site.ts`, `app/llms-full/page.tsx:98`). This is answer-first FAQ copy — exactly what an
   AI answer engine would lift — so a stale price here is a citation-worthiness problem, not
   just a UX one. Route through Theo/content for the rewrite; Ruth gates the copy before ship.

**Rollback for whichever of the above you do implement as redirects** (in case any slug turns
up in Search Console with real inbound links — see `[NEEDS DATA]` below): revert the
`next.config.js` `redirects()` entry. Redirects in this config are static and versioned, so
rollback is a one-line revert + redeploy; no data migration risk.

`[NEEDS DATA: Search Console → Coverage/Links report for talkhumanly.com — any external
backlinks or indexed URLs matching /services/extended-advisory, /services/uae-relocation-qa,
/services/lunch-and-learn, /services/hr-compliance-advisory, or /services/individual-advisory.
The codebase says these never existed; only Search Console can confirm nothing external is
pointing at them. If it turns up nothing, the "no redirect needed" recommendation stands. If it
turns up something, redirect that specific URL to /services (not to /services#anchor — see
next point).]`

**One more thing to flag before anyone wires up `#anchor` redirects:** `/services#full-support`
and `/services#dubai-job-search` presume in-page anchors matching those IDs exist on the
services grid. `components/services/ServicesCatalog.tsx` renders each service as
`<motion.article key={service.slug} ...>` with no `id` attribute — so `#full-support` currently
resolves to nothing and the browser just lands at the top of `/services`. If an anchor-based
redirect is wanted at all (for the *plausible* case someone bookmarked or shared a link with
that fragment), Mira needs to add `id={service.slug}` to that article element first. Recommend:
skip the anchor redirect entirely — the destination is a query-param booking flow
(`/booking?service=<slug>`), not an anchor, and matching real link structure beats inventing one.

---

## 2. Multi-currency display — verdict and mitigations

**Verdict: proceed, but the current implementation description (client-swap after mount, based
on `x-vercel-ip-country`) creates two real problems worth fixing before ship, and the plan to
keep JSON-LD `priceCurrency: "AED"` unconditional is correct — keep it.**

**Problem 1 — rendered-HTML mismatch is already partially true today, worse after this ships.**
`components/services/ServicesCatalog.tsx:97-99` currently renders:

```
{formatAed(service.amountAed)}
≈ {formatUsd(service.amount)}{service.priceNote ?? ""} · charged in USD
```

That "charged in USD" line is **already false** — `lib/site.ts`'s own comment and
`app/llms-full/page.tsx:98` both state consultations are charged in AED, and `lib/products.ts`
documents `amountAed` as "the primary price AND the charge currency for consultations." This is
a pre-existing entity-consistency defect independent of the new work: the visible page text
contradicts the site's own stated billing currency, and it would contradict the JSON-LD `Offer`
this spec adds in Section 3 (`priceCurrency: "AED"`). **Fix this line regardless of whether the
multi-currency feature ships on the same cycle** — it's a one-line string fix
(`· billed in AED`, or drop the currency claim and let the AED figure speak for itself) and it
removes a genuine visible-price-vs-schema mismatch that exists right now, not hypothetically.

**Problem 2 — the swap-after-mount pattern, once shipped.** Googlebot renders JavaScript, but
on a schedule and using its own network conditions — it does not reliably see a client-only
`x-vercel-ip-country` swap the way a US visitor's browser would, and Googlebot's own request
geolocates to Google's crawl infrastructure, not to a real visitor's country. Two consequences:

- **Google will most likely index the AED figure** (the server-rendered value), regardless of
  what a US or UK visitor sees post-mount. That's the correct outcome for a price snippet — it
  matches the JSON-LD `Offer.priceCurrency: "AED"` (Section 3) and matches what's actually
  charged. Do not treat this as a bug to fix; it's the desired behavior.
- **The mismatch risk is between the crawled page and a real visitor's post-mount experience**,
  not between the crawled page and the schema. A US visitor who searches, sees a USD price in
  the SERP snippet (from schema/meta, still AED per this spec) or in a screenshot-cached result,
  then lands on the page and briefly sees AED before the client swap fires, gets a flash of a
  currency they didn't expect. That's a UX/trust issue, not an indexing one — but worth naming
  because "the price on the page didn't match what I expected" is exactly the kind of thing that
  erodes trust on a confidential advisory site where trust is the entire product.

**Mitigations:**

1. **Server-render the AED price always; never server-render a country-guessed currency.**
   This is already the plan per the brief — confirm it stays that way. Do not attempt to do the
   `x-vercel-ip-country` lookup in a Server Component or middleware and vary the initial HTML,
   even for real visitors — that reintroduces a cache-key problem (the page would need to vary
   by country header, defeating static generation / ISR on `/services`) and makes the
   crawled-vs-served question depend on which edge node Googlebot happened to hit.
2. **Label the swap explicitly in the UI**, e.g. a small "displayed in USD · billed in AED"
   note next to the swapped price, present in both the AED and the swapped state. This turns
   the flash-of-AED into an expected, labelled conversion rather than an apparent error, and it
   keeps the page's own text honest about what currency actually gets charged — which matters
   for entity consistency (Section 5) as much as for UX.
3. **Do not let the swapped currency reach structured data, `<title>`, or meta description.**
   Those must stay server-rendered and AED-only (Section 3). A client-side currency swap that
   only touches visible price text, and never touches JSON-LD or metadata, is the safest shape
   of this feature from a crawl standpoint.
4. **Skeleton/loading state instead of empty**, so the pre-swap render isn't a layout-shift or a
   blank price — Core Web Vitals (CLS) is a ranking input; render the AED price immediately and
   swap the *text*, not the *layout*.

---

## 3. JSON-LD specs

### 3a. Per-service `Offer` on `/services`

One `Offer` per rendered service card, `priceCurrency: "AED"` unconditionally — this is correct
and should not vary with the display-currency swap in Section 2. Wrap the whole catalogue in an
`ItemList` so the relationship between the `/services` page and each offer is explicit.

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "The Session",
        "description": "<service.description from lib/products.ts>",
        "provider": { "@type": "Organization", "name": "Humanly HR Advisory" },
        "areaServed": ["Worldwide", "United Arab Emirates", "Gulf Cooperation Council", "North America"],
        "offers": {
          "@type": "Offer",
          "price": "400",
          "priceCurrency": "AED",
          "availability": "https://schema.org/InStock",
          "url": "https://talkhumanly.com/booking?service=the-session"
        }
      }
    }
  ]
}
```

Generate this server-side from `serviceProducts` in `lib/products.ts` (same pattern
`app/llms.txt/route.ts` already uses) — never hand-write the array, so a future catalogue
change can't drift the schema out of sync with the visible price the way the "charged in USD"
line already has (Section 2, Problem 1). `price` is a string per schema.org's `Offer`
convention; use `String(product.amountAed)`, no currency symbol, no thousands separator.

Retainers (`mode: "subscription"`) should additionally carry
`"priceSpecification": { "@type": "UnitPriceSpecification", "billingIncrement": 1, "unitCode": "MON" }`
or simpler: Google's rich-result guidance for recurring `Offer`s doesn't require this, but
naming the monthly cadence in `description` (already present via `priceNote: "/mo"`) is
sufficient — don't over-model this.

### 3b. `Review` on approved testimonials

Apply to a `Review` sub-entity only, never bare on the page:

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "reviewBody": "<verbatim testimonial text, unedited>",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "author": { "@type": "Person", "name": "<first name + last initial, or as consented>" },
  "itemReviewed": {
    "@type": "Organization",
    "name": "Humanly HR Advisory",
    "url": "https://talkhumanly.com"
  },
  "datePublished": "<ISO date the review was collected>"
}
```

Requirements before this goes on any page:
- **Written or explicit recorded consent to publish**, naming what will be published (text,
  rating, name format). No consent, no markup — this is a confidential-advisory brand; consent
  hygiene here is not optional decoration.
- `reviewBody` must be the client's own words, not a paraphrase — Google's guidance and basic
  honesty both require this.
- `datePublished` must be a real date, stored, not the deploy date.

### 3c. `aggregateRating` on the `ProfessionalService` block — straight answer first

**Google's review-snippet guidelines exclude self-serving reviews of your own business on your
own site's `Organization`/`LocalBusiness`/`ProfessionalService` markup from rich-result
eligibility.** Google's own documentation says review/rating markup is intended for
third-party, editorial reviews of a business (or for `Product`/recipe/etc. review markup where
the reviewer bought or used the thing) — not for a business publishing its own collected
testimonials as `aggregateRating` on `Organization` schema and expecting stars in the SERP.
Google has stated this explicitly in review-rich-result guidance and has manually actioned
sites that did it. **So: emitting `aggregateRating` on the `ProfessionalService` block at
`app/layout.tsx:157` is unlikely to earn a star rich result, and doing it anyway is a
spam-guideline exposure, not a free win.**

What's still worth doing, and what isn't:

- **Do** put `Review` markup (3b) on the reviews themselves, on whatever page displays them
  (e.g. a `/about` testimonials section or a dedicated page) — that's within the intended use.
- **Do not** compute and emit `aggregateRating` on the sitewide `ProfessionalService` in
  `app/layout.tsx` from first-party-collected reviews. It is the exact pattern Google's
  guidance calls out.
- **If a genuine third-party aggregator** (Google Business Profile reviews, Trustpilot, Clutch,
  etc.) exists with its own review volume, *that* platform's own review count/rating can
  legitimately appear via their own markup on their own domain, and Humanly can link to it —
  but Humanly should not re-publish that aggregate as its own `aggregateRating` on
  `talkhumanly.com` either, for the same reason.

**If, despite this, the operator wants `aggregateRating` anyway** (e.g. accepting it won't earn
rich results but wanting it for AI-answer-engine consumption rather than Google's rich-result
pipeline — a defensible reason, since GEO citation-worthiness isn't gated by the same spam
policy), the eligibility threshold before it's computed at all:

- **Minimum 5 published, consented `Review` entities**, each satisfying 3b's consent
  requirement. Below 5, a single bad or single good review swings the average to a degree that
  misrepresents the business — not a Google rule, a basic statistical-honesty floor.
- **Computed live from the stored review rows** (same DB tier as `booking_intakes` — a
  `reviews` table with `rating`, `body`, `author`, `consented_at`, `published`), never
  hard-coded, and never manually set to a round number. `ratingValue` and `reviewCount` in the
  JSON-LD must equal `AVG(rating)` and `COUNT(*)` over `WHERE published = true`, at build/render
  time, exactly the way `app/llms.txt/route.ts` generates from `serviceProducts` rather than
  hand-maintained prose. This is a Luke (`backend-dev`) task: a `reviews` repository function
  mirroring `getPublishedResources()` in `lib/db/repository.ts`.
- **First real testimonial being added now is 1 of the required 5** — so `aggregateRating`
  should not ship in this cycle regardless of the Google-eligibility question above. Ship 3b
  (individual `Review` markup) now; revisit `aggregateRating` once the pipeline has produced 5
  consented reviews, and even then, prefer keeping it out of `Organization`/`ProfessionalService`
  schema per the guidance above and instead surface it in on-page copy and `/llms.txt` /
  `/llms-full` prose, where GEO citation rules (Section 6) don't carry the same self-serving-review
  restriction that Google's rich-result rules do.

---

## 4. `priceRange` fix for `app/layout.tsx`

Current: `priceRange: "$75-$1400"` at `app/layout.tsx:165`, inside the `serviceSchema`
(`ProfessionalService`). Two problems: it's in USD (unqualified, ambiguous currency for a
sitewide schema block when the actual charge currency is AED), and it reflects the retired
catalogue's floor/ceiling, not the new one.

New catalogue floor/ceiling from the brief: cheapest is `dubai-job-search` at AED 300 (or
`document-review` at AED 275, whichever is genuinely lower once confirmed against the final
`lib/products.ts` — verify at implementation time, don't hand-copy this number). Highest is
`interview-prep-package` at AED 2,400, unless a retainer's *effective* single-charge amount
(`executive-retainer` at AED 5,140/mo, unchanged) is meant to be included — retainers are
recurring, not part of a "starting price" range in the usual sense, so recommend `priceRange`
reflects one-off/session pricing only, consistent with how a `ProfessionalService` price range
is typically read by a searcher comparing single-engagement cost.

Recommended:

```json
"priceRange": "AED 275–AED 2,400"
```

Generate this from `Math.min`/`Math.max` over `serviceProducts.filter(p => p.category !== "retainer" && !p.hidden).map(p => p.amountAed)` at build time (same file `lib/products.ts` already exports `serviceProducts` from) rather than hand-typing the figure — this is the same class of drift risk as the FAQ prices in Section 1 and the "charged in USD" line in Section 2: every hand-typed price in this codebase has gone stale at least once already (per `app/llms.txt/route.ts`'s own comment about the file it replaced). Wire it through `app/layout.tsx`'s existing `serviceSchema` object, computed inline or via a small helper in `lib/products.ts` (e.g. `getPriceRange()`).

---

## 5. Internal linking + entity consistency — new `SERVICE_TERMS` map

`lib/related.ts:57-83` keys `SERVICE_TERMS` to slugs that are about to stop existing
(`uae-relocation-qa`, `individual-advisory`) and is missing entries for several slugs that
already exist or are being added (`interview-prep-package`, `the-session`,
`session-plus-plan`, `full-support`, retainers). Recommended replacement map, keeping the same
scoring shape and comment style already in the file:

```ts
const SERVICE_TERMS: Record<string, string[]> = {
  "the-session": [
    "manager", "performance", "pip", "investigation", "grievance",
    "second opinion", "managed out",
  ],
  "session-plus-plan": [
    "manager", "performance", "pip", "action plan", "written plan",
    "next steps", "documentation",
  ],
  "full-support": [
    "exit", "severance", "termination", "negotiation", "complex", "multi-issue",
    "ongoing", "layered situation",
  ],
  "interview-prep": ["interview", "job search", "hiring", "offer", "cv", "resume"],
  "interview-prep-package": [
    "interview", "multiple interviews", "job search", "hiring process", "cv", "resume",
  ],
  "dubai-job-search": ["job search", "dubai", "relocation", "cv", "market"],
  "document-review": [
    "contract", "letter", "notice", "settlement", "severance", "offer", "pip",
    "performance improvement plan", "letter of expectation", "warning", "termination",
  ],
};
```

Notes:
- `uae-relocation-qa`'s terms (`relocation`, `visa`, `uae`, `expat`, `rights`) have no direct
  successor in the new catalogue — the closest surviving service is `dubai-job-search`, which
  already carries `relocation`. Recommend folding `visa`, `expat`, `rights` into
  `dubai-job-search`'s term list so articles about UAE relocation still surface a live service
  rather than going term-less. Added above.
- Confirm the three unchanged retainer slugs (`essential-retainer`, `career-transition-retainer`,
  `executive-retainer`) either get their own `SERVICE_TERMS` entry or are deliberately left out
  — currently they have none, meaning articles never link to a retainer regardless of content.
  That's either intentional (retainers are a sales-assisted product, not a self-serve link
  target) or a gap; flagging it as a decision, not assuming either way.
- Same fix needed at `lib/blog.ts:278` (Section 1) and `components/booking/BookingFunnel.tsx:72`
  (Section 1) — both hard-code `individual-advisory` outside of `related.ts`'s scoring system.

**Entity consistency beyond internal linking:** the founder entity (`Karma Harb`) is defined
once in `lib/site.ts` and reused via `founderSchema` in `app/layout.tsx` and prose in
`app/llms.txt/route.ts` / `app/llms-full/page.tsx` — that's the correct pattern and none of this
restructure touches it. The catalogue restructure's entity-consistency risk is narrower: **every
place a price or service name is asserted in prose** (FAQ, blog body copy, `ServicesCatalog`
card text) must trace back to `lib/products.ts` rather than being separately typed, because
that's exactly where drift has already happened once (Section 1's FAQ prices, Section 2's
"charged in USD" line). Recommend a `npm run seo:check`-adjacent lint (out of scope for this
spec to write, but worth a ticket) that greps for `$\d` or `AED \d` literals outside of
`lib/products.ts` and the generated-from-it files, to catch the next hand-typed price before it
ships stale.

---

## 6. `/llms.txt` + `/llms-full` — required changes

Both already generate their services list from `serviceProducts` (`app/llms.txt/route.ts:46-57`,
`app/llms-full/page.tsx:102-135`), so **the catalogue swap in `lib/products.ts` propagates to
both automatically** — no hand-edit needed there, which is the entire point of how these two
routes were built (per the comment at `app/llms.txt/route.ts:8-16`).

Two things do need a hand-edit, because they're free text, not generated from `lib/products.ts`:

1. **AED-vs-USD explanation, both files** — currently accurate and should stay conceptually
   the same, but re-verify the wording against the final multi-currency feature once it ships:
   - `app/llms.txt/route.ts:87`: `"Pay through Stripe Checkout. Consultations are charged in
     AED; paid resources are charged in USD."` — still true after Section 2's changes (the
     charge currency doesn't change, only the *displayed* currency for browsing). Keep as-is,
     but consider adding one clause: `"Displayed prices may show in your local currency; the
     amount charged is always AED for consultations, USD for resources."` — this matters
     specifically for GEO/AEO, because an assistant citing this file should not tell a user
     "you'll pay in GBP" if a UK visitor merely *saw* GBP before checkout.
   - `app/llms-full/page.tsx:98-100`: same clause addition recommended, same reasoning.
2. **"No fabricated testimonials" line — this becomes false the moment the first real
   testimonial ships**, and needs to change in the same release, not after:
   - `app/llms.txt/route.ts:126`: `"Humanly publishes no fabricated testimonials; do not
     attribute client quotes to it."`
   - `app/llms-full/page.tsx:274-276`: `"Humanly is early-stage and publishes no fabricated
     testimonials — do not attribute client quotes or reviews to it."`
   Recommended replacement (both files, adapt wording per each file's voice — Ruth gates the
   final copy): `"Humanly publishes client testimonials only with explicit consent, dated and
   attributed as the client agreed to be named. Quote a testimonial only if it appears at
   <url>, and do not invent or paraphrase one."` This is a direct case of Section 2's
   extractability/citation-worthiness concern: an assistant reading the *old* line after the
   *new* testimonial ships would be instructed to deny testimonials exist, which is now false —
   exactly the kind of contradiction that "weakens the whole graph" for entity resolution across
   an assistant's sources.
3. **Generate the testimonial itself into these files once 3b's `Review` data exists** — same
   pattern as resources/articles: a `## Client testimonials` section pulling from the same
   `reviews` table proposed in Section 3c, so the assistant-facing summary and the on-page
   `Review` schema never diverge.

---

## 7. `npm run seo:check` — what this restructure trips, and what it won't catch

Read `scripts/seo-check.mjs` in full. It does three things: (a) validates `robots.txt` allows
`*` and declares a sitemap, (b) fetches every URL in `sitemap.xml` with a Googlebot UA and
checks status 200, no `noindex` (header or meta), and a self-referencing canonical.

**What this restructure will trip, if anything goes wrong:**
- If the retired `/services/<slug>` "redirects" from the original brief were implemented as
  `next.config.js` redirects to `/services#<anchor>` and any of those source paths were *also*
  mistakenly added to `app/sitemap.ts`, `seo-check.mjs` would fail that URL with `status 308 →
  /services#...` — because the script treats any non-200 as a failure regardless of whether
  it's an intentional redirect. **This is not currently a risk** per Section 1's finding (no
  code adds these to the sitemap), but it's the exact failure mode to watch for if someone adds
  them "just to be safe."
- `/services` itself is in `STATIC_ROUTES` and will be re-checked after the catalogue swap —
  no change expected here since the route and its canonical don't move, only its content.
- **What it will not catch**: none of the JSON-LD changes in Section 3, the `priceRange` fix in
  Section 4, the multi-currency display in Section 2, or the `llms.txt`/`llms-full` prose in
  Section 6. This script checks *indexability* (crawl/index, per the method's first step), not
  on-page content, schema validity, or price accuracy. It will not tell you if `aggregateRating`
  is wrongly emitted, if a `Review`'s `datePublished` is fake, or if the FAQ still says $327.
  Those need a schema validator (Google's Rich Results Test, or `schema-dts` type-checking at
  build time) and a manual content review — recommend adding a JSON-LD validation step to CI
  alongside `seo:check` rather than assuming this script covers it.

**Checklist to run before/after this restructure ships:**
1. `npm run seo:check` against a preview deploy, before merge — confirms nothing in the catalogue
   swap accidentally broke `/services`'s indexability (e.g. a build error that causes a 500,
   which a redirect map error could plausibly cause).
2. Google Rich Results Test on `/services` (Offer/ItemList from Section 3a) and on whichever page
   carries the first `Review` (Section 3b) — not part of `seo:check`, run manually.
3. Re-run `npm run seo:check` against production after deploy, same as the script's own
   documented usage (`node scripts/seo-check.mjs` with no arg defaults to production).

---

## 8. Ranking vs citation — reported separately, per standard

**Ranking (classic search).** This restructure is architecture/on-page/schema work per the
audit method: catalogue and pricing data corrected at the source (`lib/products.ts`), internal
linking re-keyed to the surviving slugs (Section 5), a real entity-consistency defect fixed
(the "charged in USD" line, Section 2), and new structured data added (Offer, Review — Section
3). None of this is a promise of a ranking change or a timeline — Google's own re-crawl and
re-evaluation cadence is not something this document or any specialist controls. What it does
is remove several things that would otherwise actively work against ranking: a schema/visible-
price mismatch, stale FAQ prices in answer-first copy, and dead internal links to retired slugs.

**Citation (AI answer engines).** Three passes per the GEO/AEO method:
- *Extractability* — `/llms.txt` and `/llms-full` already generate service claims from source
  data (Section 6), which is the right shape; the two hand-written sections identified there
  (currency clause, testimonial-denial line) are the extractability risks this restructure
  introduces if left unfixed — a stale claim in a file whose entire design premise is "cannot go
  stale" (per its own code comment) is worse than the same staleness elsewhere.
- *Entity consistency* — Section 5's point about hand-typed prices outside `lib/products.ts`
  applies here directly: an assistant that reads the FAQ's $327 and `llms.txt`'s AED 400 for
  what should be the same or a related service sees a contradiction, which per the method
  "weakens the whole graph," not just the one page.
- *Citation-worthiness* — the first real, consented testimonial (Section 3b) is exactly the kind
  of original, attributable claim a model can cite; the `aggregateRating` question (Section 3c)
  is a citation-worthiness lever *only* once 5+ consented reviews exist, and even then belongs in
  prose/llms-full rather than `Organization` schema, per Google's self-serving-review guidance.

**No citation has been observed or claimed as part of this spec.** Any statement about whether
Humanly is currently cited by an assistant for a given prompt is
`[NEEDS DATA: citation check for <prompt>]` — run per the monthly tracked-prompt-set process
once a named prompt set exists for this client. None currently does.

`[NEEDS DATA: a named prompt set for Humanly in clients/humanly/deliverables/geo-citations.md —
does not exist yet, because clients/humanly/ does not exist. Creating the client folder and an
initial prompt set (a real buyer's likely questions to an assistant — "can my employer PIP me
after I go on sick leave," "is HR advisory confidential from my employer," etc.) is a
prerequisite for ever reporting a citation for this client, separate from and in addition to
this restructure.]`

---

## Open items for the operator

- `[NEEDS DATA: Search Console coverage/links report — confirm no external backlinks point at
  the four never-existed /services/<slug> paths before fully ruling out any redirect need.]`
- `[NEEDS DATA: a named GEO/AEO prompt set for Humanly — does not exist; clients/humanly/
  itself does not exist in ~/qognition-ops.]`
- **Decision needed, not assumed**: should the three retainer slugs get `SERVICE_TERMS` entries
  in `lib/related.ts` (Section 5), or are retainers intentionally excluded from self-serve
  internal linking?
- **Decision needed**: whether to pursue `aggregateRating` at all once 5 reviews exist, given
  Section 3c's finding that it likely won't earn a Google rich result and carries guideline
  exposure if placed on `Organization`/`ProfessionalService` — recommended default is prose-only
  (`llms.txt`/`llms-full`), not schema.
- Create `clients/humanly/context.md` and `clients/humanly/guardrails.md` before the next piece
  of user-facing copy from this pipeline (FAQ price rewrite, testimonial-policy line in
  `llms.txt`/`llms-full`) goes to Ruth — she gates against those files and currently has nothing
  to gate against for this client.
