"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, CircleAlert, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { pushDataLayerEvent } from "@/lib/analytics/dataLayer";
import type { AvailableSlot } from "@/lib/cal";
import type { AvailabilityApiResponse } from "@/app/api/availability/route";

/**
 * Pre-payment time picker. Sourced from `/api/availability` (the server-side proxy to Cal.com's
 * Slots API) — this component NEVER imports `@calcom/embed-react` or calls `getCalApi()`, so a
 * visitor cannot complete an unpaid booking here and nothing collides with `PaidScheduler.tsx`'s
 * global `bookingSuccessfulV2` listener.
 *
 * The chosen instant travels to checkout as `preferredSlot`; once Stripe confirms payment,
 * `lib/calBooking.ts` books exactly that slot through the Cal.com API (ADR-0001 Decision C′).
 * Nothing is written to Cal.com before payment.
 *
 * DUBAI TIME ONLY. Every label is rendered in `Asia/Dubai`, whatever the visitor's device says.
 * Karma's working hours and the Cal.com schedule are both in Dubai time, and the owner asked for
 * a single, unambiguous clock rather than a converted one a visitor has to reconcile. The zone is
 * stated on screen next to the picker so nobody reads 9:00am as their own local time.
 *
 * Two density variants:
 *  - `compact` — `/services`, one dropdown carrying every slot, grouped by day, committed with an
 *    explicit button (the button navigates to `/booking`, so it must not fire on arrow keys).
 *  - `full` — `/booking` step 2: a strip of open days; clicking a day reveals a dropdown of that
 *    day's free times.
 *
 * Five states: loading, empty, error, populated, overflowing (the day strip scrolls sideways).
 * "Empty" and "error" are drawn where this component can observe them: `getAvailableSlots` is
 * FAIL-CLOSED, so a Cal.com outage and a genuinely empty calendar both arrive as `slots: []` and
 * read as "empty". "Error" means this site's own `/api/availability` fetch failed.
 */

/** The one clock the whole booking flow speaks. */
const DISPLAY_TZ = "Asia/Dubai";
const DISPLAY_TZ_LABEL = "Dubai time (GST, UTC+4)";

export type AvailabilityPreviewVariant = "compact" | "full";

export type AvailabilityPreviewProps = {
  /** The `ServiceProduct.slug` being previewed. */
  serviceSlug: string;
  variant: AvailabilityPreviewVariant;
  /** Analytics-only context for `select_preferred_slot`'s `source` property. */
  source: "services" | "booking_step2";
  /** Called with the ISO instant when a visitor picks a time. On `/services` this navigates to
   *  `/booking?service=<slug>&slot=<iso>`; inside `BookingFunnel` it records the choice that is
   *  sent to checkout. Either way, this NEVER creates a Cal.com booking. */
  onSelectSlot?: (iso: string) => void;
  /** The currently-selected ISO instant, if any — controlled so the caller can clear it. */
  selectedSlot?: string | null;
  /** Reports how many slots loaded (`null` on a failed fetch), so the caller can decide whether
   *  a time is required before payment. */
  onAvailabilityChange?: (slotCount: number | null) => void;
  className?: string;
};

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; slots: AvailableSlot[] };

type DayGroup = { key: string; slots: AvailableSlot[] };

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function formatLongDayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function dayParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: get("weekday"), day: get("day"), month: get("month") };
}

function formatTimeLabel(iso: string): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
  // Intl gives "2:00 PM" (with a narrow no-break space on some engines) — the house style is "2:00pm".
  return formatted.replace(/\s/g, "").toLowerCase();
}

function TimeZoneNote() {
  return (
    <p className="flex items-center gap-2 text-caption font-semibold text-neutral-500">
      <Clock size={14} strokeWidth={2.5} className="shrink-0 text-primary-violet" aria-hidden="true" />
      All times are {DISPLAY_TZ_LABEL}
    </p>
  );
}

/**
 * The `full` control: open days as buttons, then a dropdown of the chosen day's times.
 *
 * Clicking a day only changes which day's times are listed — it never picks a time on the
 * visitor's behalf. Picking from the dropdown commits immediately (nothing navigates here, so an
 * arrow-key `change` is harmless), and the confirmation line underneath stays visible even while
 * the visitor browses another day, so they always know what will be booked.
 */
function DaySlotPicker({
  groups,
  selectedSlot,
  onSelect,
}: {
  groups: DayGroup[];
  selectedSlot?: string | null;
  onSelect: (iso: string) => void;
}) {
  const stripLabelId = useId();
  const selectId = useId();
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const offered = useMemo(
    () => new Set(groups.flatMap((group) => group.slots.map((slot) => slot.start))),
    [groups],
  );
  // A selection only counts if it is still in the list we are showing — slots are refetched and
  // the caller may clear its choice, so it is reconciled rather than trusted.
  const liveSelection = selectedSlot && offered.has(selectedSlot) ? selectedSlot : null;
  const selectedDayKey = liveSelection ? dayKey(liveSelection) : null;

  const activeKey =
    (activeDay && groups.some((group) => group.key === activeDay) && activeDay) ||
    selectedDayKey ||
    groups[0].key;
  const activeGroup = groups.find((group) => group.key === activeKey) ?? groups[0];
  const timeValue =
    liveSelection && activeGroup.slots.some((slot) => slot.start === liveSelection) ? liveSelection : "";

  return (
    <div className="grid gap-4">
      <div>
        <p id={stripLabelId} className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Choose a day
        </p>
        <div
          role="group"
          aria-labelledby={stripLabelId}
          className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-2"
        >
          {groups.map((group) => {
            const active = group.key === activeKey;
            const holdsSelection = group.key === selectedDayKey;
            const { weekday, day, month } = dayParts(group.slots[0].start);
            return (
              <button
                key={group.key}
                type="button"
                aria-pressed={active}
                aria-label={`${formatLongDayLabel(group.slots[0].start)}, ${group.slots.length} times available`}
                onClick={() => setActiveDay(group.key)}
                className={cn(
                  "relative flex w-[84px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-2.5 transition-colors",
                  active
                    ? "border-primary-dark bg-primary-dark text-on-primary"
                    : "border-primary-dark/20 bg-neutral-100 text-primary-dark hover:border-primary-violet hover:bg-violet-tint",
                )}
              >
                <span className={cn("text-caption font-semibold uppercase tracking-wide", active ? "text-on-primary/75" : "text-neutral-500")}>
                  {weekday}
                </span>
                <span className="text-h4 font-extrabold leading-none">{day}</span>
                <span className={cn("text-caption font-medium", active ? "text-on-primary/75" : "text-neutral-500")}>
                  {month}
                </span>
                {holdsSelection && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-primary-dark"
                    aria-hidden="true"
                  >
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor={selectId} className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
          Available times · {formatLongDayLabel(activeGroup.slots[0].start)}
        </label>
        <div className="relative">
          <select
            // Remounted per day so the placeholder shows again when the listed day has no selection.
            key={activeGroup.key}
            id={selectId}
            value={timeValue}
            onChange={(event) => event.target.value && onSelect(event.target.value)}
            className="w-full appearance-none rounded-full border-2 border-primary-dark bg-neutral-100 py-3 pl-5 pr-11 text-body-sm font-bold text-primary-dark outline-none transition-colors hover:border-primary-violet focus-visible:border-primary-violet"
          >
            <option value="" disabled>
              Choose a time ({activeGroup.slots.length} available)
            </option>
            {activeGroup.slots.map((slot) => (
              <option key={slot.start} value={slot.start}>
                {formatTimeLabel(slot.start)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            strokeWidth={2.5}
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark"
          />
        </div>
      </div>

      {liveSelection && (
        <p className="flex items-center gap-2 rounded-2xl border-2 border-primary-violet/40 bg-violet-tint/60 px-4 py-3 text-body-sm font-semibold text-primary-dark">
          <Check size={16} strokeWidth={3} className="shrink-0 text-primary-violet" aria-hidden="true" />
          Preferred time: {formatLongDayLabel(liveSelection)} at {formatTimeLabel(liveSelection)} (Dubai) —
          confirmed once you pay.
        </p>
      )}
    </div>
  );
}

/**
 * The `compact` control on `/services`: one dropdown carrying every slot, grouped by day. The
 * button is not decoration — a native `<select>` fires `change` on every arrow keypress, and this
 * commit navigates to `/booking`, so choosing and committing are two separate acts.
 */
function CompactSlotSelect({
  groups,
  selectedSlot,
  onConfirm,
}: {
  groups: DayGroup[];
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

  const value =
    (pending && offered.has(pending) && pending) ||
    (selectedSlot && offered.has(selectedSlot) && selectedSlot) ||
    firstSlot;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor={selectId} className="sr-only">
        Preferred time (Dubai time)
      </label>
      <div className="relative min-w-0 flex-1">
        <select
          id={selectId}
          value={value}
          onChange={(event) => setPending(event.target.value)}
          className="w-full appearance-none rounded-full border-2 border-primary-dark bg-neutral-100 py-3 pl-5 pr-11 text-body-sm font-bold text-primary-dark outline-none transition-colors hover:border-primary-violet focus-visible:border-primary-violet"
        >
          {groups.map((group) => (
            <optgroup key={group.key} label={formatDayLabel(group.slots[0].start)}>
              {group.slots.map((slot) => (
                // The day is repeated inside the option: a collapsed `<select>` shows the option
                // label alone, never its `<optgroup>`.
                <option key={slot.start} value={slot.start}>
                  {formatDayLabel(slot.start)} — {formatTimeLabel(slot.start)}
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
            Choose this time <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />
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
  onAvailabilityChange,
  className,
}: AvailabilityPreviewProps) {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}&tz=${encodeURIComponent(DISPLAY_TZ)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`availability fetch failed: ${res.status}`);
        return res.json() as Promise<AvailabilityApiResponse>;
      })
      .then((body) => {
        if (cancelled) return;
        setState({ status: "loaded", slots: body.slots });
        onAvailabilityChange?.(body.slots.length);
        pushDataLayerEvent({
          event: "view_availability",
          product_slug: serviceSlug,
          slot_count: body.slots.length,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "error" });
        onAvailabilityChange?.(null);
      });

    return () => {
      cancelled = true;
    };
    // `onAvailabilityChange` is deliberately not a dependency: an inline callback from the parent
    // would otherwise refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug]);

  const groupedByDay = useMemo<DayGroup[]>(() => {
    if (state.status !== "loaded") return [];
    const groups = new Map<string, AvailableSlot[]>();
    for (const slot of state.slots) {
      const key = dayKey(slot.start);
      const bucket = groups.get(key);
      if (bucket) bucket.push(slot);
      else groups.set(key, [slot]);
    }
    return Array.from(groups.entries()).map(([key, slots]) => ({ key, slots }));
  }, [state]);

  function selectSlot(iso: string) {
    onSelectSlot?.(iso);
    pushDataLayerEvent({
      event: "select_preferred_slot",
      product_slug: serviceSlug,
      slot_iso: iso,
      source,
    });
  }

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="sr-only" role="status" aria-live="polite">
          {state.status === "loading"
            ? "Loading available times…"
            : state.status === "loaded"
              ? `${state.slots.length} available times loaded, shown in Dubai time.`
              : ""}
        </span>
        <TimeZoneNote />
      </div>

      {state.status === "loading" &&
        (variant === "compact" ? (
          <div
            className="h-[50px] w-full animate-pulse rounded-full border-2 border-transparent bg-neutral-200"
            aria-hidden="true"
          />
        ) : (
          <div className="grid gap-4" aria-hidden="true">
            <div className="flex gap-2.5 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[84px] w-[84px] shrink-0 animate-pulse rounded-2xl bg-neutral-200" />
              ))}
            </div>
            <div className="h-[50px] w-full animate-pulse rounded-full bg-neutral-200" />
          </div>
        ))}

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-error/30 bg-error/6 p-6 text-body-sm text-primary-dark">
          <CircleAlert size={20} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
          <p>
            Couldn&apos;t load live availability right now. You can still book — you&apos;ll choose
            your exact time straight after payment.
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
          // Remounted per service so the internal pending value never survives into another list.
          key={serviceSlug}
          groups={groupedByDay}
          selectedSlot={selectedSlot}
          onConfirm={selectSlot}
        />
      )}

      {state.status === "loaded" && state.slots.length > 0 && variant === "full" && (
        <DaySlotPicker
          key={serviceSlug}
          groups={groupedByDay}
          selectedSlot={selectedSlot}
          onSelect={selectSlot}
        />
      )}

      {state.status !== "error" && (
        <p className="mt-4 flex items-start gap-2.5 text-body-sm text-neutral-500">
          <Info size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary-violet" aria-hidden="true" />
          {variant === "full"
            ? "We book this time for you as soon as payment clears. If someone takes it first, you'll choose another straight after payment."
            : "Pick a time here and we'll book it for you once payment clears."}
        </p>
      )}
    </div>
  );
}
