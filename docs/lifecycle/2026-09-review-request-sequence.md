# Review-request sequence — September 2026

Owner: Imogen (lifecycle). Pipeline built by Luke per `docs/adr/0001-pricing-currency-availability-reviews.md`
(Decision D) — `lib/reviews.ts`, `app/api/cron/review-requests/route.ts`,
`lib/db/repository.ts` (`getBookingsEligibleForReviewRequest`, `setTestimonialStatus`,
`listTestimonials`, `getPublishedTestimonials`) are all contract-only (`throw new Error("not
implemented")`) as of this write-up. This document is the spec those implementations should be
checked against, not a description of shipped behaviour.

**Client context note:** no `clients/humanly/context.md` or `guardrails.md` exists in
`~/qognition-ops` for this engagement — this repo (`talkhumanly.com`'s own `CLAUDE.md`,
`DESIGN.md`, ADR-0001, and the existing four `lib/email/resend.tsx` senders) is the only source of
client fact and constraint available, and this doc is built from that. `[NEEDS DATA: a formal
clients/humanly/context.md + guardrails.md for future lifecycle work — this doc proceeds without
a stated consent basis / sending-limit policy from the client directly; see "Suppression and
consent" below for where that gap bites.]`

---

## 1. Timing

The existing cron contract (`getBookingsEligibleForReviewRequest`'s docstring, ADR-0001 Decision D)
fires a single fixed window — `end_time between now() - 4 days and now() - 3 days` — against
**every** `accepted` booking, with no branch by product. That's correct for five of Humanly's ten
live products and wrong for the other five. It needs to branch by category before it ships.

**Core and specialist one-off sessions** (`the-session`, `session-plus-plan`, `interview-prep`,
`dubai-job-search`, `interview-prep-package`) — **keep T+3–4 days.** The engagement is genuinely
over when the call ends: no async access window, no open thread. Three days is late enough that
the person has had a couple of days to act on what came out of the session (so they're rating the
outcome, not just the conversation), and early enough that the specifics are still fresh. This
matches the existing pattern elsewhere in the codebase of not asking for anything the moment a
transaction completes (e.g. `sendPaymentReceipt` is immediate but doesn't ask for anything).

**Full Support** (`full-support`) — **do not use T+3.** This tier ships with 14 days of async
WhatsApp access after the session (`lib/products.ts`, `full-support.features`). A review request
landing on day 3 arrives while the advisor relationship is still open — it reads as "rate me while
I'm still working your case," which is presumptuous, and it risks contaminating the review itself
(a rating given mid-engagement isn't a rating of the finished experience). **Recommendation: trigger
Full Support off `end_time + 17 days`** — the 14-day WhatsApp window, plus the same 3-day buffer
used everywhere else, applied *after* the window closes rather than after the call. Window:
`end_time between now() - 18 days and now() - 17 days`.

**Retainers** (`essential-retainer`, `career-transition-retainer`, `executive-retainer`, all
`mode: "subscription"`) — **exclude from the automated cron entirely in v1.** These have no natural
end — a client on `career-transition-retainer` books 3 sessions a month for as long as the
subscription runs, so "session ended 3 days ago" is true every few days for months. There is no
`cancelled_at` or subscription-status field anywhere in `lib/db/schema.ts` to detect when the
relationship actually wraps, so the two honest options are (a) ask mid-engagement, repeatedly,
which is the exact failure this brief was written to avoid, or (b) don't ask automatically at all
and let Karma ask by hand at a real wrap moment (a client says they're moving on, or a subscription
lapses). Recommend (b) for v1. Building (a) properly — subscription-lifecycle tracking off Stripe's
subscription events — is a real feature, not a one-line fix, and isn't in scope here.
`[NEEDS DATA: whether Karma wants a manual, relationship-managed review ask for retainer clients
at all, and if so what trigger she'd use.]`

**Concrete change needed to the eligibility query:** `getBookingsEligibleForReviewRequest()`'s
current signature doesn't select `product_slug` at all (only `cal_booking_uid`, `order_id`,
`attendee_name`, `attendee_email`, `end_time`), so there is nothing to branch on today. It needs to
join `bookings.order_id → orders.id` and return `product_slug`, then either (a) run two SQL windows
— one for the standard 3–4 day cohort, one for the 17–18 day Full Support cohort, both excluding
retainer product slugs — or (b) select a wider SQL prefilter (`end_time` in the last 18 days,
`status = 'accepted'`) and apply the per-product offset in TypeScript using `getServiceProduct(product_slug).category`
/`.slug` from `lib/products.ts`, which is the single source of truth for that classification and
shouldn't be duplicated in SQL. Recommend (b) — it means category logic lives in exactly one file.

**Known gap, flagged not solved here:** `document-review` (specialist, async, `needsScheduling:
false`) never creates a `bookings` row — there's no Cal.com booking, so there's no `end_time` for
the cron to key off. Under the current architecture, document-review clients can never receive an
automated review request. That's worth a deliberate decision (e.g. trigger off `orders.paid_at + N
days` instead for async products), not a silent gap. `[NEEDS DATA/DECISION: does Karma want a
review ask for async document-review clients, and if so what should trigger it since there's no
booking end_time to use?]`

---

## 2. Reminder policy: **none.**

No follow-up send. This is a deliberate call, not an oversight.

A reminder email's entire content is "we noticed you didn't respond" — however softened, that is
precisely the thing the brief rules out: it implies the advisor (or the practice) is waiting on
them. For an audience that came to Humanly during a PIP, an exit, a burnout, or a rights question,
a second unprompted email about the same thing is more likely to read as pressure or as an
unwelcome reminder of the situation than as a helpful nudge — and there is currently no
unsubscribe mechanism (see §3) that would let someone cleanly opt out of that second touch before
it lands. Sending one email that's genuinely ignorable, once, respects the "light and easy to
ignore" brief; sending two turns "easy to ignore" into "they clearly want a response."

If Karma wants to revisit this later, the trigger conditions worth naming now: (1) unsubscribe/
suppression infrastructure exists (§3) so a client can opt out ahead of a second touch, not just
tolerate it, and (2) she has actual response-rate data from the single-send version showing it's
too low to be worth having built the pipeline at all. Absent both, ship single-send only.

---

## 3. Suppression and consent

**Never send to:**
- A booking whose `status` isn't `'accepted'` at cron run time — already the query's stated
  contract, but flagged as `[UNVERIFIED]` in ADR-0001 Decision D: it depends on Cal.com's webhook
  reliably flipping `status` on cancellation, which this repo's single-event-type webhook handler
  hasn't been confirmed to do. **This must be verified before the cron ships** — an unverified
  cancellation path means a client whose session never happened could get a review request for it.
- Any retainer-category booking (§1) — excluded from the query in v1.
- Any Full Support booking before `end_time + 17 days` (§1) — not fully suppressed, just delayed
  past the live-engagement window.
- A booking with no `attendee_email` — already in Luke's cron docstring (skip silently, don't error
  the batch).
- Anyone who already has an `email_events` row for `kind = 'review_request'` — the existing dedup
  contract keys this off `recipient = attendee_email`, i.e. **per email address, not per booking**.
  Keep it that way: it's the only thing today stopping a returning client (a second `the-session`
  purchase, say) from getting a review request after every single visit.
- **Recommend adding:** a join to `orders.status = 'paid'`. `bookings.order_id` is nullable and
  nothing in the schema guarantees every Cal.com booking traces back to a completed Stripe order
  (e.g. a test booking, or a booking Cal.com records before/without the linked order settling) —
  the review pipeline shouldn't solicit feedback on something nobody actually paid for.
  `[UNVERIFIED: whether an order-less or unpaid-order booking can exist in production today —
  worth confirming against real data before deciding whether this join is load-bearing or
  defensive.]`

**Consent basis:** the practical basis available in this codebase is "existing customer
relationship" — the person paid for and attended a session, and the email address is the one they
gave Humanly at checkout for exactly this kind of service correspondence. That's a reasonable
basis for one relevant post-service email. It is not a substitute for the client's own written
consent-basis decision, particularly given the site's global-first positioning (UAE/GCC and North
America named explicitly, but the practice takes clients "worldwide" per `siteConfig.description`)
— a review solicitation is commonly treated as commercial/promotional mail under CAN-SPAM and
similar regimes even when it's tied to a real purchase, which is a different bar than the four
existing transactional sends in `resend.tsx` clear automatically. `[NEEDS DATA: client confirmation
of consent basis and any jurisdiction-specific handling — no guardrails.md exists to check this
against today.]`

**Unsubscribe mechanism — what exists, what doesn't:**

Nothing exists today. There is no preference table, no suppression list, no one-click unsubscribe
endpoint, and no `List-Unsubscribe` header on any of the four existing sends in
`lib/email/resend.tsx`. That's tolerable for pure transactional mail (a payment receipt isn't
solicitation) and not tolerable for this one on its own — a review request is the first email this
codebase sends that isn't completing a transaction the recipient just initiated.

**What can ship now, without new infrastructure:** a plain-text line in the footer inviting a reply
("reply to this email and we won't ask again") honoured by hand — Humanly is a single-practitioner
inbox at low volume, so manual honouring is a real, if unscalable, option for launch. Combined with
the no-reminder policy (§2), this caps worst-case exposure at one email per person, ever, with a
working (if manual) way to stop it.

**What needs building before this scales past "single practitioner checks her own inbox":**
- `[NEEDS SETUP]` A minimal suppression table (`email_suppressions`: recipient, reason, created_at)
  checked by `getBookingsEligibleForReviewRequest` (or by `sendReviewRequest` itself) before every
  send — general-purpose enough to protect any future non-transactional send from this codebase,
  not just this one.
- `[NEEDS SETUP]` A real one-click unsubscribe endpoint plus `List-Unsubscribe` /
  `List-Unsubscribe-Post` headers on the Resend `.send()` call — both a deliverability signal
  (mailbox providers weight one-click unsubscribe heavily) and the CAN-SPAM/CASL-safer mechanism
  versus reply-to-opt-out.

---

## 4. Deliverability

`hello@talkhumanly.com` currently carries four transactional streams — booking confirmation,
payment receipt, resource delivery, and internal lead notification — all sends the recipient is
actively expecting because they just completed the action that triggered them. A review request is
a different kind of mail: unprompted (from the recipient's point of view, days after they last
thought about Humanly), asking something of them rather than confirming something they did. It is
statistically far more likely to be marked as spam or simply ignored than a receipt is, and every
complaint against that address counts against **the same domain reputation** the payment receipt
and booking confirmation depend on to land in the inbox, not the promotions tab or junk.

**Recommendation:** don't send review requests from the same sender identity as the transactional
stream. Two ways to do this, in order of preference:
1. `[NEEDS SETUP]` A dedicated subdomain (e.g. `updates.talkhumanly.com` or `mail.talkhumanly.com`)
   verified in Resend with its own SPF/DKIM, so a reputation hit on the review-request stream can't
   touch the domain the payment receipt sends from. This is the standard fix for exactly this
   problem and is worth doing before volume grows, not after a complaint spike.
2. If a subdomain isn't feasible for launch: keep `hello@talkhumanly.com` but treat this stream as
   the one to watch first. `[NEEDS SETUP]` Resend webhook events (`email.bounced`,
   `email.complained`) aren't wired into this app at all today (`app/api/webhooks/` has only
   `stripe/` and `cal/`) — without them there is no automated signal if this stream starts hurting
   reputation. At minimum, add a feature-flag env var (e.g. `REVIEW_REQUEST_ENABLED`) the cron
   checks before sending, so the send can be paused without a deploy the moment something looks
   wrong, even before proper bounce/complaint webhooks exist.

`[NEEDS SETUP]` `List-Unsubscribe` header (see §3) — also a deliverability lever, not just a
compliance one.

`[NEEDS DATA: current sending-domain reputation / complaint rate from Resend's dashboard — not
available from this codebase, and volume here is low enough that a small number of complaints could
move the percentage meaningfully.]`

---

## 5. Measurement

**Already available, no new instrumentation:**
- `email_events` (`kind = 'review_request'`) — sent / error / skipped-missing-key counts, exactly
  like the other four senders. This is the send-side funnel.
- `testimonials`, once `listTestimonials`/`getPublishedTestimonials` are implemented — rating
  distribution **across every submission regardless of `status`**, not just published ones. This
  matters specifically because gating is disallowed: Karma's honest satisfaction signal is the full
  distribution in `testimonials.rating`, not the distribution of what's public. Query it separately
  from the public-facing `getPublishedTestimonials` call.

**Needs two new `funnel_events` on the review page/form (Mira's build, not this doc's to spec in
full, but naming what to fire):**
- `review_page_view` — fired when `/review/[token]` loads successfully (i.e. token verified), with
  `product_slug` if resolvable from the booking, so response rate can be cut by service later.
- `review_submitted` — fired on form POST, `metadata` carrying the consent choice (not the free
  text — that lives in `testimonials`, no need to duplicate it into an events table).

From those two: **response rate** = `review_submitted` count ÷ `email_events` sent count for the
matching period, and **consent split** (published vs. private) straight out of `review_submitted`'s
metadata.

**Not available without new work:** open rate, click rate, and bounce/complaint rate — none of
Resend's engagement webhooks are wired into this app (confirmed: `app/api/webhooks/` has only
`stripe/` and `cal/`). `[NEEDS SETUP: app/api/webhooks/resend/route.ts subscribed to
email.opened/email.clicked/email.bounced/email.complained, matching the existing webhook pattern —
needed for §4's deliverability monitoring as much as for this section's measurement.]` Until that
exists, response rate (§5, click-through-to-submission) is the only funnel signal this system can
report; do not estimate an open or click rate in the interim.

---

## 6. The consent question — exact wording

Every submission collects a rating (1–5, required) and free text (optional) regardless of what's
chosen here — **there is no branch by rating.** The choice below governs only whether the response
can be published, never whether it's collected.

**Display-consent choice, exactly two options, both required-to-pick (no default, no pre-selection):**

> **Can we publish this?**
> We only publish reviews people say yes to. If you'd rather this stayed between us, it does.
>
> - **Yes, you can publish this — with my role and location, never my name.**
> - **No, keep this between us.**

This is a binary, not a three-way choice, because the site's own promise (per
`components/reviews/TestimonialsCarousel.tsx` copy — *"we don't publish reviews until they are
consented and verified"* — and attribution shown as role + location only) already defines what
"published" looks like: anonymous by default, role and location only, name never shown. There is no
third "publish with my name" tier to offer, because the site doesn't do that for anyone. Adding one
here would be a promise the product doesn't keep.

The single free-text field ("Anything you'd like to add?") is what satisfies the churn/unhappy-
client concern in the brief, without a second form or a second path: it's shown to every
respondent regardless of star rating, its destiny (published quote vs. internal-only) is set purely
by the consent choice above, and a 1-star response with "keep this between us" selected reaches
Karma exactly as directly as a 5-star one that consents to publish — nothing about how the form
behaves changes based on the number picked. That is what makes this compliant with the no-gating
constraint: every rating is requested, every rating is accepted, and the only fork in the road is
the one the respondent themselves picks for their own words.

**Flagging a real gap this surfaces, not this doc's to fix:** `setTestimonialStatus`'s documented
invariant is that setting `status: "approved"` *always* also sets `published = true` — with no
check against `consent_display` anywhere in that function's contract (`lib/db/repository.ts`). As
specified, an admin approving a submission in the dashboard would publish it even if the client
picked "keep this between us." **This needs a hard guard before the moderation dashboard ships** —
either `setTestimonialStatus("approved", ...)` refuses when `consent_display` indicates the private
option, or the dashboard UI never offers "approve" as an action on a private-consent row. This is
the one place in this whole pipeline where a genuine promise-breaking bug is one missed `if`
statement away, and it should gate Owen's review of that code, not ship on trust.

---

## `[NEEDS DATA]` / `[NEEDS SETUP]` — consolidated

- `[NEEDS DATA]` No `clients/humanly/context.md` / `guardrails.md` exists in `~/qognition-ops` —
  this doc used the repo itself as the only available source of client fact/constraint.
- `[UNVERIFIED]` Whether Cal.com's webhook reliably flips `bookings.status` away from `'accepted'`
  on cancellation (ADR-0001's own flag, repeated here because it directly gates suppression
  correctness — §3).
- `[NEEDS DATA/DECISION]` Whether retainer clients get a manual, relationship-managed review ask,
  and what would trigger it (§1).
- `[NEEDS DATA/DECISION]` Whether async `document-review` clients should get a review request at
  all, given there's no booking `end_time` to key off today (§1).
- `[UNVERIFIED]` Whether an order-less or unpaid-order `bookings` row can exist in production —
  informs whether the recommended `orders.status = 'paid'` join is load-bearing (§3).
- `[NEEDS DATA]` Client confirmation of consent basis / jurisdiction handling for this send, given
  the site's global-first positioning (§3).
- `[NEEDS SETUP]` `email_suppressions` table + a check against it before every review-request send
  (§3).
- `[NEEDS SETUP]` One-click unsubscribe endpoint + `List-Unsubscribe`/`List-Unsubscribe-Post`
  headers on the send (§3, §4).
- `[NEEDS SETUP]` Dedicated sending subdomain for non-transactional mail, separate from
  `hello@talkhumanly.com`'s transactional reputation (§4).
- `[NEEDS SETUP]` Resend bounce/complaint (and, if wanted, open/click) webhook —
  `app/api/webhooks/resend/route.ts` doesn't exist today (§4, §5).
- `[NEEDS SETUP]` `REVIEW_TOKEN_SECRET` and `CRON_SECRET` are placeholder (`"change-me"`) values in
  `.env.example` — need real secrets before this cron can run anywhere.
- `[NEEDS SETUP]` Cron scheduling mechanism itself — no `vercel.json` exists in this repo; ADR-0001
  flags that Jonas needs to confirm whether scheduling goes through a `vercel.json` `crons` array
  or the Vercel dashboard.
- **Gate-blocking, not a data gap:** `setTestimonialStatus`'s "approve implies publish" invariant
  has no check against `consent_display` — must be fixed before the moderation dashboard ships
  (§6).
