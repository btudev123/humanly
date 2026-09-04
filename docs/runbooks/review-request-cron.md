# Runbook — review-request cron (`/api/cron/review-requests`)

**Reader:** whoever is holding the pager for `talkhumanly.com`. Assume 3am. Every command below is
paste-ready; every step says what "good" looks like and what to do when it doesn't.

**Owner:** Karma (business) · platform on-call (technical).
**Severity ceiling:** this pipeline sends *review-request emails*. It is **not** on the money path
(Stripe checkout), the booking path (Cal.com), or the site's rendering path. **Nothing in this
runbook is worth waking someone up for.** If it is broken at 03:00, note it and fix it at 09:00.
The one exception is §7.1 — a batch that sends *wrong* email (a review request for a session that
did not happen) is a client-trust problem, and that one gets escalated to Karma the same day.

---

## 0. At a glance

| | |
| --- | --- |
| Route | `app/api/cron/review-requests/route.ts` — `GET /api/cron/review-requests`, `runtime = "nodejs"` |
| Schedule | `0 16 * * *` (daily, 16:00 **UTC** — Vercel cron is always UTC) |
| Declared in | `vercel.json` → `crons[0]`. Nothing in the Vercel dashboard; the file is the source of truth |
| Auth | `Authorization: Bearer ${CRON_SECRET}`, sent automatically by Vercel when the `CRON_SECRET` env var exists on the project |
| Runs on | **Production deployments only.** Vercel does not invoke cron on Preview deployments |
| Success response | `200` with `{"sent":N,"skipped":N,"failed":N}` |
| Spec | `docs/adr/0001-...md` Decision D (schema + token) · `docs/lifecycle/2026-09-review-request-sequence.md` (timing, consent, suppression) |
| Migration | `lib/db/migrations.sql` lines **124–256** (to end of file). **Not yet applied to production** as of 2026-09-03 |

### Why 16:00 UTC

Vercel cron schedules are interpreted in UTC only
(<https://vercel.com/docs/cron-jobs> — "The timezone is always UTC"), so the hour is a fixed choice
about where the email lands in the recipient's day.

- **16:00 UTC = 20:00 Gulf Standard Time, year-round** (the UAE observes no DST) and
  **11:00 EST / 12:00 EDT, 08:00 PST / 09:00 PDT** in North America. Every one of Humanly's two
  named regions gets this in waking hours; nobody gets it at 03:00 local. That matters directly for
  §4 of the lifecycle doc — this is the only non-transactional stream this codebase sends, from the
  *same* sending identity as the payment receipt and booking confirmation, so it is the stream most
  exposed to a spam complaint. Overnight delivery buries it under the morning flush and raises the
  odds it is dismissed as bulk mail.
- **20:00 Dubai is deliberately outside working hours.** Per lifecycle §3, these are employee-side
  clients dealing with a PIP, an exit, or a rights question *at their current employer*. A "how was
  your session with Humanly?" subject line arriving on a work device at 14:00 is a discretion
  problem that a 20:00 send does not have.
- **It keeps the eligibility-window boundary away from real session end times.** Lifecycle §1's
  window is age-based and exactly 24h wide (`end_time` between 3 and 4 days old; 17–18 days for
  `full-support`), evaluated against `now()` at run time. Karma's sessions run in Gulf working
  hours, i.e. roughly 05:00–15:00 UTC. Firing at 16:00 UTC puts every real `end_time` at least an
  hour clear of the window edge, so scheduling jitter or clock skew cannot drop a cohort at the
  boundary.

Changing the hour: edit `vercel.json` and redeploy. Vercel does not pick up a schedule change
without a new production deployment.

---

## 1. Preconditions — environment variables

Vercel dashboard → **Project `humanly` → Settings → Environment Variables**. Set these before the
first production deploy that contains `vercel.json`.

| Key | Production | Preview | Notes |
| --- | --- | --- | --- |
| `CRON_SECRET` | **Required** | Recommended | Random string, **≥ 16 characters**, and **no newlines or characters that cannot appear in an HTTP header** — a stray newline is a documented cause of silent cron failure. Vercel sends this back to us as `Authorization: Bearer <value>`. Preview never runs cron, but set it so a manual smoke test against a preview URL behaves the same as production |
| `REVIEW_TOKEN_SECRET` | **Required** | Recommended | HMAC key for `/review/<token>` links. **Rotating it invalidates every outstanding review link at once** — there is no dual-secret grace window (ADR-0001 Decision D). Do not rotate on a schedule; rotate only on a suspected compromise |
| `CAL_API_KEY` | Required for the availability preview, **not** for this cron | Optional | Already present locally. See §8 for what happens without it |
| `RESEND_API_KEY` | **Required** | — | Already set in production for the four existing senders. **If it is missing when the cron runs, that run permanently suppresses every booking it touched — see §7.2** |
| `DATABASE_URL` | **Required** | — | Already set |

Local state as audited on 2026-09-03 (values not read, only presence):

| Key | `.env.example` | `.env.local` |
| --- | --- | --- |
| `CRON_SECRET` | placeholder `"change-me"` | **absent entirely** |
| `REVIEW_TOKEN_SECRET` | placeholder `"change-me"` | **absent entirely** |
| `CAL_API_KEY` | placeholder | set |

Generate secrets (never paste them into a ticket, a PR, a log, or this file):

```bash
openssl rand -base64 32
```

Nothing in this repo requires the two new secrets to match any external system, so they can be
generated fresh and independently for each environment.

---

## 2. Apply the migration

ADR-0001's "Shared migration/rollback sequencing" says D's schema goes **first and alone**. Do not
run the whole of `lib/db/migrations.sql`; run only lines 124–256 (i.e. to the end of the file).

### 2.0 Read the rollback before you run the migration

The down-migration is §6. Read it now. It is a `drop column` — once the cron has been live and
clients have submitted reviews, running it **destroys submitted review data**, which the ADR's
"safe at any time" note does not say out loud. Rollback is only truly free *before* the first
review is submitted.

### 2.1 Connect

```bash
cd /Users/qognitionagency/dev/humanly   # canonical checkout; the ~/Documents copy is abandoned
export DATABASE_URL="$(grep -E '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')"
psql "$DATABASE_URL" -c 'select current_database(), now();'
```

Expected: one row, the Neon database name and current time.
Never `echo $DATABASE_URL`. If you would rather the connection string never touch a command line
at all, use the **Neon Console → SQL Editor** for every SQL block in this runbook instead — the
statements are identical.

### 2.2 Back up `testimonials`, and verify the backup

```bash
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
psql "$DATABASE_URL" -tAc 'select count(*) from testimonials;' | tee /tmp/testimonials-precount-$STAMP.txt
pg_dump "$DATABASE_URL" --data-only --column-inserts -t testimonials \
  -f /tmp/testimonials-backup-$STAMP.sql
grep -c '^INSERT INTO' /tmp/testimonials-backup-$STAMP.sql
```

**The last two numbers must be equal.** If they differ, or `pg_dump` errored, **stop** — you do not
have a verified backup and you do not run the migration. (`pg_dump` must be a v16+ client against
Neon; `brew install libpq` if it is missing.)

Optional extra net: Neon Console → **Branches → New branch from `main`, "Include data up to now"**.
An instant point-in-time copy of the whole database. `[UNVERIFIED: exact Neon console wording — not
checked in this session. The `pg_dump` above is the verified path.]`

### 2.3 Record the pre-migration publish state

This is the step that is easy to skip and expensive to skip. See §2.5.

```bash
psql "$DATABASE_URL" -c "select published, count(*) from testimonials group by published;"
```

Write the numbers down.

### 2.4 Run it

```bash
sed -n '124,256p' lib/db/migrations.sql > /tmp/migrate-d.sql
cat /tmp/migrate-d.sql          # eyeball it: the alter table, the dedup, two indexes,
                                # the do $backfill$ block, and the bookings lower(status) update
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f /tmp/migrate-d.sql
```

Expected output, in order: `ALTER TABLE`, `CREATE INDEX`, `UPDATE 0` (or higher if there
were duplicate `cal_booking_uid` rows), `CREATE INDEX`, `DO`, then `UPDATE <n>` for the
`bookings` case normalisation. Six lines, not two. Anything *else* — an `ERROR` — is the
stop condition; the five extra success lines are expected and are not a reason to abort.
The statements are `add column if not exists` / `create index if not exists`, so re-running is
safe and prints the same thing.

If it errors: nothing was applied (`-1` wraps it in a single transaction). Capture the error text
and stop.

### 2.5 Reconcile `status` against `published` — **do not skip**

`status varchar(40) not null default 'pending'` backfills **every existing row** with `'pending'`.
`getPublishedTestimonials()` (`lib/db/repository.ts`) reads
`where status = 'approved' and published = true`. So the moment Luke's repository code deploys,
**every testimonial that is on the site today disappears from it** — silently, with no error
anywhere.

Check the damage:

```bash
psql "$DATABASE_URL" -c \
  "select count(*) from testimonials where published = true and status <> 'approved';"
```

`0` → nothing to do. Anything above `0` → those are the live testimonials that will vanish.

> **Note — this gate is now mostly historical.** `migrations.sql`'s `do $backfill$` block
> (added after this runbook was first written) performs this same backfill inside §2.4's
> transaction, so by the time you reach this section the check above will usually already return
> `0`. That means the migration takes this decision on its own; the statement below is only a
> manual fallback for rows the guarded block skipped. **If the check above returns anything above
> `0`, still get Karma's explicit yes before running it** — it decides which quotes are publicly
> visible.

```sql
update testimonials
   set status = 'approved'
 where published = true
   and status = 'pending';
```

Then re-run the check above; it must return `0`.

### 2.6 Verify the schema

```bash
psql "$DATABASE_URL" -c "\d testimonials"
```

Expected: the seven new columns (`rating`, `status`, `location`, `cal_booking_uid`,
`submitted_email`, `consent_display`, `submitted_at`) and the index `testimonials_status_idx`.

---

## 3. Deploy and confirm the schedule registered

Vercel creates the cron job at build time from `vercel.json`. **Production deployments only.**

Before deploying, confirm the schedule survives the build:

```bash
vercel build --prod
cat .vercel/output/config.json | grep -A4 '"crons"'
```

Expected: the `crons` array with `"path": "/api/cron/review-requests"` and
`"schedule": "0 16 * * *"`. If `crons` is absent, the cron will not exist no matter what the
deploy says.

After the production deploy: **Vercel dashboard → Project → Settings → Cron Jobs**. The job must be
listed and enabled. If it is not listed, the deployment that is currently serving production is not
the one that contained `vercel.json` — redeploy.

> **Instant Rollback does not un-schedule a cron.** If you roll production back to a deployment from
> before this change, the cron job keeps running on its schedule until you disable it manually in
> Settings → Cron Jobs.

---

## 4. Verify the cron fired

Three independent checks. Use them in this order.

**4.1 Vercel cron log.** Settings → Cron Jobs → **View Logs** on the job. This opens runtime logs
pre-filtered to `requestPath:/api/cron/review-requests`. Expect one invocation per day at ~16:00
UTC with status `200`.

Caveat from Vercel's docs: **an invocation that responds with a redirect or a cached response does
not appear in the logs at all.** Neither applies here — `proxy.ts`'s matcher is
`["/dashboard(.*)", "/api/dashboard(.*)"]`, so nothing rewrites or redirects `/api/cron/*`, and the
route reads `request.headers`, which makes it dynamic. But if logs are empty *and* the checks below
also show nothing, that is the first thing to re-verify.

**4.2 The database — the authoritative check.** The route's own response is not persisted anywhere,
so `email_events` is the record of what actually happened:

```bash
psql "$DATABASE_URL" -c \
  "select date_trunc('day', created_at) as day, status, count(*)
     from email_events
    where kind = 'review_request'
      and created_at > now() - interval '7 days'
    group by 1, 2
    order by 1 desc, 2;"
```

Expected statuses: `sent`, `error`, `skipped_missing_resend_key`.
**A day with no rows at all is not necessarily a failure** — it legitimately means no booking was
in its eligibility window that day, which at Humanly's volume is common. Cross-check against what
*should* have been eligible:

```bash
psql "$DATABASE_URL" -c \
  "select b.cal_booking_uid, o.product_slug, b.end_time
     from bookings b join orders o on o.id = b.order_id
    where b.status = 'accepted' and o.status = 'paid'
      and b.end_time between now() - interval '18 days' and now() - interval '3 days'
    order by b.end_time desc;"
```

This is the SQL prefilter only; the per-product day window (3–4 days, or 17–18 for `full-support`,
retainers excluded) is applied in TypeScript afterwards, so this query is deliberately wider than
the real eligible set. If it returns rows whose age is squarely 3–4 days and `email_events` has
nothing for them, the cron did not run or did not reach the send.

**4.3 Response shape.** See §5 — a manual invocation returns the counts directly.

---

## 5. Manual trigger / smoke test

> **There is no dry-run mode.** A successful manual invocation against production **sends real
> email to real clients**. `[Change request for Luke: a `?dryRun=1` query param that returns the
> eligible set without calling `sendReviewRequest` would make this runbook materially safer. Route
> code is out of scope for this document.]`

### 5.1 Safe checks — send nothing (do these first)

Prove the route is deployed and the guard works, without triggering a send:

```bash
curl -sS -i https://talkhumanly.com/api/cron/review-requests | head -1
```

| You see | Meaning |
| --- | --- |
| `HTTP/2 401` (body `{"error":"Unauthorized."}`) | **Correct.** Route deployed, `CRON_SECRET` set, guard working |
| `HTTP/2 500` (body `{"error":"CRON_SECRET is not configured."}`) | `CRON_SECRET` is missing in Production. Fix per §1, redeploy, retest |
| `HTTP/2 404` | Route not in the deployed build. Check the deployment actually contains `app/api/cron/review-requests/route.ts` |
| Any `3xx` | Something is redirecting the path. Cron does **not** follow redirects — the job would silently no-op. Investigate before proceeding |

### 5.2 Zero-impact live invocation

Run §4.2's eligibility query first. **If it returns no rows**, a real authenticated invocation sends
nothing and still proves the whole path end to end. That is the smoke test to prefer.

```bash
read -rs -p "CRON_SECRET: " CRON_SECRET; echo
curl -sS -i -H "Authorization: Bearer $CRON_SECRET" \
  https://talkhumanly.com/api/cron/review-requests
unset CRON_SECRET
```

Expected: `HTTP/2 200` and `{"sent":0,"skipped":0,"failed":0}`.
`read -rs` keeps the secret out of shell history and out of `ps`.

If the eligibility query **did** return rows and you run this anyway, those people receive email
immediately. That is a deliberate act — say so in the channel before you do it.

### 5.3 Local

```bash
npm run dev    # http://localhost:3001
curl -sS -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3001/api/cron/review-requests
```

Vercel has no local cron emulation (`vercel dev` / `next dev` are explicitly unsupported for cron);
hitting the endpoint by hand is the documented way to exercise it. **Note that a local run points at
whatever `DATABASE_URL` is in `.env.local` — if that is production, a local run sends production
email.** Check before you press enter.

---

## 6. Rollback

### 6.1 Un-schedule (no data change, do this first)

Fastest: Vercel dashboard → Settings → Cron Jobs → **Disable Cron Jobs**. Takes effect immediately,
no deploy. The job stays listed and still counts toward the plan's cron-job limit.

Durable: delete the `crons` entry from `vercel.json` (or delete the file — it contains nothing else)
and redeploy to production.

A rollback of the *deployment* alone does **not** stop the cron (§3).

### 6.2 Schema rollback — copied verbatim from ADR-0001 Decision D, "Rollback"

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

The ADR's accompanying note: safe at any time — nothing else in the schema references these columns
via FK (there are none), and no existing route reads them today.

**Two additions from this runbook, which the ADR does not state:**

1. That "safe at any time" holds only while the columns are empty. **After the first client
   submits a review, this drops their submission and their consent choice permanently.** Take a
   fresh `pg_dump` (§2.2) immediately before running it, whatever the ADR says.
2. If you ran §2.5's reconciliation `update`, this rollback does **not** reverse it. `published`
   was never modified, so the public site is unaffected — but if the migration is later reapplied,
   §2.5 must be re-evaluated from scratch.

### 6.3 Code rollback

Per the ADR: delete `app/api/cron/review-requests/route.ts` and `lib/reviews.ts`, revert the
`lib/db/repository.ts` additions (`getPublishedTestimonials`, `listTestimonials`,
`setTestimonialStatus`, `getBookingsEligibleForReviewRequest`) and the mirrored `lib/db/schema.ts`
columns. Plus, from this runbook: delete `vercel.json`, and confirm in Settings → Cron Jobs that the
job is gone after the deploy.

---

## 7. Failure modes

### 7.1 Review request sent for a session that did not happen — escalate

The eligibility query trusts `bookings.status = 'accepted'`. Whether Cal.com's webhook actually
flips that status on a cancellation is an **open `[UNVERIFIED]` flag** in both ADR-0001 Decision D
and lifecycle §3. If a client replies saying they were asked to review a call they cancelled:

1. Reply by hand and apologise. Same day.
2. Tell Karma.
3. Confirm the row: `select status from bookings where cal_booking_uid = '<uid>';`
4. If it still says `accepted` for a booking Cal.com shows as cancelled, the flag is confirmed
   real. Disable the cron (§6.1) and raise it as a code change for Luke — the webhook handler at
   `app/api/webhooks/cal/route.ts` has no `event.type` branch.

### 7.2 `RESEND_API_KEY` missing — silent permanent suppression

**Symptom:** `{"sent":0,"skipped":N,"failed":0}` with `N > 0`, and `email_events` rows with status
`skipped_missing_resend_key`. HTTP status is `200`. Nothing alerts.

**Why it is worse than it looks:** `sendReviewRequest` writes an `email_events` row with
`kind = 'review_request'` even when it skips. The dedup in `getBookingsEligibleForReviewRequest`
is `not exists (select 1 from email_events where kind = 'review_request' and recipient = ...)` —
**status-blind**. Those recipients are now suppressed forever; restoring the key does not bring
them back.

**Recovery** (after restoring `RESEND_API_KEY` in Production and redeploying):

```sql
-- Inspect first.
select id, recipient, created_at
  from email_events
 where kind = 'review_request'
   and status = 'skipped_missing_resend_key'
 order by created_at desc;

-- Then clear the poisoned dedup rows so the next run can pick these people up again.
delete from email_events
 where kind = 'review_request'
   and status = 'skipped_missing_resend_key';
```

Only rows whose booking is still inside its 3–4 day (or 17–18 day) window will actually be picked
up on the next run; anyone older than that has been missed for good. That is the cost of this
failure mode, and it is why §4.2's `email_events` check is worth running on the day after the first
production run rather than a week later.

`[Change request for Luke: make the dedup status-aware — `and e.status not like 'skipped%'` — so a
missing key delays a send instead of cancelling it.]`

### 7.3 `CRON_SECRET` missing → `500`, every day, silently

**Symptom:** every invocation returns `500` with `{"error":"CRON_SECRET is not configured."}`. No
email, no `email_events` rows. Vercel does **not** retry and does **not** notify.

**Detect:** §5.1's unauthenticated curl. `401` = healthy, `500` = this.
**Fix:** set `CRON_SECRET` in Production (§1) and **redeploy** — environment variable changes do not
apply to an already-built deployment.

### 7.4 Auth mismatch → `401`, every day, silently

Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically; the route compares the full header
against `Bearer ${process.env.CRON_SECRET}` in constant time. The two agree today. It breaks if:

- the value in Vercel contains a newline or a character illegal in an HTTP header — the documented
  cause of exactly this symptom;
- the Production and route-visible values diverge (e.g. set only on Preview);
- the value was rotated without a redeploy.

**Detect:** the cron log shows `401` daily, `email_events` is empty. **Fix:** re-set `CRON_SECRET`
as a single line with no trailing newline, redeploy, then re-run §5.1 and §5.2.

### 7.5 `REVIEW_TOKEN_SECRET` missing → whole batch counted `failed`

`buildReviewPath()` → `generateReviewToken()` → `getSecret()` throws
`"REVIEW_TOKEN_SECRET is required to generate or verify review tokens."`.

The throw happens **inside** the route's per-booking `try/catch`, so — contrary to how this is
sometimes described — the batch does *not* abort: every booking is caught and counted as `failed`.

**Symptom:** `{"sent":0,"skipped":0,"failed":N}`, HTTP `200`.
**Good news:** no `email_events` row is written on this path, so the dedup is **not** poisoned. Set
the variable, redeploy, and the next scheduled run picks up anyone still inside their window.
**Bad news:** the route swallows the error with a bare `catch {}`, so nothing in the logs says
*why*. `failed = N` with `sent = 0` and `skipped = 0` is the fingerprint.

`[Change request for Luke: log the caught error. A silent bare catch turns every per-booking failure
into the same undiagnosable number.]`

### 7.6 Missed run

Cron delivery is **best effort** — Vercel's own docs say a transient network error can mean the
function never executes, with no runtime log for that run. Because the eligibility window is exactly
24h wide and moves with `now()`, **a missed run means that day's cohort is never emailed at all.**
There is no catch-up.

Nothing to do operationally; the loss is one day of review requests. Recorded here so it is not
mistaken for a bug. `[Change request for Luke: widening the window and relying on the (fixed, see
7.2) `email_events` dedup for idempotency would make missed runs self-healing — which is exactly the
"reconciliation-based" design Vercel's cron docs recommend.]`

### 7.7 Duplicate invocation

Also documented as possible ("cron delivery can occasionally invoke the same scheduled run more than
once"). Harmless here: the `email_events` dedup means the second run finds nothing eligible. The one
genuine risk is two invocations overlapping mid-batch — at Humanly's volume the batch is seconds
long, so this is theoretical. No lock exists.

### 7.8 Timeout

Default function max duration is **300s** on every plan tier with fluid compute. The batch is
sequential: one Resend call per eligible booking. At current volume this is nowhere near the limit.
If `sent + skipped + failed` is ever far below the eligible count and the log shows a timeout, the
batch has outgrown a single invocation — that is a code change (batching/pagination), not a config
one. `vercel.json` deliberately sets no `maxDuration`, so the platform default applies.

---

## 8. `CAL_API_KEY` unset — confirmed safe

Not this cron's dependency, but adjacent and worth stating because it governs whether an environment
missing the key has a broken booking page. It does not:

- `lib/cal.ts` → `getAvailableSlots()` returns `[]` on a missing key, before any network call, and
  is documented fail-closed: it returns `[]` on *every* failure mode and never throws past its own
  boundary.
- `app/api/availability/route.ts` passes that through as `200 {"service":…,"available":false,
  "slots":[]}`. No 4xx, no 5xx.
- `components/booking/AvailabilityPreview.tsx` renders its "empty" state for a successful-but-empty
  response, reserving its "error" state for a failed fetch to our own route.

So without `CAL_API_KEY` the preview grid shows "no times" and the booking flow continues unchanged
— the real booking happens post-payment in `PaidScheduler`'s Cal.com embed, which does not use this
key at all. **Known limitation:** a Cal.com outage, an expired key, and a genuinely empty calendar
are indistinguishable to the UI by design. There is no alert that would tell you which one you are
looking at.

---

## 9. What this pipeline does not have

Listed so nobody assumes otherwise at 3am:

- **No alerting.** No page, no email, no Slack. Every failure mode above is silent. The daily
  `email_events` query in §4.2 is the only detection mechanism that exists.
  `[NEEDS SETUP: a weekly "review_request sent count vs. eligible count" check. Symptom-level, not
  cause-level — the question is "did anyone who should have been asked, not get asked".]`
- **No retry.** Vercel does not retry a failed cron invocation.
- **No suppression list and no unsubscribe.** Lifecycle §3: opt-outs are honoured **by hand** from
  Karma's inbox. If someone replies "stop", the only mechanism that stops a future send is the
  status-blind dedup — i.e. they will not be asked again anyway, because they have already been
  asked once and this pipeline never asks twice.
- **No bounce/complaint visibility.** `app/api/webhooks/resend/route.ts` does not exist. Open,
  click, bounce and complaint rates are unavailable — do not report an estimate for them.
- **No `document-review` coverage.** Async products create no `bookings` row, so they have no
  `end_time` and can never be selected. Not a bug; an open product decision (lifecycle §1).

---

## 10. Escalation

| Situation | Who |
| --- | --- |
| Review request sent for a cancelled/never-happened session (§7.1) | Karma, same day. Then Luke for the Cal webhook fix |
| Cron failing (`401`/`500`/`failed=N`) | Platform on-call, next business morning. Not overnight |
| Anything requiring a change to route code (§7.2, §7.5, §7.6) | Luke, via Kyle if it changes a contracted signature |
| Public testimonials missing from the site after the migration | §2.5. If §2.5 was skipped, run its check immediately |

---

**Verified against:** Vercel docs, fetched 2026-09-03 — <https://vercel.com/docs/cron-jobs>,
<https://vercel.com/docs/cron-jobs/quickstart>, <https://vercel.com/docs/cron-jobs/manage-cron-jobs>,
<https://vercel.com/docs/cron-jobs/usage-and-pricing>,
<https://vercel.com/docs/project-configuration/vercel-json>,
<https://vercel.com/docs/functions/configuring-functions/duration>,
<https://vercel.com/guides/troubleshooting-vercel-cron-jobs>. Repo behaviour verified by reading
`app/api/cron/review-requests/route.ts`, `lib/reviews.ts`, `lib/crypto.ts`, `lib/cal.ts`,
`app/api/availability/route.ts`, `components/booking/AvailabilityPreview.tsx`,
`lib/db/repository.ts`, `lib/db/migrations.sql`, `proxy.ts`, `next.config.js`.
