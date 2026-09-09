"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronDown, CircleCheck, Linkedin, Minus, Sparkles } from "lucide-react";
import {
  coreComparison,
  coreTierOrder,
  formatAed,
  getCoreLadder,
  type CoreTier,
  type ServiceCategory,
} from "@/lib/products";
import { AvailabilityPreview } from "@/components/booking/AvailabilityPreview";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { pushDataLayerEvent } from "@/lib/analytics/dataLayer";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { MergedService } from "@/lib/sanity/queries";

/**
 * `/services` catalogue — core ladder (table at `lg:`, accordion cards below), Specialist
 * Sessions, and Monthly Retainers. Built against `docs/design/2026-09-services-page-spec.md`
 * (Elena) and `docs/copy/2026-09-services-and-booking-copy.md` (Theo). The comparison
 * table/accordion render straight from `lib/products.ts` (`getCoreLadder()`, `coreComparison`) per
 * Elena's instruction not to re-author the ladder's copy here — only Specialist Sessions and
 * Monthly Retainers use the Sanity-merged `services` prop, and both now render through the one
 * shared `ServiceCard` below.
 */

/**
 * The two card strips below the core ladder. The retainer strip's treatment (violet-tint fill,
 * 2px ink-purple border, violet check icons, deep-purple pill CTA) is the approved reference —
 * the specialist strip now uses the same tokens so the page reads as one catalogue rather than
 * two. The only deliberate differences are per-strip layout and which copy field fills the
 * blurb/price-qualifier slots; both are declared here rather than branched inside the card.
 */
const secondaryCategoryOrder: {
  key: ServiceCategory;
  eyebrow: string;
  heading: string;
  intro: string;
  /** Card fill. Both strips use `bg-violet-tint`. */
  surfaceClass: string;
  /** Colour of the decorative check icon on each included-item bullet. */
  checkClass: string;
  ctaClass: string;
  /** Column tracks — and, for the aligned strip, the shared row template. */
  gridClass: string;
  /** The one short paragraph under the price. */
  blurb: (service: MergedService) => string;
  /** The quieter qualifier that follows the big price figure. */
  priceSuffix: (service: MergedService) => string | undefined;
  priceSuffixClass: string;
  /** Opt into the shared-baseline subgrid layout. See `ServiceCard`. */
  aligned: boolean;
}[] = [
  {
    key: "specialist",
    eyebrow: "Specialist Sessions",
    heading: "Built for one specific need",
    intro:
      "Independent, one-off sessions you can book without stepping onto the core ladder — each one built around a single, specific need rather than a general situation.",
    surfaceClass: "bg-violet-tint",
    checkClass: "text-primary-violet",
    ctaClass: "bg-primary-dark text-on-primary",
    gridClass: "sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto_auto_auto_1fr_auto]",
    /*
     * `forWho`, not `description`. Every specialist product's description restates its own
     * bullet list almost verbatim — e.g. Dubai Job Search reads "UAE job-market orientation,
     * CV positioning, and outreach strategy" above bullets "UAE job-market orientation" /
     * "CV positioning review" / "Outreach strategy", and Document Review reads "A written
     * review of one document: a letter, a contract, or a termination notice. Delivered by
     * email, no call required." above bullets that say the same three things. The bullets are
     * the scannable half, so they stay and the paragraph is replaced by the one line that adds
     * information the bullets don't carry: who the session is for. No copy is invented — both
     * fields already exist in `lib/products.ts` and are Sanity-overridable.
     */
    blurb: (service) => service.forWho,
    priceSuffix: (service) => service.duration,
    priceSuffixClass: "mt-1 block text-body-sm font-semibold text-neutral-500",
    aligned: true,
  },
  {
    key: "retainer",
    eyebrow: "Monthly Retainers",
    heading: "For situations that don't resolve in one session",
    // Theo's copy deck's closing sentence ("Cancel anytime; nothing here locks you in past the
    // month you're on") is dropped here, not shipped — it's a claim about the Stripe subscription
    // terms that isn't confirmed anywhere in this codebase (no self-service cancellation flow, no
    // stated cancel window in the UI). `[NEEDS DATA: confirmed cancellation/renewal terms for the
    // three retainer subscriptions before that sentence can ship.]`
    intro:
      "Ongoing monthly support for a workplace situation that's still active — more than one live issue, a slow-moving exit, or a role senior enough that things keep coming up.",
    surfaceClass: "bg-violet-tint",
    checkClass: "text-primary-violet",
    ctaClass: "bg-primary-dark text-on-primary",
    gridClass: "md:grid-cols-3",
    blurb: (service) => service.description,
    priceSuffix: (service) => service.priceNote,
    priceSuffixClass: "text-h3 font-bold text-neutral-500",
    // Left off deliberately: this three-card row is signed off as it stands, so it keeps the
    // exact markup it shipped with. Flipping this to `true` is the one-line change that gives
    // it the same shared baselines as the specialist row.
    aligned: false,
  },
];

function TierBooleanCell({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-body-sm text-neutral-600">{value}</span>;
  }
  return value ? (
    <span className="inline-flex items-center justify-center">
      <CircleCheck size={18} className="text-primary-violet" aria-hidden="true" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center">
      <Minus size={18} className="text-neutral-400" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
}

const tierLabelOverride: Record<CoreTier, string> = {
  good: "The Session",
  better: "Session + Plan",
  best: "Full Support",
};

/** Theo's copy deck (§A) — Good's downsell-blocker, verbatim. */
const GOOD_WHO_ISNT_FOR =
  "If more than one issue is in play, or you already know you'll need documents drafted, start with Session + Plan or Full Support instead. Good is built for a single question, not a live, multi-front situation.";

/**
 * Theo wrote two overlapping sentences for the 950→1,200 step (the table-wide "above the price
 * row" line and the "directly under Full Support's column" justification line — both in §A of
 * the copy deck). Shipping both stacks two near-identical sentences in the same small space; the
 * shorter "justification line" is used here, under Best's own column/card, and the longer one is
 * dropped rather than duplicated. Flag for Ruth alongside the rest of this page's ungated copy.
 */
const BEST_JUSTIFICATION =
  "Everything in Session + Plan, plus we draft the documents and stay reachable for two weeks while you act on them.";

/** Elena's spec §3 — new copy, ungated, Better's mobile card only. */
const BETTER_UPGRADE_NOTE =
  "AED 250 more unlocks Best's two extras: done-for-you documents and 14 days of WhatsApp access.";

function CoreLadderTable() {
  const ladder = getCoreLadder();
  const byTier = Object.fromEntries(ladder.map((p) => [p.tier as CoreTier, p]));

  return (
    <div className="mx-auto hidden max-w-5xl overflow-hidden rounded-3xl border-2 border-primary-dark bg-neutral-100 shadow-pop-sm lg:block">
      <table className="w-full border-collapse text-center">
        <caption className="sr-only">
          Comparison of Humanly&apos;s three advisory tiers: The Session, Session + Plan, and Full Support
        </caption>
        <colgroup>
          <col style={{ width: "34%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="border-b-2 border-primary-dark p-5" />
            {coreTierOrder.map((tier) => {
              const product = byTier[tier];
              const isBest = tier === "best";
              return (
                <th
                  key={tier}
                  scope="col"
                  className={cn(
                    "border-b-2 border-primary-dark p-5 align-bottom",
                    isBest && "border-t-2 border-l-2 border-r-2 border-accent-orange bg-accent-orange/8",
                  )}
                >
                  {isBest && (
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-label-bold uppercase tracking-wider text-primary-dark">
                      Recommended
                    </span>
                  )}
                  <p className="font-display text-h3 font-bold text-primary-dark">{product.name}</p>
                  <p className="mt-1 text-body-sm font-semibold uppercase tracking-wide text-primary-violet">
                    {product.subtitle}
                  </p>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {coreComparison.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="border-b border-neutral-300 p-5 text-left text-body-sm font-semibold text-primary-dark"
              >
                {row.label}
              </th>
              {coreTierOrder.map((tier) => (
                <td
                  key={tier}
                  className={cn(
                    "border-b border-neutral-300 p-5",
                    tier === "best" && "border-l-2 border-r-2 border-accent-orange bg-accent-orange/8",
                  )}
                >
                  <TierBooleanCell value={row.values[tier]} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row" className="border-b border-neutral-300 p-5 text-left text-body-sm font-semibold text-primary-dark">
              Why the step up
            </th>
            <td className="border-b border-neutral-300 p-5" />
            <td className="border-b border-neutral-300 p-5" />
            <td className="border-b border-neutral-300 border-l-2 border-r-2 border-accent-orange bg-accent-orange/8 p-5 text-body-sm text-neutral-600">
              {BEST_JUSTIFICATION}
            </td>
          </tr>
          <tr>
            <th scope="row" className="border-b-2 border-primary-dark p-5 text-left text-body-sm font-semibold text-primary-dark">
              Price
            </th>
            {coreTierOrder.map((tier) => {
              const product = byTier[tier];
              const isBest = tier === "best";
              return (
                <td
                  key={tier}
                  className={cn(
                    "border-b-2 border-primary-dark p-5",
                    isBest && "border-l-2 border-r-2 border-accent-orange bg-accent-orange/8",
                  )}
                >
                  {/* AED only — prices are quoted and charged in the same currency. */}
                  <p className="text-h2 font-display font-extrabold text-primary-dark">
                    {formatAed(product.amountAed)}
                  </p>
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="p-5" />
            {coreTierOrder.map((tier) => {
              const product = byTier[tier];
              const isBest = tier === "best";
              return (
                <td key={tier} className={cn("p-5", isBest && "border-b-2 border-l-2 border-r-2 border-accent-orange bg-accent-orange/8")}>
                  <Link
                    href={`/booking?service=${product.slug}`}
                    onClick={() =>
                      pushDataLayerEvent({
                        event: "select_tier",
                        tier,
                        product_slug: product.slug,
                        price_aed: product.amountAed,
                        source: "services_table",
                      })
                    }
                    className={cn(
                      "btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark px-5 py-3 text-sm font-bold",
                      isBest ? "bg-accent-orange text-primary-dark shadow-pop-sm" : "bg-primary-dark text-on-primary",
                    )}
                  >
                    Book {tierLabelOverride[tier]}
                  </Link>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CoreLadderAccordion() {
  const ladder = getCoreLadder();
  const byTier = Object.fromEntries(ladder.map((p) => [p.tier as CoreTier, p]));
  const order: CoreTier[] = ["best", "better", "good"];
  const [open, setOpen] = useState<CoreTier | null>("best");

  return (
    <div className="grid gap-5 lg:hidden">
      {order.map((tier) => {
        const product = byTier[tier];
        const isBest = tier === "best";
        const isOpen = open === tier;
        const listId = `core-ladder-checklist-${tier}`;

        return (
          <div
            key={tier}
            className={cn(
              "relative rounded-3xl border-2 border-primary-dark p-7",
              isBest ? "bg-primary-dark text-on-primary shadow-pop-orange" : "bg-neutral-100",
            )}
          >
            {isBest && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-label-bold uppercase tracking-wider text-primary-dark">
                Recommended
              </span>
            )}

            <p className={cn("font-display text-h3 font-bold", isBest ? "text-on-primary" : "text-primary-dark")}>
              {product.name}
            </p>
            <p className={cn("mt-1 text-body-sm font-semibold uppercase tracking-wide", isBest ? "text-accent-orange" : "text-primary-violet")}>
              {product.subtitle}
            </p>

            <div className="mt-4">
              <p className={cn("text-h2 font-display font-extrabold", isBest ? "text-accent-orange" : "text-primary-dark")}>
                {formatAed(product.amountAed)}
              </p>
            </div>

            {tier === "better" && (
              <p className="mt-2 text-body-sm text-neutral-500">{BETTER_UPGRADE_NOTE}</p>
            )}
            {isBest && <p className="mt-2 text-body-sm text-on-primary/70">{BEST_JUSTIFICATION}</p>}

            <Link
              href={`/booking?service=${product.slug}`}
              onClick={() =>
                pushDataLayerEvent({
                  event: "select_tier",
                  tier,
                  product_slug: product.slug,
                  price_aed: product.amountAed,
                  source: "services_table",
                })
              }
              className={cn(
                "btn-pop mt-5 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark px-6 py-3 text-sm font-bold",
                isBest ? "bg-accent-orange text-primary-dark shadow-pop-sm" : "bg-primary-dark text-on-primary",
              )}
            >
              Book {tierLabelOverride[tier]}
            </Link>

            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={listId}
              onClick={() => setOpen(isOpen ? null : tier)}
              className={cn(
                "mt-5 flex items-center gap-2 text-body-sm font-bold",
                isBest ? "text-accent-orange" : "text-primary-violet",
              )}
            >
              {isOpen ? "Hide details" : "See what's included"}
              <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
              <ul id={listId} className="mt-4 space-y-2.5 border-t-2 border-dashed border-current/20 pt-4">
                {coreComparison.map((row) => {
                  const value = row.values[tier];
                  const included = value !== false;
                  return (
                    <li key={row.label} className="flex gap-2.5 text-body-sm">
                      {included ? (
                        <CircleCheck
                          size={16}
                          className={cn("mt-0.5 shrink-0", isBest ? "text-accent-orange" : "text-primary-violet")}
                        />
                      ) : (
                        <Minus size={16} className={cn("mt-0.5 shrink-0", isBest ? "text-on-primary/40" : "text-neutral-400")} />
                      )}
                      <span className={isBest ? "text-on-primary/85" : "text-neutral-600"}>
                        {row.label}
                        {typeof value === "string" ? ` — ${value}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {tier === "good" && (
              <p className={cn("mt-4 text-body-sm", isBest ? "text-on-primary/70" : "text-neutral-500")}>
                {GOOD_WHO_ISNT_FOR}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FounderCredibility() {
  return (
    <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-6 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-7 sm:flex-row">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/karma-harb.png"
        alt="Karma Harb — Founder & Lead Advisor at Humanly"
        className="h-20 w-20 shrink-0 rounded-2xl border-2 border-primary-dark object-cover object-top"
      />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-bold text-primary-dark">
          {siteConfig.founder} — {siteConfig.founderRole}
        </p>
        <p className="mt-1 text-body-sm leading-relaxed text-neutral-500">
          20+ years in HR leadership across the Canadian Security Intelligence Service, the
          Government of Alberta, CBC/Radio-Canada, Canada&apos;s CIRO merger, and a multi-entity
          investment group spanning the UAE, KSA &amp; Pakistan — before founding Humanly.
        </p>
      </div>
      <div className="flex shrink-0 gap-3">
        <a
          href={siteConfig.founderLinkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-violet-tint px-4 py-2.5 text-body-sm font-bold text-primary-dark transition-colors hover:bg-primary-dark hover:text-on-primary"
        >
          <Linkedin size={16} strokeWidth={2.5} />
          Karma on LinkedIn
        </a>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark px-4 py-2.5 text-body-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint"
        >
          Her full story
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/**
 * One catalogue card, shared by the Specialist Sessions and Monthly Retainers strips.
 *
 * Reading order is fixed: name → subtitle → price → one short paragraph → what's included →
 * CTA. The name is the `h3` and leads; the price is confident but sits below it, and its
 * qualifier (`/mo`, or the session length) is deliberately quieter so the figure supports the
 * service name instead of shouting over it.
 *
 * **Equal heights and shared baselines.** With `aligned`, the strip's grid declares one row
 * template (`lg:grid-rows-[auto_auto_auto_auto_1fr_auto]`) and every card spans all six rows as
 * a `subgrid`, so the six slots are sized by the tallest card and *every* card's price, blurb,
 * list and button start on the same line no matter how long its title wraps. The `1fr` row is
 * the included-list, so it absorbs the slack and the CTA lands flush on the bottom edge of all
 * four. Nothing is clipped: a long list makes the shared row taller for everyone.
 *
 * Below `lg:` the card is the flex column it has always been — `h-full` plus `flex-grow` on the
 * list still gives equal-height cards with a bottom-flush CTA, which is how the retainer row
 * already worked. In a browser with no `subgrid` support (~4% at time of writing) only the
 * `grid-template-rows: subgrid` declaration is dropped: the cards still span the same six rows
 * so they stay equal height and nothing clips, they just lose the shared baselines and the CTA
 * sits under the list rather than on the bottom edge. Degraded, not broken.
 */
function ServiceCard({
  service,
  surfaceClass,
  checkClass,
  ctaClass,
  blurb,
  priceSuffix,
  priceSuffixClass,
  aligned,
}: {
  service: MergedService;
  surfaceClass: string;
  checkClass: string;
  ctaClass: string;
  blurb: string;
  priceSuffix?: string;
  priceSuffixClass: string;
  aligned: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-4 rounded-3xl border-2 border-primary-dark p-7 transition-transform hover:-translate-y-1",
        surfaceClass,
        // `break-words` keeps a 200-character product name or bullet inside the card instead of
        // pushing the grid track wide and giving the page a horizontal scrollbar.
        aligned && "break-words lg:row-span-6 lg:grid lg:grid-rows-subgrid",
      )}
    >
      <div className={aligned ? "lg:row-span-2 lg:grid lg:grid-rows-subgrid" : undefined}>
        <h3 className="text-h4 font-display font-bold leading-snug text-primary-dark">{service.name}</h3>
        <p className="mt-1 text-body-sm text-neutral-500">{service.subtitle}</p>
      </div>

      {/* AED only — quoted in the currency Stripe actually charges. */}
      <p className="text-h2 font-display font-extrabold text-primary-dark">
        {formatAed(service.amountAed)}
        {priceSuffix && <span className={priceSuffixClass}>{priceSuffix}</span>}
      </p>

      {blurb ? (
        <p className="text-body-sm leading-relaxed text-neutral-500">{blurb}</p>
      ) : (
        // A product with no `forWho`/`description` still has to occupy its row, or the cards
        // beside it would lose their shared baseline.
        aligned && <div />
      )}

      {service.features.length > 0 ? (
        <ul className="flex-grow space-y-2">
          {service.features.map((f) => (
            <li key={f} className="flex gap-2 text-body-sm">
              {/* lucide-react marks an icon with no a11y prop `aria-hidden` for us. */}
              <CheckCircle2 className={cn("mt-0.5 shrink-0", checkClass)} size={16} />
              <span className="text-neutral-600">{f}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-grow" />
      )}

      <Link
        href={`/booking?service=${service.slug}`}
        onClick={() =>
          pushDataLayerEvent({
            event: "select_tier",
            tier: service.slug,
            product_slug: service.slug,
            price_aed: service.amountAed,
            source: "services_table",
          })
        }
        className={cn(
          "btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark px-5 py-3 text-sm font-bold",
          ctaClass,
          // Full width so the longest label ("Book Interview Prep Package (3 Sessions)") wraps
          // inside the narrowest column instead of squashing the pill or the icon.
          aligned && "w-full text-center",
        )}
      >
        <Sparkles size={16} strokeWidth={2.5} className={aligned ? "shrink-0" : undefined} />
        {/* Async products are bought, not booked — "Order" is the accurate verb, and it replaces
            the previous non-specific "Get started". */}
        {service.needsScheduling ? `Book ${service.name}` : `Order ${service.name}`}
      </Link>
    </article>
  );
}

export function ServicesCatalog({ services }: { services: MergedService[] }) {
  const router = useRouter();

  return (
    <>
      {/* ── Core ladder ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Eyebrow color="violet">Core Advisory</Eyebrow>
          <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
            One conversation, or a plan you can act on
          </h2>
          <p className="mt-4 text-body-lg text-neutral-500">
            Three ways to work with Karma directly. All confidential, all delivered by the same
            advisor from first call to last message. Start with the level your situation actually
            needs, not automatically the smallest one.
          </p>
        </Reveal>

        <Reveal>
          <CoreLadderTable />
          <CoreLadderAccordion />
        </Reveal>

        <Reveal delay={0.05}>
          <FounderCredibility />
        </Reveal>

        {/* ── Availability preview strip (compact, scoped to the recommended tier) ── */}
        <Reveal delay={0.1} className="mx-auto mt-10 max-w-5xl rounded-3xl border-2 border-primary-dark bg-neutral-100 p-7">
          <h3 className="text-h4 font-display font-bold text-primary-dark">Real times, open this week</h3>
          <p className="mt-1 text-body-sm text-neutral-500">
            These are live openings on Karma&apos;s calendar. Pick the one that works for you — this
            is a preference, not a booking.
          </p>
          <AvailabilityPreview
            serviceSlug="full-support"
            variant="compact"
            source="services"
            className="mt-5"
            onSelectSlot={(iso) => router.push(`/booking?service=full-support&slot=${encodeURIComponent(iso)}`)}
          />
          <Link
            href="/booking"
            className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet hover:text-accent-orange"
          >
            See full availability during booking →
          </Link>
        </Reveal>
      </section>

      {/* ── Specialist sessions + retainers — one shared card, Sanity-merged copy ── */}
      {secondaryCategoryOrder.map((strip) => {
        const items = services.filter((product) => product.category === strip.key);
        if (items.length === 0) return null;

        return (
          <section key={strip.key} className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow>{strip.eyebrow}</Eyebrow>
              <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">{strip.heading}</h2>
              <p className="mt-4 text-body-lg text-neutral-500">{strip.intro}</p>
            </Reveal>

            <div className={cn("grid items-stretch gap-6", strip.gridClass)}>
              {items.map((service, index) => (
                <Reveal
                  key={service.slug}
                  delay={index * 0.06}
                  className={cn("h-full", strip.aligned && "lg:row-span-6 lg:grid lg:grid-rows-subgrid")}
                >
                  <ServiceCard
                    service={service}
                    surfaceClass={strip.surfaceClass}
                    checkClass={strip.checkClass}
                    ctaClass={strip.ctaClass}
                    blurb={strip.blurb(service)}
                    priceSuffix={strip.priceSuffix(service)}
                    priceSuffixClass={strip.priceSuffixClass}
                    aligned={strip.aligned}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
