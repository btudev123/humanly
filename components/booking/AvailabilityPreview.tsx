"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { pushDataLayerEvent } from "@/lib/analytics/dataLayer";
import type { AvailableSlot } from "@/lib/cal";
import type { AvailabilityApiResponse } from "@/app/api/availability/route";

/**
 * Read-only pre-payment availability preview. Sourced from `/api/availability` (Luke's
 * server-side proxy to Cal.com's Slots API) — this component NEVER imports `@calcom/embed-react`
 * or calls `getCalApi()`. See `docs/adr/0001-pricing-currency-availability-reviews.md` Decision C
 * and `docs/design/2026-09-services-page-spec.md` §5 for why: a second, bookable Cal embed
 * pre-payment would let a visitor complete a real, unpaid booking and could collide with
 * `PaidScheduler.tsx`'s global, unnamespaced `bookingSuccessfulV2` listener.
 *
 * Two density variants (`docs/design/2026-09-services-page-spec.md` §5):
 *  - `compact` — `/services`, one dropdown carrying every slot the API returned, grouped by day
 *    into `<optgroup>`s, committed with an explicit button.
 *  - `full` — `/booking` step 2, grouped by day: columns in a row at `md:` and up (day/date lives
 *    inside each chip, not a separate column header), stacked full-width day sections below `md:`
 *    (day shown once as a section heading, chips drop the day line).
 *
 * Five states: loading, empty, error, populated, overflowing (capped-and-scrolling day column).
 * The distinction between "empty" and "error" is real, not decorative, but it is drawn at the
 * boundary this component can actually observe: `getAvailableSlots` (Luke's `lib/cal.ts`) is
 * deliberately FAIL-CLOSED — a Cal.com outage, an expired API key, and a genuinely empty calendar
 * all produce the same `{ available: false, slots: [] }` response (see ADR-0001 Decision C
 * consequences). This component cannot and does not try to tell those apart; it treats any
 * successful-but-empty response as "empty" (Theo's low-friction copy already covers a real outage
 * gracefully: "pick your tier and continue"). "Error" here means OUR OWN fetch to `/api/availability`
 * failed outright — a network error or non-2xx from this site's own route, not Cal.com's.
 */

const MAX_VISIBLE_PER_DAY = 6;

export type AvailabilityPreviewVariant = "compact" | "full";

export type AvailabilityPreviewProps = {
  /** The `ServiceProduct.slug` being previewed. */
  serviceSlug: string;
  variant: AvailabilityPreviewVariant;
  /** Analytics-only context for `select_preferred_slot`'s `source` property. */
  source: "services" | "booking_step2";
  /** Called with the ISO instant when a visitor picks a chip. On `/services` this is expected to
   *  navigate to `/booking?service=<slug>&slot=<iso>`; inside `BookingFunnel` it just records the
   *  local preference. Either way, this NEVER creates a Cal.com booking — see the file header. */
  onSelectSlot?: (iso: string) => void;
  /** The currently-selected ISO instant, if any — controlled so the caller can clear it (e.g. on
   *  service change) without this component losing sync with what will actually be submitted. */
  selectedSlot?: string | null;
  className?: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; slots: AvailableSlot[] };



function dayKey(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatDayLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function formatTimeLabel(iso: string, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
  // Intl gives "2:00 PM" — the spec's chip copy is "2:00pm".
  return formatted.replace(" ", "").toLowerCase();
}

function SkeletonChips({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap gap-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[62px] w-[124px] animate-pulse rounded-full border-2 border-transparent bg-neutral-200"
        />
      ))}
    </div>
  );
}

function SlotChip({
  iso,
  timeZone,
  showDay,
  selected,
  onClick,
}: {
  iso: string;
  timeZone: string;
  showDay: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex min-w-[124px] flex-col items-start gap-0.5 rounded-full border-2 px-4 py-2.5 text-left transition-colors",
        selected
          ? "border-primary-violet bg-primary-violet text-on-primary"
          : "border-primary-dark bg-neutral-100 text-primary-dark hover:border-primary-violet hover:bg-violet-tint",
      )}
    >
      {showDay && (
        <span
          className={cn(
            "text-caption font-medium uppercase tracking-wide",
            selected ? "text-on-primary/70" : "text-neutral-500",
          )}
        >
          {formatDayLabel(iso, timeZone)}
        </span>
      )}
      <span className={cn("text-body-sm font-bold", selected ? "text-on-primary" : "text-primary-dark")}>
        {formatTimeLabel(iso, timeZone)}
      </span>
      {selected ? (
        <span className="flex items-center gap-1 text-caption font-semibold text-on-primary/85">
          <Check size={12} strokeWidth={3} /> Selected
        </span>
      ) : (
        <span className="text-caption font-semibold text-primary-violet">Prefer this time →</span>
      )}
    </button>
  );
}

/**
 * The `compact` control. A dropdown rather than the row of chips this used to render: the strip
 * lives inside a narrow card on `/services`, where a chip row wrapped badly and — capped at five
 * — hid most of the week’s real openings behind "See full availability during booking". Every
 * slot the API returned is in here, grouped by day.
 *
 * The button is not decoration. A native `<select>` fires `change` on every arrow keypress, so
 * calling `onConfirm` from `onChange` would push a keyboard visitor to `/booking` while they were
 * still scrolling the list. Choosing and committing are two separate acts.
 */
function CompactSlotSelect({
  groups,
  timeZone,
  selectedSlot,
  onConfirm,
}: {
  groups: { key: string; slots: AvailableSlot[] }[];
  timeZone: string;
  selectedSlot?: string | null;
  onConfirm: (iso: string) => void;
}) {
  const selectId = useId();
  const [pending, setPending] = useState<string | null>(null);

  const offered = useMemo(
    () => new Set(groups.flatMap((group) => group.slots.map((slot) => slot.start))),
    [groups],
  );
  const firstSlot = groups[0]?.slots[0]?.start ?? "";

  // Both `pending` and the controlled `selectedSlot` can outlive the list they point into — the
  // slots are refetched on every (service, time zone) change, and the caller may clear its
  // selection — so the rendered value is reconciled against what is actually offered right now
  // rather than trusted. Falls back to the soonest opening, never to an empty control.
  const value =
    (pending && offered.has(pending) && pending) ||
    (selectedSlot && offered.has(selectedSlot) && selectedSlot) ||
    firstSlot;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor={selectId} className="sr-only">
        Preferred time
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={selectId}
          value={value}
          onChange={(event) => setPending(event.target.value)}
          className="w-full appearance-none rounded-full border-2 border-primary-dark bg-neutral-100 py-3 pl-5 pr-11 text-body-sm font-bold text-primary-dark outline-none transition-colors hover:border-primary-violet focus-visible:border-primary-violet"
        >
          {groups.map((group) => (
            <optgroup key={group.key} label={formatDayLabel(group.slots[0].start, timeZone)}>
              {group.slots.map((slot) => (
                // The day is repeated inside the option on purpose: a collapsed `<select>` shows
                // the option label alone, never its `<optgroup>`, so a bare "3:30pm" would leave
                // the visitor unable to see which day they had picked.
                <option key={slot.start} value={slot.start}>
                  {formatDayLabel(slot.start, timeZone)} — {formatTimeLabel(slot.start, timeZone)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark"
        />
      </div>
      <button
        type="button"
        onClick={() => value && onConfirm(value)}
        disabled={!value}
        className="btn-pop inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-3 text-body-sm font-bold text-primary-dark shadow-pop-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {selectedSlot && selectedSlot === value ? (
          <>
            <Check size={16} strokeWidth={3} aria-hidden="true" /> Selected
          </>
        ) : (
          <>
            Prefer this time <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}

export function AvailabilityPreview({
  serviceSlug,
  variant,
  source,
  onSelectSlot,
  selectedSlot,
  className,
}: AvailabilityPreviewProps) {
  const resolvedTimeZone = "Asia/Dubai";
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}&tz=${encodeURIComponent(resolvedTimeZone)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`availability fetch failed: ${res.status}`);
        return res.json() as Promise<AvailabilityApiResponse>;
      })
      .then((body) => {
        if (cancelled) return;
        setState({ status: "loaded", slots: body.slots });
        pushDataLayerEvent({
          event: "view_availability",
          product_slug: serviceSlug,
          slot_count: body.slots.length,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [serviceSlug, resolvedTimeZone]);

  const groupedByDay = useMemo(() => {
    if (state.status !== "loaded") return [];
    const groups = new Map<string, AvailableSlot[]>();
    for (const slot of state.slots) {
      const key = dayKey(slot.start, resolvedTimeZone);
      const bucket = groups.get(key);
      if (bucket) bucket.push(slot);
      else groups.set(key, [slot]);
    }
    return Array.from(groups.entries()).map(([key, slots]) => ({ key, slots }));
  }, [state, resolvedTimeZone]);

  function selectSlot(iso: string) {
    onSelectSlot?.(iso);
    pushDataLayerEvent({
      event: "select_preferred_slot",
      product_slug: serviceSlug,
      slot_iso: iso,
      source,
    });
  }

  function toggleExpanded(key: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const disclaimer = (
    <p className="mt-4 flex items-start gap-2.5 text-body-sm text-neutral-500">
      <Info size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary-violet" aria-hidden="true" />
      This is a preference, not a booking — we confirm your exact time after payment, on the next
      screen.
    </p>
  );

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="sr-only" role="status" aria-live="polite">
          {state.status === "loading"
            ? "Loading available times…"
            : state.status === "loaded"
              ? `${state.slots.length} available times loaded.`
              : ""}
        </span>
      </div>

      {state.status === "loading" &&
        (variant === "compact" ? (
          <div
            className="h-[50px] w-full animate-pulse rounded-full border-2 border-transparent bg-neutral-200"
            aria-hidden="true"
          />
        ) : (
          <SkeletonChips count={6} />
        ))}

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-error/30 bg-error/6 p-6 text-body-sm text-primary-dark">
          <CircleAlert size={20} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
          <p>
            Couldn&apos;t load live availability right now. You can still book — we&apos;ll confirm
            your exact time after payment.
          </p>
        </div>
      )}

      {state.status === "loaded" && state.slots.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100 p-6 text-center text-body-sm text-neutral-500">
          No times in the next 14 days.{" "}
          <a href="/contact" className="font-semibold text-primary-violet underline underline-offset-2">
            Message us on WhatsApp
          </a>{" "}
          and we&apos;ll find one that works.
        </div>
      )}

      {state.status === "loaded" && state.slots.length > 0 && variant === "compact" && (
        <CompactSlotSelect
          // Remounted per (service, zone) so the internal pending value can never survive into a
          // list it does not belong to; the reconciliation inside covers the rest.
          key={`${serviceSlug}-${resolvedTimeZone}`}
          groups={groupedByDay}
          timeZone={resolvedTimeZone}
          selectedSlot={selectedSlot}
          onConfirm={selectSlot}
        />
      )}

      {state.status === "loaded" && state.slots.length > 0 && variant === "full" && (
        <>
          {/* Desktop: day columns in a row, day/date lives inside each chip. */}
          <div
            className="hidden gap-4 md:grid"
            style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}
          >
            {groupedByDay.map(({ key, slots }) => {
              const expanded = expandedDays.has(key);
              const visible = expanded ? slots : slots.slice(0, MAX_VISIBLE_PER_DAY);
              const hiddenCount = slots.length - visible.length;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col gap-2",
                    expanded && "max-h-56 overflow-y-auto pr-1",
                  )}
                >
                  {visible.map((slot) => (
                    <SlotChip
                      key={slot.start}
                      iso={slot.start}
                      timeZone={resolvedTimeZone}
                      showDay
                      selected={selectedSlot === slot.start}
                      onClick={() => selectSlot(slot.start)}
                    />
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(key)}
                      className="rounded-full border-2 border-dashed border-neutral-300 px-4 py-2.5 text-body-sm font-semibold text-neutral-500 hover:border-primary-violet hover:text-primary-violet"
                    >
                      +{hiddenCount} more
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: day sections stacked full-width, chips drop the day line. */}
          <div className="grid gap-6 md:hidden">
            {groupedByDay.map(({ key, slots }) => {
              const expanded = expandedDays.has(key);
              const visible = expanded ? slots : slots.slice(0, MAX_VISIBLE_PER_DAY);
              const hiddenCount = slots.length - visible.length;
              return (
                <section key={key}>
                  <h3 className="mb-2 text-caption font-bold uppercase tracking-wide text-neutral-500">
                    {formatDayLabel(slots[0].start, resolvedTimeZone)}
                  </h3>
                  <div className={cn("flex flex-wrap gap-2.5", expanded && "max-h-56 overflow-y-auto pr-1")}>
                    {visible.map((slot) => (
                      <SlotChip
                        key={slot.start}
                        iso={slot.start}
                        timeZone={resolvedTimeZone}
                        showDay={false}
                        selected={selectedSlot === slot.start}
                        onClick={() => selectSlot(slot.start)}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(key)}
                        className="rounded-full border-2 border-dashed border-neutral-300 px-4 py-2.5 text-body-sm font-semibold text-neutral-500 hover:border-primary-violet hover:text-primary-violet"
                      >
                        +{hiddenCount} more
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {disclaimer}
    </div>
  );
}
