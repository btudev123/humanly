"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CircleAlert, Info } from "lucide-react";
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
 *  - `compact` — `/services`, a single row of up to 5 chips, no day grouping.
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
const MAX_COMPACT_CHIPS = 5;

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

function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function listTimeZones(): string[] | null {
  try {
    // `Intl.supportedValuesOf` — widely supported since 2023; guarded rather than assumed so an
    // older engine degrades to "detected zone, not changeable" instead of throwing.
    const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
      .supportedValuesOf;
    return supportedValuesOf ? supportedValuesOf("timeZone") : null;
  } catch {
    return null;
  }
}

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

export function AvailabilityPreview({
  serviceSlug,
  variant,
  source,
  onSelectSlot,
  selectedSlot,
  className,
}: AvailabilityPreviewProps) {
  // `null` until the post-mount effect below detects the visitor's real zone — the fetch effect
  // waits on this so the component makes exactly one request per (service, zone) pair instead of
  // one throwaway request against a hardcoded guess followed immediately by a second, correct one.
  const [timeZone, setTimeZoneState] = useState<string | null>(null);
  const resolvedTimeZone = timeZone ?? "UTC";
  const [zoneOptions, setZoneOptions] = useState<string[] | null>(null);
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTimeZoneState(detectTimeZone());
    setZoneOptions(listTimeZones());
  }, []);

  useEffect(() => {
    if (!timeZone) return;
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/availability?service=${encodeURIComponent(serviceSlug)}&tz=${encodeURIComponent(timeZone)}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug, timeZone]);

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

  const timeZoneControl = (
    <label className="flex items-center gap-2 text-caption font-semibold text-neutral-500">
      Time zone
      {zoneOptions ? (
        <select
          value={resolvedTimeZone}
          onChange={(event) => setTimeZoneState(event.target.value)}
          className="rounded-full border-2 border-primary-dark/20 bg-neutral-100 px-2.5 py-1 text-caption font-semibold text-primary-dark outline-none focus:border-primary-dark"
        >
          {zoneOptions.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ) : (
        <span className="font-bold text-primary-dark">{resolvedTimeZone.replace(/_/g, " ")}</span>
      )}
    </label>
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
        {timeZoneControl}
      </div>

      {state.status === "loading" && (
        <SkeletonChips count={variant === "compact" ? MAX_COMPACT_CHIPS : 6} />
      )}

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
        <div className="flex flex-wrap gap-3">
          {state.slots.slice(0, MAX_COMPACT_CHIPS).map((slot) => (
            <SlotChip
              key={slot.start}
              iso={slot.start}
              timeZone={resolvedTimeZone}
              showDay
              selected={selectedSlot === slot.start}
              onClick={() => selectSlot(slot.start)}
            />
          ))}
        </div>
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
