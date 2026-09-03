# `/services` rebuild — design spec

**Author:** Elena (creative director) · **For:** Mira (frontend implementation) · **Status:** spec only,
no code below. Layout, tokens and interaction are final; **new user-facing copy in this document (empty
states, error states, chip micro-copy, the mobile "what changes" line) has not been gated by Ruth
(brand-guard)** — `clients/humanly/brand-voice.md` and `clients/humanly/guardrails.md` do not exist in
this repo, so there is nothing to check it against yet. Mira can build every component now; do not ship
the copy strings live until Ruth (or, absent Ruth, the founder directly) has signed off on them — flag
this again at handoff.

Everything below builds on `docs/cro/2026-09-pricing-page-cro.md` (Marcus). Where I extend or diverge
from it, I say so and why. `lib/products.ts` already carries the correct data model — `coreComparison`
(6 rows), `getCoreLadder()`, and the `featured` flag on Full Support — so nothing in `lib/products.ts`
needs to change. Render from it; don't re-author copy in the component.

---

## 0. Ladder layout — resolved

**Agree with Marcus: comparison table for Good/Better/Best, cards for Specialist Sessions and Monthly
Retainers.** The table is the only layout where "Better has this, Best adds these two more" is legible
without re-reading, which is the entire mechanism the Goldilocks pricing depends on.

**One refinement to his breakpoint, stated explicitly:** Marcus's spec draws the table/card line at
640px. I'm moving it to **1024px (`lg:`)**. A real comparison table needs roughly 700–900px of stable
width to keep three price columns and a feature-label column readable without cramming — an iPad Mini
(744px) or a portrait iPad (810px) is still narrower than that, and it's held one-handed by the same
"researching privately, possibly at work" visitor Marcus's own objection map describes. Rather than force
a table into a width it doesn't fit, everything **below `lg` (0–1023px)** gets the mobile card treatment;
only **`lg:` (1024px+)** gets the table. This is a genuine change to his spec, not a restatement of it —
flagging it as a decision, not silently reinterpreting "mobile."

**Second addition — mobile loses side-by-side legibility, so I'm replacing it with something that
recovers it.** Marcus's mechanism depends on Better and Best sitting in one visual frame. Three fully
separate stacked cards, each with its own bullet list, throws that away below `lg`. Fix: **accordion
cards**, not plain stacked cards — see §3.2.

---

## 1. Design tokens (before components)

Every value below is a named token from `app/globals.css` / `DESIGN.md`, or an existing Tailwind
utility already used consistently elsewhere in this codebase (`rounded-2xl`, `rounded-3xl`,
`rounded-full`, the default spacing scale). Nothing here is a raw hex or an arbitrary pixel value. Where
a token this page needs doesn't exist yet, it's called out under "gaps," not invented inline.

### Color roles (from `app/globals.css` `@theme`)

| Role | Token / class | Use on this page |
|---|---|---|
| Page surface | `bg-neutral-bg` (`#fbf7f1`) | Section background |
| Card / table surface | `bg-neutral-100` (`#ffffff`) | Table wrapper, Good/Better cards |
| Ink | `text-primary-dark` (`#3f1b73`) | Headings, feature labels, prices |
| Body copy | `text-neutral-900` (default) / `text-neutral-500` | Paragraphs / supporting copy |
| Signature accent | `text-primary-violet` / `border-primary-violet` (`#7c35e3`) | Checkmarks, links, focus ring (already global) |
| Best-tier emphasis | `bg-accent-orange` / `border-accent-orange` / `text-accent-orange` (`#fda544`) | Recommended badge, Best column border/tint, Best CTA fill |
| Best-tier tint | `bg-accent-orange/8` `border-accent-orange/20` | Best column background — same opacity pattern already used for the retainer category card in `ServicesCatalog.tsx` |
| Featured-card reversal | `bg-primary-dark text-on-primary` | Best's **mobile card only** (§0) — not used on the desktop table, see §3.1 |
| Error / recoverable failure | `text-error` `border-error/30` `bg-error/6` (`#ff4f5e`) | Availability-grid error state |
| Dashed containers | `border-neutral-300` (dashed) `bg-neutral-100` | Empty/error state cards, the "who this isn't for" note |
| Not-included glyph | `text-neutral-400` | Feature-matrix "No" cells |

**Gap to flag:** the one existing error state in the codebase (`BookingFunnel.tsx`'s form error) uses raw
`bg-red-50 text-red-700`, not the `--color-error` token. Don't copy that pattern here — use `text-error`
/ `bg-error/6` / `border-error/30` as above. Worth a follow-up ticket to fix the pre-existing one to
match, but that's outside this page's scope.

### Type scale

| Element | Class |
|---|---|
| Section heading ("A confidential reality check" pattern) | `text-h2 font-display font-extrabold text-primary-dark` |
| Tier name (table header / card title) | `text-h3 font-display font-bold text-primary-dark` (table) / `text-h3` on featured mobile card uses `text-on-primary` |
| Tier subtitle ("The plan you act on") | `text-body-sm font-semibold uppercase tracking-wide text-primary-violet` |
| Feature row label | `text-body-sm font-semibold text-primary-dark` |
| Feature row value (string, e.g. "30 min") | `text-body-sm text-neutral-600` |
| Price (primary, AED) | `text-h2 font-display font-extrabold text-primary-dark` |
| Price (USD reference) | `text-caption font-semibold text-neutral-400` |
| Badge ("Recommended") | `text-label-bold uppercase tracking-wider` |
| Disclaimer line under availability grid | `text-body-sm text-neutral-500` |
| Chip time | `text-body-sm font-bold text-primary-dark` |
| Chip day label | `text-caption uppercase tracking-wide text-neutral-500` |

### Spacing

Use the existing rhythm, not new values: sections `py-16 md:py-24`, container `mx-auto max-w-max-width
px-margin-mobile md:px-margin-desktop` (`--spacing-max-width: 1240px`, `--spacing-margin-mobile: 20px`,
`--spacing-margin-desktop: 64px`), block-to-block spacing `mb-12`–`mb-16`, card padding `p-7`/`p-8`,
card internal gaps `gap-4`/`gap-5`, feature-matrix cell padding `p-5` (matches the existing HR-comparison
table in `app/services/page.tsx`).

### Radius

No formal `--radius-*` scale exists beyond `--radius-blob` (decorative only). This page uses the
de facto scale already applied everywhere else in the codebase — treat these three as fixed:

| Radius | Class | Use |
|---|---|---|
| Pill | `rounded-full` | Badges, CTAs, chips |
| Card | `rounded-3xl` | Table wrapper, mobile ladder cards, availability-grid panel |
| Inset element | `rounded-2xl` | Individual day columns inside the grid, dashed empty/error containers, icon tiles |

### Elevation

Also no numeric elevation scale — four named utilities in `globals.css` are the whole vocabulary; don't
add a fifth:

| Class | Use |
|---|---|
| `shadow-pop` (6px, primary-dark) | Reserved for hero-level cards — not used on this page's new components |
| `shadow-pop-sm` (4px, primary-dark) | Table wrapper, CTA buttons on press-equivalent state |
| `shadow-pop-orange` (6px, accent-orange) | Best's mobile card (matches existing `featured` card pattern) |
| `shadow-soft` (blurred) | Not used here — reserved for photography per existing usage |

### Component gap to flag before building

`Reveal` and `Eyebrow` (the fade-in-on-scroll wrapper and the pill label) are **defined locally inside
`components/home/HomeContent.tsx`**, not exported from a shared file. Don't duplicate them a third time.
Extract both to `components/ui/Reveal.tsx` and `components/ui/Eyebrow.tsx` before using them on this page
— and while extracting `Reveal`, fix the reduced-motion gap in §5.

---

## 2. The comparison table — desktop (`lg:` / 1024px+)

**Structure:** a real `<table>`, not a CSS-grid facade — it's tabular data and needs to be announced as
one (§5). Wrapper: `mx-auto max-w-5xl overflow-hidden rounded-3xl border-2 border-primary-dark
bg-neutral-100 shadow-pop-sm`. No horizontal scroll at this breakpoint — `max-w-5xl` (1024px) keeps
columns readable within the 1240px page container.

**Columns**, via `<colgroup>`: label column ~34% width, Good/Better/Best each ~22%. Not pinned/sticky —
Marcus's sticky-label caveat only applies if horizontal scroll is needed, and it isn't at this
breakpoint.

**Row order, top to bottom:**

1. **Header row.** Label cell empty (or `<caption class="sr-only">`, see §5). Each tier cell: tier name
   (`text-h3`), one-line subtitle from `ServiceProduct.subtitle` (already authored: "Quick orientation
   on one issue" / "The plan you act on" / "Everything handled for you"). Best's cell additionally
   carries the **"Recommended" badge** — rendered as a static line *inside* the cell, above the tier
   name, not as an absolutely-positioned overlapping badge like the card pattern uses. Table cells clip
   overflowing absolutely-positioned children inconsistently across browsers; an in-flow badge avoids
   that failure mode entirely. Badge: `inline-flex items-center gap-2 rounded-full border-2
   border-primary-dark bg-accent-orange px-4 py-1 text-label-bold uppercase tracking-wider
   text-primary-dark`.
2. **Six feature rows**, rendered directly from `coreComparison` in `lib/products.ts`, in the order
   already defined there (Call length → Written summary → Full action plan → Async follow-up →
   Done-for-you documents → 14-day WhatsApp). Don't hand-author these strings again in the component.
3. **Price row.** AED primary + USD reference, per §4.
4. **CTA row.** One button per column, linking to `/booking?service=<slug>`.

**Rendering a boolean cell — the "No" that doesn't look broken:**

- `true` → `CheckCircle2` (lucide, already imported elsewhere on this page), `size={18}`,
  `text-primary-violet`, centered, plus `<span class="sr-only">Included</span>`.
- `false` → `Minus` (lucide), `size={18}`, `text-neutral-400`, same position/weight as the checkmark —
  centered, not left-aligned, not smaller — plus `<span class="sr-only">Not included</span>`. A dash in
  the same visual slot reads as "considered and deliberately excluded"; a blank cell reads as "we forgot
  to fill this in." That's the fix the brief is asking for — never render an empty `<td>`.
- A string value (`"30 min"`, `"Short"`) → plain `text-body-sm text-neutral-600`, centered.

**Best column emphasis — deliberately NOT the dark card reversal:** the featured-card pattern
(`bg-primary-dark text-on-primary`) used elsewhere on the site works because each card is a standalone
block. Inside one table row, flipping only the middle column to reversed colors means every checkmark,
every text color, and every contrast ratio changes at a column boundary mid-row — that breaks horizontal
scanning, which is the one thing this table exists to preserve. Instead:

- Best's `<td>`/`<th>` cells: `bg-accent-orange/8`, with a `border-l-2 border-r-2 border-t-2
  border-accent-orange` running down the outside of the whole column (apply to the header cell's top
  edge and each column's left/right edge; the bottom edge closes on the CTA row).
- Good and Better get **no** special background, **no** badge, ordinary `border-primary-dark` cell
  borders, and the **same** checkmark color and weight as each other — Good must look like a complete,
  legitimate product, just not a highlighted one (per Marcus §3: "a real entry product, not a decoy").
  The only thing suppressing Good is the *absence* of tint/badge/border-weight that Best gets, never a
  degraded icon or muted text treatment.

---

## 3. The comparison — below `lg` (0–1023px)

**Accordion cards, Best expanded by default, in order Best → Better → Good** (primacy for the primary
tier on a single-column read, per Marcus §1). Plain stacked cards each with a separate bullet list would
lose the side-by-side "small step up" legibility the whole ladder depends on — an accordion keeps that
comparison available without a 1000px-tall page.

**Each card:**

- Wrapper: `rounded-3xl border-2 border-primary-dark p-7`. Best: `bg-primary-dark text-on-primary
  shadow-pop-orange` (existing featured pattern). Better/Good: `bg-neutral-100`.
- Best carries the "Recommended" badge, absolutely positioned exactly as in `ServicesCatalog.tsx`
  (`absolute -top-3.5 left-1/2 -translate-x-1/2 ...`) — that pattern is safe here because a card, unlike
  a table cell, doesn't clip in a browser-inconsistent way.
- Header: tier name (`text-h3`), subtitle, price (§4), CTA button — all visible whether the card is
  expanded or not, so a visitor who never taps anything still sees name/price/CTA for all three tiers.
- Below the CTA: a toggle button, `<button aria-expanded>`, label **"See what's included"** /
  **"Hide details"** when open, `text-body-sm font-bold text-primary-violet`, chevron icon (lucide
  `ChevronDown`, rotates 180° on open — respects reduced motion per §5).
- Expanded content: the six `coreComparison` rows as a checklist (reuse the existing
  `CheckCircle2`/label pattern from `ServicesCatalog.tsx`'s "What you get" block), with `false` rows
  still rendered — same "Minus, not absence" rule as the table — using `Minus` + `text-neutral-400` /
  `text-on-primary/40` on Best's dark card.
- **Better's card gets one extra line**, directly under its price, that the table doesn't need (because
  the table already shows Better and Best in one frame — the card can't): *"AED 250 more unlocks Best's
  two extras: done-for-you documents and 14 days of WhatsApp access."* `text-body-sm text-neutral-500`.
  This is new copy — flag it to Ruth/the founder before it ships (see status line at top).
- **Good's card gets the "who this isn't for" line** from Marcus §3, directly under its feature list:
  *"If your situation involves more than one issue, or you'll need documents drafted, start with Session
  + Plan or Full Support instead."* `text-body-sm text-neutral-500`, no icon.

---

## 4. Price + currency treatment

**Every pre-checkout price on this page** (table, mobile cards, Specialist Sessions cards, Retainer
cards) renders as a two-line stack:

```
AED 1,200
≈ $327 · charged in AED
```

- Primary: `formatAed(amountAed)`, `text-h2 font-display font-extrabold text-primary-dark` (table/mobile
  card context) — the existing `ServicesCatalog.tsx`/`HomeContent.tsx` cards use `text-4xl`; either is
  acceptable since both resolve to the same visual size class of "large, unmistakable" — don't introduce
  a third size.
- Secondary: `≈ {local-currency estimate} · charged in AED`, `text-caption font-semibold text-neutral-400`
  (`text-on-primary/55` on Best's dark mobile card, matching the existing opacity convention). **"charged
  in AED" is never omitted** — it's the one phrase on the page that disambiguates which number actually
  leaves the card.
- On `service.featured` dark surfaces, use the existing `/60`, `/55` opacity conventions already applied
  to price notes elsewhere in `ServicesCatalog.tsx` — don't invent new opacity values.

**Fixing a pre-existing defect while this ships:** `components/services/ServicesCatalog.tsx` line 105
currently renders `≈ {formatUsd(service.amount)} · charged in USD` — wrong on both counts (hardcodes USD
as the estimate, and Stripe actually charges AED per `app/api/checkout/consultation/route.ts`). Replace
it with the pattern above across every card on `/services`, not just the new ladder — this bug predates
the ladder and should be fixed regardless of which parts of this spec ship first.

**Footer currency switcher:**

- Small control in the footer (not per-price — one global preference), styled as a pill select:
  `rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-label-bold text-primary-dark`,
  a small globe icon (lucide `Globe`) at the leading edge.
- Options: AED (default/"as charged"), USD, CAD, GBP, AUD — matching the currencies Marcus's CRO doc
  names.
- Changing it re-renders every "≈" secondary line sitewide from a stored preference
  (`localStorage`/cookie) — it **never** touches the primary AED figure, the Stripe checkout amount, the
  confirmation email, or the dashboard. Only the estimate layer changes.
- **Blocked on data, not on design:** the rate source and the geo-detection for the switcher's default
  are `[NEEDS DATA]` — inherited from Marcus's CRO doc (no FX feed exists beyond the static
  `AED_PER_USD = 3.6725` constant in `lib/products.ts`; no geo-IP source in `package.json`). Mira can
  build the switcher's UI and the plumbing now against that one static USD rate, and wire in CAD/GBP/AUD
  once a rate source is chosen — the component shouldn't need to be rebuilt when that lands, only fed a
  wider rate table.

---

## 5. The availability grid — five states

Two density variants of one component, per the two placements in Marcus §4:

- **`compact`** — `/services`, directly under the comparison table (§0 sequencing). A single row of up
  to 5 chips, no day grouping, `flex flex-wrap gap-3`.
- **`full`** — `/booking` step 2. Slots grouped by day. Desktop (`md:` and up): day columns in a row,
  `grid-cols-[repeat(auto-fit,minmax(140px,1fr))]` up to 7 columns, one per day that actually has a
  slot in the query window (skip days with zero slots rather than rendering an empty column). Below
  `md`: columns stack as full-width sections in date order, each with its own heading.

**Chip content differs slightly by context**, and that's deliberate, not an inconsistency:

- `compact` and `full`-desktop chip (day not otherwise shown): three stacked lines — day/date
  (`text-caption uppercase tracking-wide text-neutral-500`, e.g. "Tue, 9 Sep"), time (`text-body-sm
  font-bold text-primary-dark`, e.g. "2:00pm"), and the CRO-mandated action label **"Prefer this time
  →"** (`text-caption font-semibold text-primary-violet`) always visible beneath, not a hover-only
  reveal — the buyer profile here is mostly touch/mobile, which has no hover.
- `full`-mobile stacked chip (day already shown as the section heading above it): two lines only — time,
  then "Prefer this time →" — day isn't repeated inside every chip.

**Chip container:** `rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2.5`, hover/focus
`bg-violet-tint border-primary-violet`, selected (after click) `bg-primary-violet text-on-primary
border-primary-violet` with a small `Check` glyph replacing the "Prefer this time →" line. **Never**
`bg-accent-orange` or `btn-pop` — that treatment is reserved for the paid CTA everywhere else on the
site; reusing it here would visually claim the chip is a commitment, which it explicitly isn't (see §6).

**The persistent disclaimer** appears once under every instance of the grid (not per chip):
*"This is a preference, not a booking — we confirm your exact time after payment, on the next screen."*
`text-body-sm text-neutral-500`, `Info` icon (lucide, `text-primary-violet`, `size={16}`) — matches the
existing intake-note pattern in `BookingFunnel.tsx`.

### The five states

**1. Loading.** 5–7 pill-shaped skeleton placeholders, `bg-neutral-200 animate-pulse`, same
dimensions as a real chip so layout doesn't shift on load. No visible copy; `aria-live="polite"` region
carries `<span class="sr-only">Loading available times…</span>` for screen readers, replaced by the
populated announcement once slots arrive.

**2. Empty.** *"No times in the next 14 days. Message us on WhatsApp and we'll find one that works."*
— "Message us on WhatsApp" links to `/contact` (the site's existing floating-contact route, brand-exception
green icon per `DESIGN.md`). Card: `rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100
p-6 text-center text-body-sm text-neutral-500`.

**3. Error.** *"Couldn't load live availability right now. You can still book — we'll confirm your exact
time after payment."* Card: `rounded-2xl border-2 border-dashed border-error/30 bg-error/6 p-6
text-center text-body-sm text-primary-dark`, `CircleAlert` icon (lucide, `text-error`, `size={20}`).
**The error state must never block the page's primary CTA** — the tier CTA buttons above/beside it stay
fully active; this card is informational only, never a dead end.

**4. Populated.** Chips render as specified above.

**5. Overflowing (a day with 20 slots).** Cap each day's **visible** chips at **6**, followed by a
dashed ghost chip: **"+14 more"** (`border-2 border-dashed border-neutral-300 text-neutral-500`,
matching weight/size to a real chip so it doesn't read as broken). Clicking it expands that day's column
into an internally-scrolling list, `max-h-56 overflow-y-auto`, rather than letting the column grow taller
than its neighbors — the fix is a fixed max-height with internal scroll, not an unbounded wrap, so a
20-slot Tuesday never distorts row heights against a 2-slot Wednesday next to it.

**Technical dependency, restated from Marcus's doc so it isn't discovered mid-build:** this must be a
read-only view sourced from a server-side proxy to Cal's Slots API, **not** the live `<Cal>` embed used
post-payment in `PaidScheduler.tsx` — that embed lets a visitor complete a real unpaid booking, which is
exactly what pre-payment placement must not allow. `[NEEDS SETUP: CAL_API_KEY + a small backend endpoint
— Luke's scope, not buildable by reusing the existing embed component.]`

---

## 6. Responsive summary

| Breakpoint | Ladder | Availability grid (`full` variant) |
|---|---|---|
| `<640px` (mobile) | Accordion cards, Best expanded, order Best→Better→Good | Day sections stacked full-width, chips wrap within each |
| `640–1023px` (tablet) | Same accordion cards as mobile (§0 — deliberately not the table) | Same stacked day sections — still one-handed, still private |
| `≥1024px` (`lg:`, desktop) | Full `<table>`, §2 | Day columns in a row, up to 7, `auto-fit minmax(140px,1fr)` |

No horizontal *page* scroll at any width. The only internal scroll on this page is the overflow state
inside a single day column (§5.5), which is deliberately contained so it can never leak into the page
scrollbar.

---

## 7. Accessibility

**Focus order** on `/services`, top to bottom: nav → hero CTA → Confidentiality Promise CTA (moved up
per Marcus §1) → comparison table/accordion CTAs (three, in tier order as rendered — Best, Better, Good
on mobile; Good, Better, Best left-to-right on desktop, matching visual order in both cases) → mobile
accordion toggles (if present) → availability-grid chips → Specialist Sessions CTAs → Retainer CTAs →
HR-comparison table (no interactive elements) → founder/testimonial CTA → footer, including the new
currency switcher last. Nothing on this page should require a skip pattern beyond what the site already
has — the table's checkmarks/dashes are not focusable, only real controls are.

**Focus-visible:** already global — `globals.css` applies `focus-visible:outline
focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-violet` to every
`button`/`a`/`input`/`textarea`/`select`. Every new interactive element on this page (chips, accordion
toggles, currency switcher) must be a real `<button>` or `<select>` so it inherits this automatically —
don't build a chip as a styled `<div onClick>`.

**Contrast**, computed against the actual tokens (WCAG relative-luminance formula, not estimated):

| Pair | Ratio | Verdict |
|---|---|---|
| `text-primary-dark` on `bg-neutral-bg` | 12.2:1 | AAA |
| `text-neutral-900` (default body) on `bg-neutral-bg` | 16.8:1 | AAA |
| `text-on-primary` (white) on `bg-primary-dark` | 13.0:1 | AAA |
| `text-on-primary/70` on `bg-primary-dark` | 7.1:1 | AAA |
| `text-accent-orange` on `bg-primary-dark` | 6.6:1 | AA (normal text), AAA (large) |
| `text-primary-violet` on `bg-neutral-bg` | 5.7:1 | AA |
| `text-neutral-500` on `bg-neutral-bg` | 5.6:1 | AA only — **floor**: don't go lighter than `neutral-500` for anything under 18px on cream |
| `text-accent-orange` on `bg-neutral-bg` (cream) | **1.9:1** | **Fails.** Never use accent-orange as a text color on a light neutral surface — fill/border/shadow only, or as text on `bg-primary-dark` |

That last row is the one real trap in this build: accent-orange reads as the brand's "highlight" color
everywhere else, but it is not legible as body/label text on the page's own cream background. Every use
of it above (badge text stays `text-primary-dark` on an orange *fill*; orange is never the text color on
cream) already respects this — flagging it explicitly so it isn't reintroduced later.

**Screen-reader markup for the matrix:**

- Real `<table>`, `<caption class="sr-only">Comparison of Humanly's three advisory tiers: The Session,
  Session + Plan, and Full Support</caption>`.
- Tier-name cells: `<th scope="col">`.
- Feature-label cells: `<th scope="row">`, not `<td>`.
- Boolean cells: icon plus `<span class="sr-only">Included</span>` / `<span class="sr-only">Not
  included</span>` — a screen reader must never announce only "image" or nothing.
- On mobile, the accordion's expanded checklist is a `<ul>`, and the toggle button carries
  `aria-expanded={open}` and `aria-controls` pointing at the list's id.

**`prefers-reduced-motion` — a real gap to close, not a formality:** `globals.css` zeroes
`animation-duration`/`transition-duration` globally under `@media (prefers-reduced-motion: reduce)`,
which correctly disables CSS-driven motion (the skeleton `animate-pulse`, `btn-pop`'s hover transform,
the chevron rotation on the accordion). **It does not touch `Reveal`'s framer-motion `whileInView` +
`transition` prop**, because that's JS-driven animation, not a CSS `transition` — the blanket CSS rule
can't reach it. Every `Reveal` instance on this page will still slide up 24px on scroll for a visitor who
has reduced motion turned on for vestibular reasons, unless `Reveal` itself is fixed. Do this once, in
the shared `components/ui/Reveal.tsx` extraction called out in §1: gate the `y: 24` offset behind
framer-motion's `useReducedMotion()` hook so it collapses to a plain opacity fade (or no animation at
all) when the OS setting is on. This is a pre-existing site-wide gap, not new to this page — fixing it in
the shared component fixes it everywhere `Reveal` is used, not just here.

---

## 8. What NOT to do on this page

- **Don't reverse Best's colors inside the desktop table.** Full `bg-primary-dark text-on-primary` is
  right for a standalone card (mobile) and wrong inside a table row — see §2's reasoning. If Best's
  table column ever gets restyled to the dark reversal, that's a regression of this spec, not a stylistic
  update.
- **Don't render a blank cell for "No."** Every `false` value gets a `Minus` glyph in the same visual
  slot a checkmark would occupy, plus the `sr-only` label. An empty cell reads as a bug.
- **Don't put `accent-orange` text on the page's cream background** anywhere — §7's contrast table shows
  why (1.9:1). It's a fill/border/shadow color on this page, and a text color only on `bg-primary-dark`.
- **Don't style the availability chips like the paid CTA.** No `btn-pop`, no `bg-accent-orange` on a
  chip, ever — that visual language means "this charges your card" everywhere else on the site, and
  reusing it on a pre-payment preference chip contradicts the honesty rule Marcus wrote into the CTA
  copy itself ("Prefer this time," never "Book"/"Reserve"/"Hold").
- **Don't embed the live `<Cal>` booking widget anywhere pre-payment.** The availability grid is a
  read-only proxy view; `PaidScheduler.tsx`'s interactive embed is gated behind a paid-order check for a
  reason, and copying it onto `/services` or `/booking` step 2 would let a visitor create a real,
  unpaid booking.
- **Don't let a 20-slot day distort the grid.** Cap and internally scroll (§5.5) — don't let `flex-wrap`
  run unbounded and push that day's column taller than the others, and don't let it push the page's
  vertical rhythm around it.
- **Don't add a fifth `Reveal`-style stagger animation, a new `Scribble` variant, or a new
  `shadow-pop-*` color to this page.** The existing four elevation classes and the existing `Scribble`
  library (`DESIGN.md`) already cover everything this rebuild needs — a pricing/comparison page is where
  restraint matters most; this is the one page on the site where a visitor is mid-decision under real
  stress, and it should read calmer than the marquee/blob-heavy homepage, not busier.
- **Don't hardcode "charged in USD."** Fix the existing bug at `ServicesCatalog.tsx:105` as part of this
  work — it's currently false today, and shipping the new ladder next to an unfixed old bug undermines
  the "charged in AED" honesty rule everywhere else on the same page.

---

## Flags carried forward / new

All of Marcus's `[NEEDS DATA]`/`[NEEDS SETUP]` items from `docs/cro/2026-09-pricing-page-cro.md` still
apply and aren't repeated in full here except where this spec depends on them directly:

- `[NEEDS SETUP: CAL_API_KEY + backend proxy endpoint for the availability grid — Luke's scope]`
- `[NEEDS DATA: FX rate source/refresh cadence for CAD/GBP/AUD, and a geo-IP source for the switcher's
  default — only the static AED_PER_USD constant exists today; the switcher UI in §4 can be built now
  against that one rate and wired to more currencies later without a rebuild]`
- `[NEEDS DATA: refund/satisfaction policy from the founder — Marcus §2, doesn't affect this spec's
  layout but must land before the Best-tier objection row ships copy]`
- `[NEEDS DATA: does Good's AED 400 credit toward an upgrade — Marcus §3, affects whether the "who this
  isn't for" line on Good's mobile card needs a second sentence about crediting]`

New from this pass:

- **This spec's new microcopy is ungated.** The mobile "AED 250 more unlocks..." line, the "who this
  isn't for" line, and the availability-grid empty/error copy need Ruth (or the founder, absent Ruth)
  before they go live — build the components now, hold the copy strings as a named prop/constant so
  swapping approved copy in later doesn't touch layout code.
- **`Reveal`/`Eyebrow` need extracting to `components/ui/` before this page uses them, and `Reveal` needs
  the `useReducedMotion()` fix while it's being extracted** — see §1 and §7.

---

## File references

- `docs/cro/2026-09-pricing-page-cro.md` — Marcus's CRO spec this builds on.
- `lib/products.ts` — `coreComparison`, `getCoreLadder()`, `ServiceProduct` type; render from these, do
  not re-author.
- `components/services/ServicesCatalog.tsx` — existing card pattern (Specialist Sessions / Retainers
  reuse this unchanged); line 105 has the USD/AED bug to fix (§4).
- `app/services/page.tsx` — current page order; move the Confidentiality Promise block up per Marcus §1.
- `components/home/HomeContent.tsx` (lines 176–188, 165–174) — `Reveal`/`Eyebrow`, to be extracted.
- `components/booking/PaidScheduler.tsx` — the post-payment live `<Cal>` embed; do not reuse pre-payment
  (§5, §8).
- `components/booking/BookingFunnel.tsx` — existing trust-chip pattern (`"No employer notification"`,
  line 329) and intake-note pattern (`Info` icon usage, line 298–303) to match.
