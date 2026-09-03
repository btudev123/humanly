"use client";

/**
 * Thin client-side wrapper around the GTM `dataLayer` that already loads on every page
 * (`app/layout.tsx`). Nothing here creates a new GA4 property or fires anything server-side —
 * see `lib/analytics/funnel.ts` for the server-side `funnel_events` table and
 * `docs/cro/2026-09-pricing-page-cro.md` §6 (Track A) for the event contract this implements.
 *
 * Safe to call from anywhere, including before GTM has finished loading — `window.dataLayer` is
 * initialized synchronously in `app/layout.tsx` before the GTM script tag, so pushing to it early
 * queues the event rather than dropping it.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type PricingFunnelEvent =
  | { event: "view_pricing_table" }
  | {
      event: "select_tier";
      tier: string;
      product_slug: string;
      price_aed: number;
      source: "services_table" | "booking_funnel";
    }
  | { event: "view_availability"; product_slug: string; slot_count: number }
  | {
      event: "select_preferred_slot";
      product_slug: string;
      slot_iso: string;
      source: "services" | "booking_step2";
    }
  | {
      event: "begin_checkout";
      product_slug: string;
      tier?: string;
      value: number;
      currency: "AED";
      had_preferred_slot: boolean;
    };

export function pushDataLayerEvent(payload: PricingFunnelEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
