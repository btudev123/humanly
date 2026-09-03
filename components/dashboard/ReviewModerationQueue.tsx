"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Lock, RefreshCw, RotateCcw, ShieldCheck, Star, X } from "lucide-react";
import {
  MODERATION_PAGE_LIMIT,
  type ModerationAction,
  type ModerationErrorCode,
  type ModerationListResponse,
  type ModerationRow,
  type RatingDistribution,
} from "./reviewModeration";

const EMPTY_DISTRIBUTION: RatingDistribution = { counts: [0, 0, 0, 0, 0], unrated: 0, total: 0 };

function toCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

/** Never trust the shape enough to divide by it — a malformed payload must not render NaN. */
function normaliseDistribution(value: RatingDistribution | undefined): RatingDistribution {
  if (!value || !Array.isArray(value.counts)) return EMPTY_DISTRIBUTION;
  const counts = [0, 1, 2, 3, 4].map((index) => toCount(value.counts[index]));
  return { counts, unrated: toCount(value.unrated), total: toCount(value.total) };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Long enough that clamping a normal two-line answer would be pointless friction. */
const QUOTE_CLAMP_THRESHOLD = 320;

type LoadState = "loading" | "ready" | "error";

/** Per-row UI state. Absent = idle. Only ever one entry per row id. */
type RowUi = {
  /** The action awaiting a second click. Nothing is sent until it is confirmed. */
  confirming?: ModerationAction;
  /** In flight. Disables THIS row's buttons only. */
  busy?: ModerationAction;
  /** The last failure for this row, shown inline. Cleared on the next attempt. */
  error?: string;
};

/** The one action that can be undone, kept with its position so the row goes back where it was. */
type LastAction = {
  row: ModerationRow;
  index: number;
  action: ModerationAction;
  message: string;
};

function formatSubmitted(row: ModerationRow): string {
  if (!row.submittedAt) return "Date unknown";
  const parsed = new Date(row.submittedAt);
  if (Number.isNaN(parsed.getTime())) return "Date unknown";
  return `${row.submittedAtIsFallback ? "Recorded " : ""}${dateFormat.format(parsed)}`;
}

/** A name for the row in an accessible label — there is never a person's name to use. */
function rowDescription(row: ModerationRow): string {
  const rating = row.rating === null ? "unrated" : `${row.rating}-star`;
  const who = row.roleLabel || row.location || "an anonymous client";
  return `${rating} review from ${who}, ${formatSubmitted(row)}`;
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return (
      <span className="inline-flex items-center rounded-full border-2 border-primary-dark/20 bg-neutral-200 px-2 py-0.5 text-caption font-semibold text-neutral-500">
        No rating
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Rated ${rating} out of 5`}>
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <Star
            key={step}
            size={13}
            className={step <= rating ? "fill-accent-orange text-primary-dark" : "text-neutral-400"}
          />
        ))}
      </span>
      <span aria-hidden="true" className="text-caption font-bold text-primary-dark">
        {rating}/5
      </span>
    </span>
  );
}

/**
 * THE CONSENT BADGE. The verdict is decided on the server (`consentVerdict` in
 * `app/api/dashboard/testimonials/route.ts`) and every non-publishable case is distinguished by
 * icon, border style and a written reason — not by colour alone.
 */
function ConsentBadge({ row }: { row: ModerationRow }) {
  if (row.consent === "publishable") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark/25 bg-violet-tint px-2.5 py-0.5 text-caption font-bold text-primary-dark">
        <ShieldCheck size={13} aria-hidden="true" /> Consented to publish
      </span>
    );
  }
  if (row.consent === "admin_authored") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark/25 bg-orange-tint px-2.5 py-0.5 text-caption font-bold text-primary-dark">
        <ShieldCheck size={13} aria-hidden="true" /> Entered by Humanly
      </span>
    );
  }
  if (row.consent === "private") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark bg-neutral-100 px-2.5 py-0.5 text-caption font-bold text-primary-dark">
        <Lock size={13} aria-hidden="true" /> Private — never publishable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-error bg-neutral-100 px-2.5 py-0.5 text-caption font-bold text-primary-dark">
      <AlertTriangle size={13} aria-hidden="true" /> Consent not recorded
    </span>
  );
}

function ConsentNotice({ row }: { row: ModerationRow }) {
  if (row.consent === "private") {
    return (
      <p className="mt-3 flex gap-2 rounded-xl border-2 border-primary-dark/20 bg-neutral-100 p-3 text-caption font-semibold leading-relaxed text-primary-dark">
        <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          This client answered “No, keep this between us.” It can never be published, so there is no
          approve action here. Read it, act on it, then file it — the words stay in the database for
          you, and nowhere else.
        </span>
      </p>
    );
  }
  if (row.consent === "unrecorded") {
    return (
      <p className="mt-3 flex gap-2 rounded-xl border-2 border-error/50 bg-neutral-100 p-3 text-caption font-semibold leading-relaxed text-primary-dark">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          A client submitted this, but no display-consent answer was stored with it. Without a
          recorded “yes” it is treated exactly like a “no” and cannot be published. Worth checking
          the row in the database before filing it.
        </span>
      </p>
    );
  }
  return null;
}

function RatingSummary({ distribution }: { distribution: RatingDistribution }) {
  const { counts, unrated, total } = distribution;
  const max = Math.max(1, ...counts);

  return (
    <div className="rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-4">
      <h3 className="text-caption font-bold uppercase tracking-[0.14em] text-neutral-500">
        Ratings — every submission, published or not
      </h3>
      {total === 0 ? (
        <p className="mt-2 text-body-sm text-neutral-500">Nothing submitted yet.</p>
      ) : (
        <>
          <ul className="mt-3 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = counts[star - 1] || 0;
              return (
                <li key={star} className="flex items-center gap-2 text-caption font-semibold text-primary-dark">
                  <span className="w-8 shrink-0 tabular-nums">{star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <span
                      className="block h-full rounded-full bg-primary-violet"
                      style={{ width: `${Math.round((count / max) * 100)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums">{count}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-caption font-semibold text-neutral-500">
            {total} submission{total === 1 ? "" : "s"}
            {unrated > 0 ? ` · ${unrated} with no rating` : ""}
          </p>
        </>
      )}
    </div>
  );
}

export function ReviewModerationQueue() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [rows, setRows] = useState<ModerationRow[]>([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [distribution, setDistribution] = useState<RatingDistribution>(EMPTY_DISTRIBUTION);
  const [rowUi, setRowUi] = useState<Record<string, RowUi>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [undoBusy, setUndoBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const undoRef = useRef<HTMLButtonElement | null>(null);
  /** Each row's <li>, so cancelling a confirm can put focus back on the row it came from. */
  const rowRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadState("loading");
    setLoadError("");

    try {
      const response = await fetch("/api/dashboard/testimonials?status=pending", {
        cache: "no-store",
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as Partial<ModerationListResponse> & {
        error?: string;
      };

      if (controller.signal.aborted) return;

      if (!response.ok) {
        setLoadError(
          response.status === 401
            ? "Your admin session has expired. Reload the page to sign in again."
            : data.error || `The queue could not be loaded (HTTP ${response.status}).`,
        );
        setLoadState("error");
        return;
      }

      // A row with no id cannot be keyed, moderated or undone — drop it rather than render it.
      const testimonials = Array.isArray(data.testimonials)
        ? data.testimonials.filter((row): row is ModerationRow => Boolean(row) && typeof row.id === "string")
        : [];
      setRows(testimonials);
      setTotalMatching(
        typeof data.totalMatching === "number" && data.totalMatching >= testimonials.length
          ? data.totalMatching
          : testimonials.length,
      );
      setDistribution(normaliseDistribution(data.ratingDistribution));
      setRowUi({});
      setLastAction(null);
      setLoadState("ready");
    } catch (error) {
      if (controller.signal.aborted) return;
      setLoadError(
        error instanceof Error && error.message
          ? `The queue could not be loaded. ${error.message}`
          : "The queue could not be loaded.",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  /**
   * Send one status change. `rows` is never mutated until the server confirms, so a failure
   * cannot leave the list out of step with the database; the optimistic part is the row's own
   * state, which rolls back to idle (with the reason attached) if the request fails.
   *
   * The rating distribution is NOT refetched: approving or rejecting changes `status`, never
   * `rating`, and the distribution deliberately spans every status.
   */
  const moderate = useCallback(async (row: ModerationRow, index: number, action: ModerationAction) => {
    // Belt and braces with the server's SQL: a row that cannot be published must never be sent
    // an approve, whatever the button rendering does.
    if (action === "approve" && !row.canApprove) {
      setRowUi((prev) => ({
        ...prev,
        [row.id]: { error: "This review has no consent to publish, so it cannot be approved." },
      }));
      return;
    }

    setRowUi((prev) => ({ ...prev, [row.id]: { busy: action } }));

    try {
      const response = await fetch("/api/dashboard/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, status: action === "approve" ? "approved" : "rejected" }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: ModerationErrorCode;
      };

      if (!response.ok) {
        setRowUi((prev) => ({
          ...prev,
          [row.id]: {
            error:
              data.error ||
              (response.status === 401
                ? "Your admin session has expired. Reload the page and try again."
                : `That did not save (HTTP ${response.status}).`),
          },
        }));
        setAnnouncement(
          data.code === "consent_required" || data.code === "consent_unrecorded"
            ? "Blocked: this review has no consent to publish."
            : "That action failed. The review is still in the queue.",
        );
        return;
      }

      const message =
        action === "approve"
          ? "Approved and cleared for the public site."
          : "Filed. Nothing was published, and it is out of the queue.";

      setRows((prev) => prev.filter((candidate) => candidate.id !== row.id));
      setTotalMatching((prev) => Math.max(0, prev - 1));
      setRowUi((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      setLastAction({ row, index, action, message });
      setAnnouncement(`${message} ${rowDescription(row)}.`);
    } catch {
      setRowUi((prev) => ({
        ...prev,
        [row.id]: { error: "That did not save — the connection failed. The review is untouched." },
      }));
      setAnnouncement("That action failed. The review is still in the queue.");
    }
  }, []);

  /**
   * A moderated row unmounts, taking the focused confirm button with it. Without this, focus
   * falls back to <body> and a keyboard user loses their place — and the Undo they may want is
   * the thing that just appeared.
   */
  useEffect(() => {
    if (lastAction) undoRef.current?.focus();
  }, [lastAction]);

  /** Put the last-moderated row back to `pending`, at the position it came from. */
  const undo = useCallback(async () => {
    const target = lastAction;
    if (!target) return;

    setUndoBusy(true);
    try {
      const response = await fetch("/api/dashboard/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: target.row.id, status: "pending" }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setRowUi((prev) => ({
          ...prev,
          [target.row.id]: { error: data.error || "That could not be undone." },
        }));
        setAnnouncement("Undo failed.");
        return;
      }

      setRows((prev) => {
        if (prev.some((candidate) => candidate.id === target.row.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(target.index, next.length), 0, { ...target.row, status: "pending" });
        return next;
      });
      setTotalMatching((prev) => prev + 1);
      setLastAction(null);
      setAnnouncement("Undone. The review is back in the queue and is not cleared for publication.");
    } catch {
      setRowUi((prev) => ({
        ...prev,
        [target.row.id]: { error: "That could not be undone — the connection failed." },
      }));
      setAnnouncement("Undo failed.");
    } finally {
      setUndoBusy(false);
    }
  }, [lastAction]);

  const secondaryButton =
    "inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark px-3.5 py-1.5 text-caption font-bold uppercase tracking-[0.1em] text-primary-dark transition-colors hover:bg-violet-tint disabled:cursor-not-allowed disabled:opacity-50";
  const primaryButton =
    "btn-pop inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark bg-accent-orange px-3.5 py-1.5 text-caption font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section
      aria-labelledby="review-moderation-heading"
      className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="review-moderation-heading" className="text-h3 font-display font-bold text-primary-dark">
              Reviews awaiting moderation
            </h2>
            <p className="text-caption font-semibold text-neutral-500">
              Nothing a client writes reaches the site until you approve it here.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loadState === "loading"}
          className={secondaryButton}
        >
          <RefreshCw size={13} aria-hidden="true" />
          {loadState === "loading" ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0">
          {loadState === "loading" && (
            <ul className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((key) => (
                <li
                  key={key}
                  className="h-28 animate-pulse rounded-2xl border-2 border-primary-dark/10 bg-surface-container-low"
                />
              ))}
            </ul>
          )}

          {loadState === "error" && (
            <div className="rounded-2xl border-2 border-error bg-neutral-100 p-4">
              <p className="flex items-start gap-2 text-body-sm font-semibold text-primary-dark">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{loadError}</span>
              </p>
              <button type="button" onClick={() => void load()} className={`${secondaryButton} mt-3`}>
                Try again
              </button>
            </div>
          )}

          {loadState === "ready" && rows.length === 0 && (
            <div className="rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-5">
              <p className="text-body-sm font-bold text-primary-dark">No reviews awaiting moderation.</p>
              <p className="mt-1 text-body-sm text-neutral-500">
                Requests go out a few days after a session ends. Anything a client sends lands here
                first — nothing is ever published without you approving it.
              </p>
            </div>
          )}

          {loadState === "ready" && rows.length > 0 && (
            <>
              {totalMatching > rows.length && (
                <p className="mb-3 rounded-xl border-2 border-primary-dark/15 bg-surface-container-low px-3 py-2 text-caption font-semibold text-neutral-500">
                  Showing the {rows.length} most recent of {totalMatching} awaiting moderation. Clear
                  these and refresh to see the next {MODERATION_PAGE_LIMIT}.
                </p>
              )}
              <ul className="space-y-3">
                {rows.map((row, index) => {
                  const ui = rowUi[row.id] || {};
                  const confirming = ui.confirming;
                  const busy = Boolean(ui.busy);
                  const isExpanded = Boolean(expanded[row.id]);
                  const clamp = Boolean(row.quote && row.quote.length > QUOTE_CLAMP_THRESHOLD);
                  const blocked = !row.canApprove;

                  return (
                    <li
                      key={row.id}
                      ref={(node) => {
                        if (node) rowRefs.current[row.id] = node;
                        else delete rowRefs.current[row.id];
                      }}
                      tabIndex={-1}
                      className={
                        blocked
                          ? "rounded-2xl border-2 border-dashed border-primary-dark/50 bg-surface-container-high p-4"
                          : "rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-4"
                      }
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <RatingStars rating={row.rating} />
                        <ConsentBadge row={row} />
                        <span className="text-caption font-semibold text-neutral-500">
                          {formatSubmitted(row)}
                        </span>
                        {row.verified && (
                          <span className="text-caption font-semibold text-primary-violet">Verified</span>
                        )}
                      </div>

                      {row.quote ? (
                        <>
                          <p
                            className={`mt-2 break-words text-body-sm leading-relaxed text-primary-dark ${
                              clamp && !isExpanded ? "line-clamp-4" : ""
                            }`}
                          >
                            {row.quote}
                          </p>
                          {clamp && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpanded((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                              }
                              className="mt-1 text-caption font-bold text-primary-violet underline"
                            >
                              {isExpanded ? "Show less" : `Show all ${row.quote.length} characters`}
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="mt-2 text-body-sm text-neutral-500">
                          Rating only — this client did not write anything.
                        </p>
                      )}

                      <p className="mt-2 break-words text-caption font-semibold text-neutral-500">
                        {row.roleLabel || "No role given"} · {row.location || "No location given"}
                      </p>

                      <ConsentNotice row={row} />

                      {ui.error && (
                        <p
                          className="mt-3 flex gap-2 rounded-xl border-2 border-error bg-neutral-100 p-3 text-caption font-semibold leading-relaxed text-primary-dark"
                          role="alert"
                        >
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{ui.error}</span>
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {confirming ? (
                          <>
                            <span className="text-caption font-bold text-primary-dark">
                              {confirming === "approve"
                                ? "Publish this, showing role and location but never a name?"
                                : blocked
                                  ? "File this away, unpublished?"
                                  : "Remove this from the queue without publishing?"}
                            </span>
                            <button
                              type="button"
                              autoFocus
                              disabled={busy}
                              aria-busy={busy}
                              aria-label={
                                confirming === "approve"
                                  ? `Confirm: publish the ${rowDescription(row)}`
                                  : `Confirm: remove the ${rowDescription(row)} from the queue`
                              }
                              onClick={() => void moderate(row, index, confirming)}
                              className={confirming === "approve" ? primaryButton : secondaryButton}
                            >
                              {confirming === "approve" ? (
                                <Check size={13} aria-hidden="true" />
                              ) : (
                                <X size={13} aria-hidden="true" />
                              )}
                              {busy ? "Saving…" : confirming === "approve" ? "Yes, publish" : "Yes, file it"}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                // Focus first: the button below is about to unmount.
                                rowRefs.current[row.id]?.focus();
                                setRowUi((prev) => ({ ...prev, [row.id]: {} }));
                              }}
                              className={secondaryButton}
                            >
                              Keep in queue
                            </button>
                          </>
                        ) : (
                          <>
                            {/*
                              THE CONSENT RULE. `canApprove` is false for every row whose client
                              said "No, keep this between us" (and for any row with no recorded
                              consent), so the approve control is not rendered at all — not
                              disabled, not hidden behind a confirm. `moderate` refuses one too,
                              and the SQL in `setTestimonialStatus` refuses it a third time.
                            */}
                            {row.canApprove && (
                              <button
                                type="button"
                                disabled={busy}
                                aria-busy={busy}
                                aria-label={`Approve and publish the ${rowDescription(row)}`}
                                onClick={() =>
                                  setRowUi((prev) => ({ ...prev, [row.id]: { confirming: "approve" } }))
                                }
                                className={primaryButton}
                              >
                                <Check size={13} aria-hidden="true" />
                                {busy && ui.busy === "approve" ? "Approving…" : "Approve and publish"}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              aria-busy={busy}
                              aria-label={
                                blocked
                                  ? `File the ${rowDescription(row)} as internal-only`
                                  : `Reject the ${rowDescription(row)}`
                              }
                              onClick={() =>
                                setRowUi((prev) => ({ ...prev, [row.id]: { confirming: "reject" } }))
                              }
                              className={secondaryButton}
                            >
                              <X size={13} aria-hidden="true" />
                              {busy && ui.busy === "reject"
                                ? "Filing…"
                                : blocked
                                  ? "File as internal-only"
                                  : "Reject"}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {lastAction && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-primary-dark/15 bg-violet-tint px-4 py-3">
              <p className="text-caption font-bold text-primary-dark">{lastAction.message}</p>
              <button
                type="button"
                ref={undoRef}
                onClick={() => void undo()}
                disabled={undoBusy}
                aria-busy={undoBusy}
                className={secondaryButton}
              >
                <RotateCcw size={13} aria-hidden="true" />
                {undoBusy ? "Undoing…" : "Undo"}
              </button>
            </div>
          )}
        </div>

        <RatingSummary distribution={distribution} />
      </div>
    </section>
  );
}
