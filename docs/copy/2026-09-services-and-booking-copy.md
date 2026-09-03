# Services, booking & testimonials — copy deck

**Author:** Theo (content) · **For:** Mira (frontend implementation) · **Gate:** Ruth must SHIP this
before anything below ships client-facing. Nothing in this document is final until she has reviewed it.

## Before the copy — the gap this deck is written against

There is no `clients/humanly/context.md`, `guardrails.md`, or `brand-voice.md` in `~/qognition-ops`.
Normally that stops marketing work before it starts. It doesn't stop this deck, because the task
explicitly commissioned it against that gap and pointed me at the repo instead — `DESIGN.md`'s Voice &
positioning section, `lib/site.ts`, and Marcus's CRO spec (`docs/cro/2026-09-pricing-page-cro.md`) are
what this deck is written from. But two things that would normally live in `guardrails.md` are missing
and matter here:

1. **No client-approved claim-limit list.** Humanly is HR guidance and coaching, not legal advice — that
   line is load-bearing per `DESIGN.md`. Every FAQ answer below stays inside that line deliberately. If
   the founder wants to say more or less than what's here, that's a `guardrails.md` decision, not mine.
2. **No confirmed refund/satisfaction policy for the core ladder, specifically.** I did find a real,
   already-shipped cancellation policy at `app/faq/page.tsx:34` ("24hr full refund, <24hr 50%, no-shows
   non-refundable but one free reschedule") — this answers *part* of the "what if I pay and it doesn't
   help" objection Marcus flagged, and I've used it below. It is **not** an outcome/satisfaction
   guarantee. Whether Humanly offers one of those is still `[NEEDS DATA]` — see the closing list.

**The claim this ladder owns**, so it's on record: most HR-advisory pricing is either an hourly rate or
one flat retainer. Humanly's ladder makes the exact difference between tiers visible in one place — the
950→1200 step buys two named things, not a vaguer "more support." Nobody sells this specific,
side-by-side.

**Search intent.** `/services` is a consideration-stage visitor who already suspects they need paid help
and is now pricing it — anxious, often reading privately, often at work. `/booking` is someone who has
decided in principle and is converting. Copy below is written for those two different moments; nothing
on `/booking` re-sells the tiers, it just gets someone through payment without a lie in the way.

**Internal links.** `/services` should link to `/booking` (already does) and to `/about` for the founder
credibility block Marcus's objection map calls for (already exists per recent commits — surface it nearer
the pricing table, not just at the page tail). `/booking` currently has **no link back to `/services`** —
recommend Mira add one for anyone who lands on `/booking` cold (an ad, a shared link) without having
compared tiers first.

---

## A. The core ladder

Voice note: short sentences, concrete nouns, no hedging. The reader is stressed; don't make her decode
the copy on top of the situation she's already in.

### The Session — AED 400 · 30 minutes

**Positioning statement:** Quick orientation on one issue.

**Description:** A focused 30-minute conversation about one specific problem, so you know what you're
dealing with before you decide what to do next. You leave with a short written summary of the next steps
to take.

**Features, as a buyer reads them:**
- Confidential 30-minute call, one on one with Karma
- Focused on the one issue you bring
- Short written summary of your next steps, sent after the call

**Who this is for:** You have one specific question and want an expert, unbiased read on it before you
act.

**Who this isn't for (place directly under the tier, per Marcus's downsell-blocker recommendation):** If
more than one issue is in play, or you already know you'll need documents drafted, start with Session +
Plan or Full Support instead. Good is built for a single question, not a live, multi-front situation.

### Session + Plan — AED 950 · 60 minutes

**Positioning statement:** The plan you act on.

**Description:** A full hour on your situation, followed by a written action plan you can actually use —
the scripts to say, the questions to ask, the documents to prepare, and the order to do them in. If
anything's still unclear once you start acting on it, you get seven days of async follow-up.

**Features:**
- Confidential 60-minute session
- Written summary of your next steps
- Full written action plan — scripts, questions to ask, documents to prepare, sequenced
- Async follow-up for 7 days after your session

**Who this is for:** The situation is serious enough that a conversation alone won't be enough. You want
a plan you can follow, not advice you have to remember correctly under pressure.

### Full Support — AED 1,200 · 60 minutes · Recommended

**Positioning statement:** Everything handled for you.

**Description:** Everything in Session + Plan, plus Karma drafts the documents and emails herself —
`[NEEDS DATA: confirm with the founder which document types she actually drafts today, e.g. a
resignation letter, a PIP response, a negotiation counter-offer email — Marcus flagged this and it's
still open. Don't ship invented examples.]` — so you're not staring at a blank page under pressure. You
also get fourteen days of async WhatsApp access while the situation is still moving, instead of seven.

**Features:**
- Everything in Session + Plan
- Done-for-you documents and email drafts — `[NEEDS DATA: exact document types]`
- 14 days of async WhatsApp access (vs. 7 days on Session + Plan)

**Who this is for:** A live, high-stakes situation — a PIP, an exit, a negotiation — where you want
someone drafting the actual words with you, not just telling you what to write.

**The 950→1,200 justification line (place directly under Full Support's column in the comparison
table):** Everything in Session + Plan, plus we draft the documents and stay reachable for two weeks
while you act on them.

**One more line for the comparison table itself, above the price row:** The extra AED 250 buys two
things Session + Plan doesn't — Karma writing the documents herself, and twice as many days of WhatsApp
access while you use them.

### Upgrade-credit note (do not ship without this decision)

Marcus flagged this as the single highest-leverage lever against Good cannibalizing Best, and it's an
operations call, not a copy one: `[NEEDS DATA: does the founder intend Good's AED 400 to credit toward
Better/Best if a client upgrades within some window? If yes, it needs to be a stated page promise, not a
surprise on the call.]` If the answer is yes, add one line under Good: *"Upgrade to Session + Plan or
Full Support within [window] and the AED 400 comes off the price."* Do not write that sentence until the
window and the yes/no are confirmed.

---

## B. `/services` section copy

### Hero (replaces the current hero paragraph — H1 stays as-is, it has no honesty problem)

**H1 (unchanged):** Expert HR advisory, on your terms

**New paragraph** (the current one says "Pay securely, then book" — same pay-first framing the booking
flow is being corrected for, so it needs the same fix):

> From a quick async document review to an executive retainer, choose the level of support that fits
> your situation. See real availability before you pay, then book privately through Stripe.

### Confidentiality Promise — move up (per Marcus's section 1, item 2)

No new copy needed — the existing block (`app/services/page.tsx:76-103`) is strong as written. Move it
to sit directly after the hero and before the tier comparison table, so it answers "will my employer find
out" before a visitor is asked to compare prices.

### The ladder intro (sits directly above the tier comparison table)

**Eyebrow:** Core Advisory

**H2:** One conversation, or a plan you can act on

**Intro paragraph:** Three ways to work with Karma directly. All confidential, all delivered by the same
advisor from first call to last message. Start with the level your situation actually needs, not
automatically the smallest one.

### Specialist Sessions intro

**Eyebrow:** Specialist Sessions

**H2:** Built for one specific need

**Intro paragraph:** Independent, one-off sessions you can book without stepping onto the core ladder —
each one built around a single, specific need rather than a general situation.

*(Per-service copy already exists in `lib/products.ts` and doesn't need rewriting — descriptions there
are already specific and honest. No changes recommended to Interview Prep, Dubai Job Search, Document
Review, or the Interview Prep Package beyond what's already shipped.)*

### Retainers intro

**Eyebrow:** Monthly Retainers

**H2:** For situations that don't resolve in one session

**Intro paragraph:** Ongoing monthly support for a workplace situation that's still active — more than
one live issue, a slow-moving exit, or a role senior enough that things keep coming up. Cancel anytime;
nothing here locks you in past the month you're on.

*(That last sentence is a positioning claim about cancellation terms — confirm it's accurate against
Stripe's subscription config before shipping. If retainers auto-renew with no stated cancel window
anywhere in the UI today, either add one or drop the sentence. `[NEEDS DATA: confirmed cancellation terms
for the three retainer subscriptions]`.)*

### FAQ-style objection block (new section, sits near the comparison table per Marcus's map — not a
replacement for the existing `/faq` page, which stays as the fuller reference)

**"Will my employer find out I'm looking at this?"**
No. Humanly never contacts your employer, and nothing you share connects to any company system. The
Confidentiality Promise above is the whole practice, not a marketing line.

**"Is this a lawyer? Do I need one instead?"**
No. Humanly gives HR guidance and coaching, not legal advice. If your situation needs a lawyer, part of
what you get from a session is knowing that sooner rather than later, and better questions to bring to
one.

**"I don't know if my problem needs more than a quick answer."**
That's exactly what The Session is for — one specific question, thirty minutes, and a clear read on
whether it stops there or needs more.

**"What do I actually get for AED 250 less than Full Support?"**
Session + Plan gives you the full written action plan. Full Support adds two things: Karma drafting the
documents herself, and twice as many days of WhatsApp access afterward. Everything else is identical.

**"Is 'done-for-you' real, or just advice with a label on it?"**
`[NEEDS DATA — cannot ship this answer until the document-type list above is confirmed. Placeholder:]`
"Full Support includes Karma drafting the actual documents — [document types] — not just telling you
what to write."

**"AED 1,200 is a lot for a conversation."**
It's less than a first meeting with an employment lawyer typically costs, and it's built to save you from
needing one. See the comparison table below.

**"What if I pay and it doesn't help?"**
Cancellations 24 hours or more before your session get a full refund; inside 24 hours, 50%. No-shows
don't get refunded but you can reschedule once at no cost. *(This is the real, already-published policy
at `/faq` — reuse verbatim, don't paraphrase it into something looser.)* This is a cancellation policy,
not a satisfaction guarantee — `[NEEDS DATA: does Humanly offer any outcome/satisfaction guarantee beyond
the cancellation refund above? If not, don't imply one — the honest answer is what's here.]`

---

## C. Booking flow copy rewrite

The honesty constraint governing every line in this section: **the pre-payment calendar is a preview,
never a hold.** A slot shown can be taken by someone else before payment completes. No string below uses
"book," "reserve," "hold," or "lock in" for anything that happens before Stripe confirms payment.

### `app/booking/page.tsx:20-27`

**Current (wrong — implies payment must come first with nothing shown beforehand):**
> H1: "Pay securely, then book your **private session**"
> Paragraph: "Choose the level of support that fits your situation. After successful payment, Stripe
> redirects you to the scheduling page."

**Replace with:**

```
H1: See real times, then book your <span>private session</span>
Paragraph: Choose the level of support that fits your situation, see real times open this
week, then complete payment securely through Stripe to confirm your exact slot.
```

(`<span>` keeps the existing underline-scribble treatment on "private session" — no structural change
needed in the component, only the text.)

### `lib/pageMeta.ts:47-51` — `/booking` meta description

**Current:** "Book a private Humanly consultation. Pay securely through Stripe first, then choose a
confidential Cal.com session time."

**Replace with:** "Book a private Humanly consultation. See real availability, then pay securely through
Stripe to confirm your confidential session time."

(Title unchanged — "Book a Confidential HR Consultation" has no honesty problem.)

### `components/booking/BookingFunnel.tsx` — step 2 description, ~lines 255-261

Once Marcus's new "pick a preferred time" step is inserted, today's step 2 ("Private intake") becomes
step 3. Its description needs to acknowledge the visitor already saw availability, not describe payment
as the first thing that happens:

**Current (`needsScheduling` true):** "Payment happens first through Stripe. Scheduling unlocks only
after a successful payment."

**Replace with:** "You picked a preferred time on the last step. Complete this intake and pay securely —
we'll confirm your exact slot on the next screen."

**Current (`needsScheduling` false — document review, no scheduling step exists for this product, so
this line has no honesty problem and does not need to change):** "Payment happens first through Stripe.
This service is delivered by email — there is no call to schedule." — **leave as-is.**

### `components/booking/BookingFunnel.tsx` — trust chip, ~lines 322-329

**Current:** "Scheduling unlocks after payment"

**Replace with:** "Exact time confirmed after payment"

(Keeps the chip's terse three-to-four-word pattern matching its neighbors, "Stripe handles payment" and
"No employer notification" — no other chip text changes.)

### `components/booking/PaidScheduler.tsx` ~line 64

This screen now has three possible states depending on whether the visitor set a preferred slot earlier
and whether it's still open. Copy for each — the conditional logic is Mira/Luke's to wire:

**No preferred slot was set (unchanged path — this is still accurate):**
> "Payment confirmed. Choose your time."

**A preferred slot was set and is still open** *(depends on whether the embed supports a
date-pre-highlight — Marcus flagged this as `[UNVERIFIED: whether @calcom/embed-react ^1.5.3 supports a
date-preselect config key]`; don't ship this copy until that's confirmed possible)*:
> "Payment confirmed. Your preferred time is highlighted below."

**A preferred slot was set but is no longer open:**
> "Payment confirmed. Your preferred time isn't available anymore — pick the closest one below."

---

## D. Availability grid copy (new component, appears on `/services` and in `/booking` step 2)

Marcus's one hard copy rule for this component, to be used **verbatim, every time a slot chip renders,
both places it appears:**

> This is a preference, not a booking — we confirm your exact time after payment, on the next screen.

### `/services` strip (sits directly under the tier comparison table)

**Heading:** Real times, open this week

**Helper text:** These are live openings on Karma's calendar. Tap one that works for you — [honesty
sentence above, verbatim].

**Chip label (per slot):** Prefer this time →

**Below the chips, hand-off CTA:** See full availability during booking →

### `/booking` step 2 (between "Choose your support" and "Private intake")

**Step heading (matches the existing "1. Choose your support" pattern):** 2. Pick a preferred time

**Helper text:** [honesty sentence above, verbatim].

**Chip label:** Prefer this time →

**Continue CTA (moves to step 3):** Continue to your private intake →

### Empty state (API returns zero slots)

Nothing open in the next few days on this calendar right now. That's fine — pick your tier and continue;
you'll choose from full live availability right after payment.

### Error state (availability fetch fails)

We couldn't load live availability just now. Continue to payment and you'll pick your exact time on the
next screen.

*(Both empty and error states are deliberately low-friction — the CRO spec is explicit that this grid is
a conversion aid, not a gate, and Cal's own post-payment embed is the real, unbreakable fallback either
way.)*

---

## E. Pre-existing currency-label defect — quick fix, independent of everything above

Marcus flagged `components/services/ServicesCatalog.tsx:105` as wrong on both counts today: it hardcodes
USD as the reference currency and claims "charged in USD" when `app/api/checkout/consultation/route.ts:61`
actually sets `chargeCurrency = "aed"`. This is a live factual error on the pricing page and should ship
regardless of whether the ladder or availability-grid work lands first.

**Current:** `≈ {formatUsd(service.amount)} · charged in USD`

**Replace with:** `≈ {formatUsd(service.amount)} · reference only, charged in AED`

---

## F. Testimonials — headline, subtitle, and the first real review

### Headline replacement (`components/home/HomeContent.tsx:802` and `:815`)

The current headline and subtitle ("No fake reviews. Trust starts cleaner than that." /
"Humanly is early-stage, so this focuses on founder expertise, process transparency, and future verified
testimonial slots.") become false the moment a real review ships and must change in the same release —
they explicitly promise no reviews exist yet.

**New headline:** Verified clients. Nothing published without consent.

**New subtitle:** Every story here is real, and stays offline until the person in it says it's ready to
be shared.

This keeps the part of the original promise worth keeping — nothing goes up without consent — without
claiming there's nothing to show yet.

### The first testimonial

Written up in `lib/testimonials.ts` (new file, path below). Full detail on the consent gate and the
missing attribution fields is in that file's header comment — read it before touching this section.

**Proposed pull-quote** (verbatim excerpt, for compact placements — full quote is long for a card):

> "Her timely response and immediate attention were amazing. She gave me the clarity I needed and pointed
> out the things I was missing, and advised me how to professionally and respectfully stand my ground."

---

## NEEDS DATA — everything this deck could not resolve on its own

1. Which specific document types Full Support actually drafts (resignation letter, PIP response,
   negotiation counter-offer email, or others) — needed to finish the Full Support description, the
   comparison-table "done-for-you" row, and the matching FAQ answer. Confirm with the founder.
2. Whether The Session's AED 400 credits toward Session + Plan / Full Support on upgrade within some
   window — an operations decision that changes a stated page promise, not a copy choice.
3. Whether Humanly offers any outcome/satisfaction guarantee beyond the existing cancellation-refund
   policy at `app/faq/page.tsx:34`. If not, the FAQ answer above (which says exactly that) is final.
4. Confirmed cancellation/renewal terms for the three retainer subscriptions, to verify the "cancel
   anytime" line in the Retainers intro before it ships.
5. Whether `@calcom/embed-react` (^1.5.3) supports a date-preselect config key — gates whether the
   "your preferred time is highlighted" copy variant on `PaidScheduler.tsx` can ship at all.
6. The real client's role, location, and a publish date for the first testimonial — and written consent
   to publish it. See `lib/testimonials.ts` header comment. Nothing in that file may render until this
   is resolved.
7. `clients/humanly/context.md`, `guardrails.md`, and `brand-voice.md` do not exist. This deck was
   written from the repo and `DESIGN.md` instead. Recommend the operator create at least
   `guardrails.md` before more claims-adjacent copy (legal-advice boundary, refund/guarantee language)
   gets written by anyone else — it's the one file that would have caught item 3 as a standing question
   rather than something I had to flag fresh here.

## NEXT

Ruth reviews this deck (SHIP / FIX / REWRITE) before Mira implements any string in it — nothing here is
client-facing-ready on my say-so alone.
