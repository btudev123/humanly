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
  serviceCategoryLabels,
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
 * Monthly Retainers use the Sanity-merged `services` prop, unchanged from the prior pattern.
 */

const secondaryCategoryOrder: {
  key: ServiceCategory;
  eyebrow: string;
  heading: string;
  intro: string;
  accent: string;
  checkColor: string;
  ctaClass: string;
}[] = [
  {
    key: "specialist",
    eyebrow: "Specialist Sessions",
    heading: "Built for one specific need",
    intro:
      "Independent, one-off sessions you can book without stepping onto the core ladder — each one built around a single, specific need rather than a general situation.",
    accent: "bg-orange-tint",
    checkColor: "text-accent-orange",
    ctaClass: "bg-accent-orange text-primary-dark",
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
    accent: "bg-violet-tint",
    checkColor: "text-primary-violet",
    ctaClass: "bg-primary-dark text-on-primary",
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
            These are live openings on Karma&apos;s calendar. Tap one that works for you — this is a
            preference, not a booking.
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

      {/* ── Specialist sessions + retainers (unchanged card pattern, Sanity-merged copy) ── */}
      {secondaryCategoryOrder.map(({ key, eyebrow, heading, intro, accent, checkColor, ctaClass }) => {
        const items = services.filter((product) => product.category === key);
        if (items.length === 0) return null;

        return (
          <section key={key} className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">{heading}</h2>
              <p className="mt-4 text-body-lg text-neutral-500">{intro}</p>
            </Reveal>

            <div className={cn("grid items-stretch gap-6", key === "specialist" ? "sm:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
              {items.map((service, index) => (
                <Reveal key={service.slug} delay={index * 0.06} className="h-full">
                  <article
                    className={cn(
                      "relative flex h-full flex-col gap-4 rounded-3xl border-2 border-primary-dark p-7 transition-transform hover:-translate-y-1",
                      accent,
                    )}
                  >
                    <div>
                      <h3 className="text-h4 font-display font-bold leading-snug text-primary-dark">{service.name}</h3>
                      <p className="mt-1 text-body-sm text-neutral-500">{service.subtitle}</p>
                    </div>

                    <p className="text-h2 font-display font-extrabold text-primary-dark">
                      {formatAed(service.amountAed)}
                      {service.priceNote && (
                        <span className="text-h3 font-bold text-neutral-500">{service.priceNote}</span>
                      )}
                    </p>

                    <p className="text-body-sm leading-relaxed text-neutral-500">{service.description}</p>

                    <ul className="flex-grow space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex gap-2 text-body-sm">
                          <CheckCircle2 className={cn("mt-0.5 shrink-0", checkColor)} size={16} />
                          <span className="text-neutral-600">{f}</span>
                        </li>
                      ))}
                    </ul>

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
                      )}
                    >
                      <Sparkles size={16} strokeWidth={2.5} />
                      {service.needsScheduling ? `Book ${service.name}` : "Get started"}
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
