"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, Loader2, Send, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewConsentDisplay } from "@/lib/db/repository";

/**
 * The review form behind a valid `/review/<token>` link.
 *
 * Compliance constraints, not styling choices — `docs/lifecycle/2026-09-review-request-sequence.md`
 * §6:
 *   - Rating is required and is ALWAYS collected. There is no branch by rating: a 1 travels the
 *     same fields, the same validation and the same POST as a 5. Routing low ratings away from
 *     the public form is review gating and is explicitly not done here.
 *   - The free-text field is optional and shown to everyone, whatever they picked.
 *   - The publish choice is binary, required, with no default and no pre-selection. The three
 *     strings below (heading, sub-line, both option labels) are §6 verbatim — they are written as
 *     JSX string expressions so the exact characters, including the em dash, survive editing.
 *
 * `consentValues` arrives as a prop rather than being imported here: the constants live in
 * `lib/db/repository`, which pulls in the Neon client, and this is a client component. The server
 * page passes `REVIEW_CONSENT_PUBLISH` / `REVIEW_CONSENT_PRIVATE` through, so the literals are
 * still never retyped.
 */
export type ReviewFormProps = {
  /** The full `<uid>.<expiry>.<sig>` path segment — posted back for server-side re-verification. */
  token: string;
  consentValues: { publish: ReviewConsentDisplay; private: ReviewConsentDisplay };
};

/** Mirrors the zod schema in `app/api/reviews/route.ts` — keep in step if that changes. */
const QUOTE_MAX = 4000;
const SHORT_FIELD_MAX = 160;

/** Show the counter only when someone is actually near the ceiling. */
const QUOTE_COUNTER_FROM = QUOTE_MAX - 400;

const RATINGS = [1, 2, 3, 4, 5] as const;

const fieldClass =
  "w-full rounded-2xl border-2 border-primary-dark/20 bg-neutral-100 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark";

const labelClass = "grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500";

const optionalClass = "font-semibold normal-case tracking-normal text-neutral-500";

const legendClass = "text-h4 font-extrabold text-primary-dark";

const panelClass = "rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 sm:p-6";

const fieldErrorClass =
  "mt-3 flex items-start gap-2 rounded-2xl border-2 border-dashed border-error/40 bg-error/10 p-3 text-body-sm font-semibold text-primary-dark";

type Phase = "idle" | "submitting" | "success" | "already";

/**
 * Status codes come straight from `app/api/reviews/route.ts`. 409 is not routed through here —
 * it has its own state, because "you already sent one" is not an error the person can fix by
 * retrying.
 */
function messageForStatus(status: number): string {
  if (status === 400) {
    return "Something in the form did not come through. Check your rating and your answer to “Can we publish this?”, then send again.";
  }
  if (status === 401 || status === 410) {
    return "This link is no longer valid. Open the link in your email again, or write to hello@talkhumanly.com and we will send a new one.";
  }
  if (status === 503) {
    return "We cannot save reviews right now. Try again in a few minutes — nothing you have typed has been lost.";
  }
  return "That did not send. Try again in a moment, or write to hello@talkhumanly.com if it keeps happening.";
}

export function ReviewForm({ token, consentValues }: ReviewFormProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [quote, setQuote] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [location, setLocation] = useState("");
  const [consent, setConsent] = useState<ReviewConsentDisplay | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // The two terminal states replace the form outright, so focus has to be moved there or a
  // keyboard/screen-reader user is left on a submit button that no longer exists. Moving focus
  // is also what reliably announces the outcome — a `role="status"` node inserted at the same
  // moment its content appears is not consistently read.
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase === "success" || phase === "already") resultRef.current?.focus();
  }, [phase]);

  const consentOptions: { value: ReviewConsentDisplay; label: string }[] = [
    {
      value: consentValues.publish,
      label: "Yes, you can publish this — with my role and location, never my name.",
    },
    { value: consentValues.private, label: "No, keep this between us." },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "submitting") return;

    const missingRating = rating === null;
    const missingConsent = consent === null;
    setRatingError(missingRating ? "Pick a rating from 1 to 5 before sending." : null);
    setConsentError(missingConsent ? "Choose whether we can publish this." : null);

    if (missingRating || missingConsent) {
      setFormError(null);
      // Send focus to the first thing that needs answering rather than leaving the person to
      // hunt for the message.
      document.getElementById(missingRating ? "rating-1" : "consent-0")?.focus();
      return;
    }

    setPhase("submitting");
    setFormError(null);

    let response: Response;
    try {
      response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          // Omitted rather than sent empty, matching the API's optional fields. No name is
          // collected anywhere on this form — the site never publishes one.
          ...(quote.trim() ? { quote: quote.trim() } : {}),
          ...(roleLabel.trim() ? { roleLabel: roleLabel.trim() } : {}),
          ...(location.trim() ? { location: location.trim() } : {}),
          consentDisplay: consent,
        }),
      });
    } catch {
      setPhase("idle");
      setFormError(
        "We could not reach the server. Check your connection and try again — nothing you have typed has been lost.",
      );
      return;
    }

    if (response.ok) {
      setPhase("success");
      return;
    }

    if (response.status === 409) {
      setPhase("already");
      return;
    }

    setPhase("idle");
    setFormError(messageForStatus(response.status));
  }

  if (phase === "success") {
    return (
      <div
        ref={resultRef}
        role="status"
        tabIndex={-1}
        className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-violet sm:p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint">
          <CheckCircle2 size={24} strokeWidth={2.5} className="text-primary-violet" />
        </span>
        <h2 className="text-h3 mt-4 font-extrabold text-primary-dark">Thank you. That is saved.</h2>
        <p className="mt-2 text-body-md text-neutral-500">
          {consent === consentValues.publish
            ? "Karma reads every review herself. If this one goes on the site, it appears with your role and location only — never your name."
            : "Karma reads every review herself. This one stays between us and will not appear on the site."}
        </p>
        <Link
          href="/"
          className="btn-pop mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-6 py-3 text-[14px] font-bold text-primary-dark shadow-pop-sm"
        >
          Back to Humanly
        </Link>
      </div>
    );
  }

  if (phase === "already") {
    return (
      <div
        ref={resultRef}
        role="status"
        tabIndex={-1}
        className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-violet sm:p-8"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-dark bg-orange-tint">
          <Info size={24} strokeWidth={2.5} className="text-orange-deep" />
        </span>
        <h2 className="text-h3 mt-4 font-extrabold text-primary-dark">
          This session already has a review.
        </h2>
        <p className="mt-2 text-body-md text-neutral-500">
          One review per session, and one is already in. If you need to change what you sent, email{" "}
          <a href="mailto:hello@talkhumanly.com" className="font-semibold text-primary-violet underline underline-offset-4">
            hello@talkhumanly.com
          </a>
          .
        </p>
        <Link
          href="/"
          className="btn-pop mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-6 py-3 text-[14px] font-bold text-primary-dark shadow-pop-sm"
        >
          Back to Humanly
        </Link>
      </div>
    );
  }

  const submitting = phase === "submitting";
  const quoteRemaining = QUOTE_MAX - quote.length;

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting} className="grid gap-4" noValidate>
      {/* ── Rating — required, no branch by value ─────────────────── */}
      <fieldset className={panelClass}>
        <legend className={legendClass}>
          How was your session?
          <span className="sr-only"> (required)</span>
        </legend>
        <p className="mt-1 text-body-sm text-neutral-500">
          One to five. Every rating is read, whichever one you pick.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {RATINGS.map((value) => {
            const filled = (hovered ?? rating ?? 0) >= value;
            return (
              <label
                key={value}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                <input
                  id={`rating-${value}`}
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => {
                    setRating(value);
                    setRatingError(null);
                  }}
                  aria-required="true"
                  aria-describedby={ratingError ? "rating-error" : undefined}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-colors",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-violet",
                    filled
                      ? "border-primary-dark bg-accent-orange"
                      : "border-primary-dark/15 bg-neutral-100 hover:border-primary-dark/50",
                  )}
                >
                  <Star
                    size={20}
                    strokeWidth={2.5}
                    className={filled ? "fill-primary-dark text-primary-dark" : "text-neutral-400"}
                  />
                </span>
                {/* The accessible name for each radio. */}
                <span className="sr-only">{value === 1 ? "1 star" : `${value} stars`}</span>
              </label>
            );
          })}
          {/* Visual confirmation only — a screen reader gets this from the radio itself. */}
          <span aria-hidden="true" className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
            {rating ? `${rating} of 5` : "Not rated yet"}
          </span>
        </div>

        {ratingError && (
          <p id="rating-error" role="alert" className={fieldErrorClass}>
            <AlertCircle size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-error" />
            {ratingError}
          </p>
        )}
      </fieldset>

      {/* ── Free text — optional, shown to everyone ───────────────── */}
      <div className={panelClass}>
        <label htmlFor="review-quote" className={cn(legendClass, "block")}>
          {"Anything you'd like to add?"} <span className={optionalClass}>Optional</span>
        </label>
        <p id="quote-help" className="mt-1 text-body-sm text-neutral-500">
          In your own words. If this one is published, this is the part people read.
        </p>
        <textarea
          id="review-quote"
          name="quote"
          rows={5}
          value={quote}
          maxLength={QUOTE_MAX}
          onChange={(event) => setQuote(event.target.value)}
          aria-describedby="quote-help"
          className={cn(fieldClass, "mt-3 resize-y")}
        />
        {/* Overflow: the API caps this at 4,000 characters, so say so before the field stops
            accepting keystrokes rather than after. */}
        {quote.length >= QUOTE_COUNTER_FROM && (
          <p aria-live="polite" className="mt-2 text-body-sm font-semibold text-neutral-500">
            {quoteRemaining === 0
              ? "You have reached the 4,000 character limit."
              : `${quoteRemaining.toLocaleString()} characters left.`}
          </p>
        )}
      </div>

      {/* ── Attribution — optional, and the promise stated on screen ── */}
      <div className={panelClass}>
        <h2 className={legendClass}>
          How should we describe you? <span className={optionalClass}>Optional</span>
        </h2>
        <p className="mt-1 text-body-sm text-neutral-500">
          We publish reviews with a role and a location, and nothing else. Your name is never shown.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label htmlFor="review-role" className={labelClass}>
            Your role
            <input
              id="review-role"
              name="roleLabel"
              type="text"
              value={roleLabel}
              maxLength={SHORT_FIELD_MAX}
              onChange={(event) => setRoleLabel(event.target.value)}
              autoComplete="organization-title"
              placeholder="Senior marketing manager"
              className={fieldClass}
            />
          </label>
          <label htmlFor="review-location" className={labelClass}>
            Where you are based
            <input
              id="review-location"
              name="location"
              type="text"
              value={location}
              maxLength={SHORT_FIELD_MAX}
              onChange={(event) => setLocation(event.target.value)}
              autoComplete="address-level2"
              placeholder="Dubai, UAE"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      {/* ── Consent — §6 verbatim, binary, required, no default ───── */}
      <fieldset className={panelClass}>
        <legend className={legendClass}>
          {"Can we publish this?"}
          <span className="sr-only"> (required)</span>
        </legend>
        <p id="consent-help" className="mt-1 text-body-sm text-neutral-500">
          {"We only publish reviews people say yes to. If you'd rather this stayed between us, it does."}
        </p>

        <div className="mt-4 grid gap-3">
          {consentOptions.map((option, index) => {
            const active = consent === option.value;
            return (
              <label key={option.value} className="group cursor-pointer">
                <input
                  id={`consent-${index}`}
                  type="radio"
                  name="consentDisplay"
                  value={option.value}
                  checked={active}
                  onChange={() => {
                    setConsent(option.value);
                    setConsentError(null);
                  }}
                  aria-required="true"
                  aria-describedby={consentError ? "consent-help consent-error" : "consent-help"}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border-2 p-4 transition-colors",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-violet",
                    active
                      ? "border-primary-dark bg-violet-tint"
                      : "border-primary-dark/15 bg-neutral-100 group-hover:border-primary-dark/60",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      active ? "border-primary-dark bg-accent-orange" : "border-neutral-300",
                    )}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-neutral-100" />}
                  </span>
                  <span className="text-body-md font-semibold text-primary-dark">{option.label}</span>
                </span>
              </label>
            );
          })}
        </div>

        {consentError && (
          <p id="consent-error" role="alert" className={fieldErrorClass}>
            <AlertCircle size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-error" />
            {consentError}
          </p>
        )}
      </fieldset>

      {formError && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border-2 border-dashed border-error/40 bg-error/10 p-4 text-body-sm font-semibold text-primary-dark"
        >
          <AlertCircle size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-error" />
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-pop inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
        ) : (
          <Send size={18} strokeWidth={2.5} />
        )}
        {submitting ? "Sending your review..." : "Send my review"}
      </button>
    </form>
  );
}
