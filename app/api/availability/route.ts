import { getAvailableSlots, normaliseTimeZone, type AvailableSlot } from "@/lib/cal";
import { getSellableServiceProduct } from "@/lib/products";
import { recordFunnelEvent } from "@/lib/analytics/funnel";

/**
 * `GET /api/availability?service=<slug>&tz=<iana timezone>` → `AvailabilityApiResponse`.
 *
 * Read-only. Resolves `service` via `getSellableServiceProduct()` — purchase-time resolution
 * (live catalogue, or a legacy-alias slug's live replacement), NOT `getServiceProduct()`'s full
 * live→retired-archive→alias chain. This is a preview of what a visitor can actually book right
 * now; a retired, no-longer-sold product has no business showing "available times" even if its
 * archive record still carries a `needsScheduling: true` flag. If the slug resolves to nothing
 * purchasable at all, or to a product with `needsScheduling: false` (e.g. `document-review`,
 * which is async and has no Cal event to preview), respond with an empty `slots` array and
 * `available: false` — never a 4xx for an otherwise well-formed request, since this is a preview
 * surface a page can call defensively without pre-validating the slug itself.
 *
 * Date range: defaults to "today through +14 days" if not overridden — no `from`/`to` query
 * params are specified in the plan, so this route owns picking a sensible fixed window rather
 * than exposing range params Mira would need to wire up. `[NEEDS DATA: whether 14 days matches
 * how far out Cal.com event types in this account actually open availability — if an event type
 * only opens a shorter window, the extra days simply return no slots, which is harmless but a
 * wasted round-trip]`.
 */

export const runtime = "nodejs"; // no Node-only API required, but matches this route surface's existing default (see webhooks). Edge is a valid alternative Luke may choose.

/**
 * Deliberately NOT `export const dynamic = "force-dynamic"`. This route reads `searchParams`, so
 * Next treats it as dynamic anyway — but `force-dynamic` would additionally pin every `fetch()`
 * inside it to `no-store`, silently killing the 300s Data Cache on Cal.com's `/slots` call that
 * is the only thing keeping upstream load bounded.
 */

export type AvailabilityApiResponse = {
  service: string;
  available: boolean;
  slots: AvailableSlot[];
};

/**
 * Per-instance throttle on the `slot_previewed` funnel write.
 *
 * This route is public and unauthenticated, and every call used to insert a `funnel_events` row —
 * so a loop over `?service=` values was an unauthenticated write amplifier against the database.
 * The analytics question ("do visitors look at availability?") is a rate question, not a count
 * question, so one row per product per minute answers it just as well and puts a ceiling on the
 * write volume that does not depend on request volume.
 *
 * Best-effort by construction: serverless instances are ephemeral and there may be several, so
 * the real ceiling is `instances x products / minute`, not `products / minute`. That is a bound,
 * which is what was missing; it is not a guarantee, and it is not a substitute for a real limiter
 * if this route ever does something more expensive than a preview.
 *
 * The key is always a resolved live `product.slug`, never the raw query string, so the map is
 * bounded by the size of the catalogue and cannot be grown by a caller.
 */
const FUNNEL_THROTTLE_MS = 60_000;
const lastFunnelWriteBySlug = new Map<string, number>();

function shouldRecordSlotPreview(productSlug: string): boolean {
  const now = Date.now();
  const last = lastFunnelWriteBySlug.get(productSlug);
  if (last !== undefined && now - last < FUNNEL_THROTTLE_MS) return false;
  lastFunnelWriteBySlug.set(productSlug, now);
  return true;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const service = url.searchParams.get("service");
  const timeZone = url.searchParams.get("tz");

  if (!service || !timeZone) {
    return Response.json(
      { error: "Both `service` and `tz` query parameters are required." },
      { status: 400 },
    );
  }

  // Reject anything not resolvable by Intl before it ever reaches Cal.com's API.
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch {
    return Response.json({ error: "Invalid `tz` timezone." }, { status: 400 });
  }

  // `tz` is client-controlled and ends up in two places it must not be trusted in raw: the
  // upstream Cal.com URL (which is the fetch cache key) and a database write. `normaliseTimeZone`
  // collapses all ~420 IANA identifiers onto 26 fixed-offset buckets, so neither the cache key
  // space nor the recorded value can be varied by a caller. See `lib/cal.ts` for the full
  // reasoning and the live verification that the bucketed zone returns identical slots.
  // `getAvailableSlots` applies the same normalisation itself — belt and braces, so a future
  // caller that skips this route cannot reopen the hole.
  const normalisedTimeZone = normaliseTimeZone(timeZone);

  const product = getSellableServiceProduct(service);
  if (!product || !product.needsScheduling) {
    const body: AvailabilityApiResponse = { service, available: false, slots: [] };
    return Response.json(body);
  }

  const from = new Date();
  const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

  const slots = await getAvailableSlots({
    product,
    from: toIsoDate(from),
    to: toIsoDate(to),
    timeZone: normalisedTimeZone,
  });

  // Server-side "slot_previewed" event (docs/cro/2026-09-pricing-page-cro.md, Track B item 8) —
  // more reliable than client-side dataLayer alone since this is already a server round-trip
  // to Cal. Throttled per product (see above) and best-effort: a funnel-recording failure must
  // never break the availability preview.
  if (shouldRecordSlotPreview(product.slug)) {
    void recordFunnelEvent({
      event: "slot_previewed",
      path: "/api/availability",
      productSlug: product.slug,
      metadata: { slotCount: slots.length, timeZone: normalisedTimeZone },
    }).catch(() => {});
  }

  const body: AvailabilityApiResponse = { service, available: slots.length > 0, slots };
  return Response.json(body);
}
