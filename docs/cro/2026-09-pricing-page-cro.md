# /services pricing restructure — CRO spec

**Author:** Marcus (performance/CRO) · **For:** Mira (frontend implementation), Theo (copy) ·
**Status:** spec only — no code in this document. Ruth gates any client-facing copy before it ships.

## Before anything else

`clients/humanly/context.md` does not exist in `~/qognition-ops`. There is no stated primary conversion
event, no CPA/ROAS/CVR target, and no traffic or baseline-conversion figure available to me anywhere in
this repo or the task brief. Normally that stops structural work. It doesn't stop this document because
the task explicitly commissioned it against that gap — but every number below that would normally open a
recommendation is `[NEEDS DATA: ...]`, and section 7 (test design) is arithmetic, not a result, until
someone supplies the missing inputs.

**Working assumption**, stated so it can be corrected: the primary conversion event is a completed,
*paid* consultation checkout (Stripe `checkout.session.completed` → order marked paid), not a checkout
start. That assumption already exposes a gap — see section 6.

Two corrections to the brief before the spec:

1. **GA4/GTM is already in the repo.** `app/layout.tsx` loads GTM (`GTM-PGW9TMS8`) and gtag.js/GA4
   (`G-VS75LYDHVC`) on every page today. The gap isn't "no GA4" — it's that **zero custom events** are
   pushed to `dataLayer` beyond the automatic pageview. Section 6 is additive to an existing property,
   not new setup, except where noted.
2. **`funnel_events` currently records checkout *starts* only.** `recordFunnelEvent()` has exactly two
   call sites in the whole codebase — `app/api/checkout/consultation/route.ts` and
   `app/api/checkout/resource/route.ts` — both firing `checkout_created`. I checked the Stripe webhook
   handler (`app/api/webhooks/stripe/route.ts`) directly: it marks orders paid, sends receipts, and
   sends lead notifications, but it never calls `recordFunnelEvent`. **There is no "actually paid" row
   in this table today.** No tier-level conversion rate can be computed from it as it stands, only
   start volume. This is the single most important measurement gap in this project and it predates the
   pricing change — see section 6, item 7.

---

## 1. Page architecture for `/services`

**Comparison table for the three ladder tiers, cards for everything else.** Not a stylistic choice —
it follows directly from what the ladder is trying to do.

Cards force a reader to hold two or three separate blocks in memory and mentally diff their bullet
lists. A comparison table puts every tier's inclusion for a given feature in the same row, so "Better
has this, Best adds these two more" is visible without re-reading anything. That is the *only* layout
that makes the 950→1200 step "legible at a glance," which the brief asks for by name — the entire
psychological mechanism of a Goldilocks ladder (the near tier makes the top tier look like a small,
obvious step up) depends on both tiers sitting in one visual frame, not two.

Cards are still the right shape for the **Specialist Sessions** and **Monthly Retainers** strips,
because those are independent, non-nested purchases — Interview Prep isn't "one row less" than the
Career Transition Retainer, so there's no shared matrix to draw. Reuse the existing
`ServicesCatalog.tsx` card pattern for those two strips unchanged (it already has the `featured` /
"Most Popular" treatment this project needs for Best).

**Recommended section order for `/services`:**

1. Hero (existing — keep).
2. **Confidentiality Promise**, pulled up from its current position near the bottom. It answers the
   single most common objection at every tier ("will my employer find out") and should be visible
   before a visitor is asked to compare prices, not after.
3. **The tier comparison table** (Good / Better / Best). Best column visually highlighted (background
   tint + border weight, matching the existing `featured` treatment in `products.ts` /
   `ServicesCatalog.tsx`) with the "Recommended" badge. Feature rows in the order given in the brief;
   price row last, directly above each column's CTA.
   - **Desktop:** three columns, feature-name column pinned/sticky on scroll if the table needs
     horizontal scroll at any breakpoint above mobile.
   - **Mobile (<640px):** do not force horizontal scroll across three columns — that's a known mobile
     antipattern for comparison tables and it's exactly the moment (a visitor "researching privately,
     possibly at work," on a phone) this page most needs to not fumble. Stack three mini feature-lists
     instead, **Best first**, so the primary tier gets primacy on a single-column read rather than being
     the third thing a thumb reaches.
4. **Availability preview strip** — directly under the comparison table, see section 4.
5. **Specialist Sessions** — cards, existing pattern.
6. **Monthly Retainers** — cards, existing pattern.
7. Existing HR-vs-Humanly-vs-Lawyer comparison table (keep — it's Best's price anchor, see section 2).
8. Founder credibility / testimonial, blog — existing, keep at the tail.

---

## 2. Objection map

Buyer profile per the brief: anxious, live workplace crisis (PIP, exit, burnout, rights question),
researching privately, often at work. Every row below needs a *specific* on-page element, not a vibe —
empty right-hand cells are Theo's and Mira's work list.

### General (applies at every tier)

| Objection | On-page answer |
|---|---|
| "Will my employer find out I'm looking at this?" | Confidentiality Promise block, moved above the pricing table (section 1, item 2). "No employer notification" trust chip repeated near the comparison table, matching the existing `BookingFunnel` trust-chip pattern. |
| "Is this a lawyer? Do I need one instead?" | Existing HR-vs-Humanly-vs-Lawyer table, kept, plus explicit "HR guidance and coaching, not legal advice" line near pricing (per `DESIGN.md`'s stated positioning). `clients/humanly/guardrails.md` does not exist — there is no client-approved claim-limit list for this regulated-adjacent category. Flag to the operator before Theo writes anything closer to legal-advice territory than the existing copy. |
| "Can I trust someone I've never met with something this sensitive?" | Founder credibility block (Karma Harb bio + LinkedIn, already shipped per recent commits) and a testimonial, both surfaced near the pricing table, not only at the page tail. |
| "Is this worth paying for vs. asking friends / Reddit / Googling it?" | Make the *deliverable* tangible — a sample excerpt or thumbnail of the written action-plan document, not just the feature-list line "full written action plan." This is a copy/asset task for Theo, not a layout task. |

### Good (AED 400)

| Objection | On-page answer |
|---|---|
| "I don't know if my problem needs more than a quick answer." | Frame Good explicitly as a diagnostic, not a cut-down Best: "one specific question, 30 minutes, decide what you need next" — must appear in Good's column copy. |
| "Will they just upsell me the second I'm on the call?" | Page-level promise that the 30-minute session stands alone and delivers a usable answer. This is as much a call-script commitment as a copy one — flag to the founder that the page promise has to match what actually happens on the call, or the page leaks the same way an ad that oversells a landing page does. |
| "Is 30 minutes enough to be taken seriously?" | Duration + "written summary of next steps (short)" row already in the matrix; make sure Good's summary gets a visible example, not just the word "summary." |

### Better (AED 950)

| Objection | On-page answer |
|---|---|
| "What do I actually get for 250 AED less than Best?" | This has to be answered by the table rows themselves, not prose — Better and Best share every row except "done-for-you documents" and "14-day WhatsApp." One explicit sentence under Best reinforces it: "Everything in Session + Plan, plus we draft the documents and stay reachable for two weeks while you act on them." |
| "Do I need ongoing access, or just a one-time plan?" | One-line note beside Best: "if your situation is still moving, Full Support keeps us reachable" — ties directly to the 14-day WhatsApp row so the reader doesn't have to infer why it matters. |

### Best (AED 1,200 — Recommended)

| Objection | On-page answer |
|---|---|
| "Is 'done-for-you' real, or just more advice with a label on it?" | Name 2-3 concrete document types (e.g. resignation letter, PIP response, negotiation counter-offer email) instead of the generic "documents and email drafts." `[NEEDS DATA: confirm with the founder which documents she actually drafts today]` — don't let Theo invent examples she doesn't deliver. |
| "AED 1,200 (~$327) is a lot for a conversation." | Keep the existing HR-vs-Lawyer table ("$550–$1,400+" for a lawyer) close to the pricing table as the real anchor — currently it sits after the pricing content; move it up per section 1. |
| "What if I pay and it doesn't help?" | No refund/guarantee language exists anywhere in the codebase (checked booking flow, emails, `lib/products.ts`). This is the single largest unanswered objection on the highest-priced, most-promoted tier. `[NEEDS DATA: refund/satisfaction policy from the founder]` — decide before this ships, not after. Asking someone mid-PIP to pay the most for the least risk-reversal is a real leak. |

---

## 3. The 400 tier's real risk

Good sits close enough to Best in category (same format: a call about your situation) that a price-
anxious visitor can anchor on 400 and self-select down even when their situation genuinely needs Best —
the difference reads as "cheaper/faster," not "different job." Building against that:

1. **Suppress Good visually.** Smallest column, no accent color, no badge. Best keeps the highlight
   treatment; Good does not compete for attention share against it.
2. **Default selection stays on Best, not Good, everywhere a default exists.** `BookingFunnel.tsx`
   currently defaults `selected` to `"individual-advisory"` (today's 1,200 AED session) when no
   `?service=` param is present. Once the ladder ships, that default must continue pointing at
   Full Support — any traffic arriving without an explicit tier param should land on the anchor tier,
   not the entry one.
3. **An explicit "who this isn't for" line under Good**: "If your situation involves more than one
   issue, or you'll need documents drafted, start with Session + Plan or Full Support instead." An
   honest downsell-blocker, not a dark pattern — it's true, and it pre-answers the buyer's own
   uncertainty about which tier fits.
4. **Decide, before launch, whether Good's fee is creditable toward an upgrade.** This is the single
   highest-leverage lever against cannibalization and it's an operations decision, not a page-design
   one. `[NEEDS DATA: does the founder intend Good's AED 400 to credit toward Better/Best if the client
   upgrades within some window? If yes, that has to be a stated page promise, not a surprise on the call.]`
5. **Don't give Good its own hero real estate.** It stays the smallest cell in the shared table so it
   never gets to compete with Best for the reader's first look.

**Leading indicator to watch once there's data:** the share of `checkout_created` events per tier over
time (needs section 6's tier property on the event), read alongside the Good→Best upgrade rate — the
proportion of customers who buy Good and then buy Best/Better within a defined window (30 days is a
reasonable starting window; tune once real cycle-time data exists). If Good's share of total
consultation volume grows *faster* than total volume itself, and the upgrade rate stays flat or falls,
that's cannibalization rather than incremental capture, and it's a page-copy or default-selection
problem to fix, not a pricing one. `[NEEDS DATA: baseline tier mix — doesn't exist yet, since the tiers
don't exist yet. This is something to instrument now and read after 4-6 weeks of live traffic, not a
number I have today.]`

---

## 4. Availability-before-payment

**Where it goes:**
- `/services`: a compact "Next available times" strip directly under the comparison table — 3-5
  upcoming slot chips (e.g. "Tue 9 Sep · 2:00pm"), read-only, live-sourced. Clicking a chip carries the
  preference to `/booking?service=full-support&slot=<iso>`; it does **not** create a Cal booking.
- `/booking`: a new **Step 2 — "Pick a preferred time"**, inserted between the existing step 1 (choose
  support) and what is today step 2 (private intake, becomes step 3). Same read-only grid, scoped to
  the selected tier's Cal event type. The chosen slot becomes a hidden `preferredSlot` field posted to
  `/api/checkout/consultation` alongside the existing payload, so it lands in the order's metadata and
  is visible in the dashboard/confirmation email for the founder to try to honor.

**CTA copy — the honesty fix:** never "Book this slot," "Reserve," "Hold," or "Lock in" on the
pre-payment grid — none of those are true yet. Use **"Prefer this time →"**, paired with a persistent
line under every instance of the grid: *"This is a preference, not a booking — we confirm your exact
time after payment, on the next screen."* That sentence has to appear both on `/services` and in
`/booking` step 2, every time a slot chip is shown. This is the one hard copy rule for Theo in this
section.

**Handling "the slot might be gone by the time they pay" without losing the conversion benefit:** the
benefit of showing availability isn't "this exact slot is yours" — it's proving to an anxious buyer that
real times are open soon, which pre-answers "I'll pay and then wait weeks." So the promise the page
keeps should be about proximity ("times open this week"), not about a specific chip being reserved by
clicking it. On the post-payment Cal embed (`PaidScheduler.tsx`), if the preferred slot is still open it
should be pre-highlighted; if it's gone, no special messaging is needed beyond a default line — "your
preferred time may no longer be available; pick the closest one below" — since Cal's own calendar simply
won't show a taken slot, there's no broken-promise moment to manage, only a soft landing to write.
`[UNVERIFIED: whether the installed @calcom/embed-react (^1.5.3) config API supports a date-preselect
key — Mira should check the embed's config docs before building the pre-highlight, rather than assuming
it exists.]`

**Technical dependency to name up front, not discover mid-build:** today's live calendar
(`components/booking/PaidScheduler.tsx`) is Cal.com's own fully interactive `<Cal>` embed — a visitor
who reaches it can complete a real, unpaid Cal booking. That's fine post-payment because it's gated
behind a paid-order check. It is **not** fine pre-payment: embedding the same interactive widget on
`/services` or in `/booking` step 2 would let someone create a real booking before paying at all. A true
read-only preview therefore needs a different data source — a small server-side proxy that calls Cal's
public Slots/Availability API and renders plain, non-clickable-to-book chips. There is no Cal API key in
`.env.example` today (only public `NEXT_PUBLIC_CAL_LINK_*` values and a webhook secret for *inbound*
Cal→site events). `[NEEDS SETUP: a `CAL_API_KEY` and a small backend endpoint — this is Luke's scope,
not something Mira can build by reusing the existing embed component.]`

---

## 5. Currency display

**Recommendation: show both** — "≈ $327 · charged in AED," IP-derived local currency for the
approximation, everywhere a price appears pre-checkout (comparison table, specialist/retainer cards,
`BookingFunnel`'s tier selector).

- **Helps:** the buyer profile here is anxious and time-pressured; forcing a mental FX conversion at
  the exact moment of a price objection is friction that serves nobody. A gut-check magnitude ("this is
  roughly $300, not $3,000") removes a small but real stall, especially given the site's stated
  global-first positioning.
- **Hurts if mishandled:** the converted figure must never be presented as the amount that actually
  leaves the card, anywhere downstream of the pricing page — not in the Stripe checkout summary, not in
  the confirmation email, not on the dashboard. Stripe already charges AED (`chargeCurrency = "aed"` in
  `app/api/checkout/consultation/route.ts`), so nothing about the actual charge changes here — only the
  *display* layer does, and it has to stay clearly labelled as an estimate at every step, with AED as
  the only number once money has moved.
- **Pre-existing defect this project should fix regardless:** `components/services/ServicesCatalog.tsx`
  line 105 currently renders `≈ {formatUsd(service.amount)} · charged in USD` — that's wrong on both
  counts today: it hardcodes USD as the estimate currency, and it explicitly claims "charged in USD"
  when the checkout route actually charges AED. This should become the general local-currency version
  either way, independent of whether the ladder ships.
- `[NEEDS DATA: IP-geolocation source — not present in `package.json` today. If hosted on Vercel, its
  edge geo headers are free and sufficient; otherwise a third-party GeoIP service needs to be chosen and
  budgeted.]`
- `[NEEDS DATA: FX rate source and refresh cadence for USD/CAD/GBP/AUD — only a static
  `AED_PER_USD = 3.6725` constant exists in `lib/products.ts` today, no live feed. A stale rate on a
  page that says "≈" is a low-stakes error; a stale rate is a bigger problem if this number ever leaks
  into anything transactional, which is exactly why section 5's rule (estimate pre-checkout, AED only
  post-checkout) matters.]`

---

## 6. Event / measurement design

GA4 (`G-VS75LYDHVC`) and GTM (`GTM-PGW9TMS8`) are already live sitewide — see the correction at the top
of this document. No new GA4 property is needed. What's needed is (a) custom `dataLayer` events for the
new funnel steps, and (b) the missing "actually paid" row in `funnel_events`, which is a pre-existing
gap this project's tier-level reporting depends on closing.

### Track A — GA4 events (client-side, new `dataLayer.push` calls, Mira)

| # | Event | Trigger | Properties |
|---|---|---|---|
| 1 | `view_pricing_table` | Comparison table scrolls into view on `/services` (IntersectionObserver, once per session) | — |
| 2 | `select_tier` | Tier selected — table on `/services` or step 1 of `BookingFunnel` | `tier` (good/better/best/specialist-slug/retainer-slug), `product_slug`, `price_aed`, `source` (`services_table`\|`booking_funnel`) |
| 3 | `view_availability` | New availability grid renders with slots loaded (not the loading skeleton) | `product_slug`, `slot_count` |
| 4 | `select_preferred_slot` | Visitor clicks a slot chip pre-payment | `product_slug`, `slot_iso`, `source` (`services`\|`booking_step2`) |
| 5 | `begin_checkout` | `BookingFunnel` submit succeeds and receives a Stripe `url`, immediately before `window.location.assign` | `product_slug`, `tier`, `value` (AED), `currency: "AED"`, `had_preferred_slot: boolean` |
| 6 | `purchase` | Order confirmed paid, rendered on `/booking/schedule` (scheduled path) or `/booking/done` (async path) | `transaction_id: order.id`, `value`, `currency: "AED"`, `items: [{item_id: product_slug}]` |

`purchase` needs a de-duplication decision: both landing pages can be refreshed or revisited (emailed
confirmation links get clicked more than once), so a naive client-side fire will double-count. Recommend
firing it **server-side via the GA4 Measurement Protocol** at the same point the order is marked paid,
rather than client-side on page render — that sidesteps the refresh-refire problem entirely instead of
patching it with a `sessionStorage` flag.

### Track B — `funnel_events` rows (server-side, `recordFunnelEvent()`, new code, Luke)

This is the part that actually makes "tier-level and availability-step drop-off measurable" per the
brief — GA4 alone can't be joined back to `order.id`/email for the Good→Best upgrade tracking in
section 3.

7. **`checkout_paid`** — the missing event. Add `recordFunnelEvent({ event: "checkout_paid",
   productSlug, customerEmail, metadata: { orderId, tier } })` at the point an order is actually marked
   paid: in the Stripe webhook handler (`app/api/webhooks/stripe/route.ts`, alongside the existing
   receipt/notification calls), **and** in the race-condition fallback path in
   `app/booking/schedule/page.tsx` (`markOrderPaidFromSession`), so paid conversion is captured
   regardless of which path resolves first. Without this, `funnel_events` can only ever answer "how many
   checkouts started," never "what converted" — that gap predates the pricing change and blocks tier
   reporting either way.
8. **`slot_previewed`** — server-side, fired when the new availability-preview endpoint (section 4) is
   called. More reliable than relying on client `dataLayer` alone for this one, since it's already a
   server round-trip to Cal.

### What needs a GA4 console change vs. what's pure code

- No new property. `G-VS75LYDHVC` exists and is live — items 1-6 are custom events into it, marked as
  GA4 key events ("conversions") from the GA4 admin UI once they start arriving. That's a console step,
  not code. `[NEEDS DATA: who currently has admin access to G-VS75LYDHVC — not resolvable from this
  repo.]`
- Everything else (items 1-8) is new code: `components/services/*`, `components/booking/BookingFunnel.tsx`,
  the new availability-preview component, `app/api/webhooks/stripe/route.ts`, `app/booking/schedule/page.tsx`,
  `app/booking/done/page.tsx`.

---

## 7. Test design

**The layout question in section 1 is not the highest-value first test.** Table-vs-cards for the whole
ladder needs a tier-selection-rate difference to read cleanly, which needs a large sample per arm and
isn't a clean single-variable change (it's a full re-layout, hard to ship as a flag). Structural
choices in this doc are closer to "obviously correct given the objection map" than genuine toss-ups.

**Recommended test: does the pre-payment availability preview (section 4) increase `begin_checkout`
rate?** This is the one element in the whole spec where reasonable people could actually disagree —
it might resolve real anxiety, or it might just add a decision step that increases drop-off before
payment. It's also cheap to isolate as a single component behind a flag, unlike the layout question.

- **Hypothesis:** showing 3-5 read-only "next available" chips in `/booking` step 2 increases the rate
  at which visitors who reach tier selection go on to `begin_checkout`, because it resolves "will I
  actually get a slot soon" before the payment ask instead of after.
- **Primary metric, fixed before launch:** `select_tier` → `begin_checkout` conversion rate (events 2
  and 5 above).
- **Guardrail metrics:** time-to-`begin_checkout` (should not slow materially even without a lift), and
  `purchase` rate specifically — confirming any top-of-funnel lift isn't just people who liked seeing a
  calendar and then abandoned once they saw real availability was thinner than they hoped.

**Sample size: cannot be calculated yet.** `[NEEDS DATA: current /booking sessions per month, or
step-1 (`select_tier`) completions per month]` and `[NEEDS DATA: baseline `select_tier`→`begin_checkout`
conversion rate]` — neither exists today, since neither event is instrumented yet and no traffic figure
was supplied. The right sequence is: ship section 6's events first, run 2-4 weeks uninstrumented (i.e.
collecting a baseline, not yet split), then size the test off the real baseline. For illustration only,
not as this account's number: a two-proportion test at 80% power / 95% confidence detecting a 5-point
absolute lift off a ~20% baseline needs on the order of 1,000+ step-1 completions per arm — replace this
with the real baseline before committing to any test duration.

**If baseline volume turns out too low to reach significance in a reasonable window** — a real
possibility for a boutique advisory site — the qualitative alternative: 5 moderated session recordings
watching exactly the moment visitors reach the availability grid, plus a 1-question post-checkout survey
("What almost stopped you from booking today?"). `[NEEDS DATA: is a session-recording tool already
installed? I searched for Hotjar/Clarity/FullStory/Mouseflow references across the repo and found
none.]` Five people watched properly beats a split test read as a result at volume that can't support one.
