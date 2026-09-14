import Link from "next/link";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";
import { ServicesCatalog } from "@/components/services/ServicesCatalog";
import { getServices } from "@/lib/sanity/queries";
import { serviceProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";
import { LatestPosts } from "@/components/blog/LatestPosts";

const comparison = [
  { aspect: "Who they protect", hr: "The company", humanly: "You, the individual", lawyer: "Your legal position" },
  { aspect: "Confidentiality", hr: "Limited — reports to management", humanly: "Absolute — no employer contact", lawyer: "Attorney-client privilege" },
  { aspect: "Cost", hr: "Free (but conflicted)", humanly: "AED 275–AED 5,140", lawyer: "AED 2,020–AED 5,140+" },
  { aspect: "Approach", hr: "Policy-driven", humanly: "Human-centered, practical", lawyer: "Litigation-focused" },
  { aspect: "Speed", hr: "Slow — internal processes", humanly: "Same-week sessions, fast turnaround", lawyer: "Weeks to months" },
  { aspect: "Emotional support", hr: "Not their role", humanly: "Core to the approach", lawyer: "Not their role" },
];

const objectionFaqs = [
  {
    q: "Will my employer find out I'm looking at this?",
    a: "No. Humanly never contacts your employer, and nothing you share connects to any company system. The Confidentiality Promise above is the whole practice, not a marketing line.",
  },
  {
    q: "Is this a lawyer? Do I need one instead?",
    a: "No. Humanly gives HR guidance and coaching, not legal advice. If your situation needs a lawyer, part of what you get from a session is knowing that sooner rather than later, and better questions to bring to one.",
  },
  {
    q: "I don't know if my problem needs more than a quick answer.",
    a: "That's exactly what The Session is for — one specific question, thirty minutes, and a clear read on whether it stops there or needs more.",
  },
  {
    q: "What do I actually get for AED 250 less than Full Support?",
    a: "Session + Plan gives you the full written action plan. Full Support adds two things: Karma drafting the documents herself, and twice as many days of WhatsApp access afterward. Everything else is identical.",
  },
  {
    q: "Is “done-for-you” real, or just advice with a label on it?",
    a: "Full Support includes Karma drafting the actual documents — emails to your manager or HR, formal responses to a PIP or warning letter, grievance and complaint letters, and resignation or exit documents — not just telling you what to write.",
  },
  {
    q: "AED 1,200 is a lot for a conversation.",
    a: "It's less than a first meeting with an employment lawyer typically costs, and it's built to save you from needing one. See the comparison table below.",
  },
  {
    q: "What if I pay and it doesn't help?",
    a: "Cancellations 24 hours or more before your session get a full refund; inside 24 hours, 50%. No-shows don't get refunded but you can reschedule once at no cost. This is a cancellation policy, not a satisfaction guarantee — Humanly does not currently offer an outcome guarantee beyond it.",
  },
];

/**
 * `Offer`/`Service`/`ItemList` JSON-LD per `docs/seo/2026-09-restructure-seo-spec.md` §3a.
 * Generated server-side from `serviceProducts` — never hand-typed — so a future catalogue edit
 * can't drift this out of sync with the visible price the way `charged in USD` already did once.
 * `priceCurrency` is always `"AED"`, and so is every price shown on the page — display-currency
 * conversion was removed, so schema and screen cannot disagree. AED is what Stripe charges.
 */
function buildServicesItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: serviceProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: product.name,
        description: product.description,
        provider: { "@type": "Organization", name: "Humanly HR Advisory" },
        areaServed: ["Worldwide", "United Arab Emirates", "Gulf Cooperation Council", "North America"],
        offers: {
          "@type": "Offer",
          price: String(product.amountAed),
          priceCurrency: "AED",
          availability: "https://schema.org/InStock",
          url: absoluteUrl(`/booking?service=${product.slug}`),
        },
      },
    })),
  };
}

export default async function ServicesPage() {
  // Marketing copy merged from Sanity over the in-code catalogue (falls back to
  // in-code copy when Studio is empty). Pricing/Stripe/Cal come only from code.
  const services = await getServices();
  const itemListSchema = buildServicesItemListSchema();

  return (
    <div className="overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Header */}
      <section className="relative mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#ff6a1a" className="absolute left-[10%] top-0 hidden h-8 w-8 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[10%] top-6 hidden h-16 w-16 opacity-50 md:block" />

        {/* Block wrapper: otherwise this pill and the `inline-block` h1 share a line on wide screens. */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-accent-orange" /> Services
          </span>
        </div>
        <h1 className="text-h1 mx-auto mt-6 inline-block font-display font-extrabold tracking-tight text-primary-dark">
          Expert HR advisory,{" "}
          <span className="relative inline-block">
            on your terms
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" animate />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-neutral-500">
          From a quick async document review to an executive retainer, choose the level of support
          that fits your situation. See real availability before you pay, then book privately
          through Stripe.
        </p>
      </section>

      {/* Confidentiality promise — moved up per Marcus's CRO spec §1: answers "will my employer
          find out" before a visitor is asked to compare prices, not after. */}
      <section className="mx-auto mt-16 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-on-primary shadow-pop-orange md:p-14">
          <Scribble variant="spiral" color="#ff6a1a" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
            <div>
              <ShieldCheck className="mb-6 text-accent-orange" size={40} />
              <h2 className="text-h2 font-display font-extrabold tracking-tight">The Confidentiality Promise</h2>
              <p className="mt-4 text-body-lg leading-relaxed text-on-primary/70">
                We do not alert employers, sell workplace data, or accept employer-side advisory work that would compromise individual trust. What you share stays in the room.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8">
              <h3 className="text-h3 font-display font-bold">Not sure where to start?</h3>
              <p className="mt-3 leading-relaxed text-on-primary/70">
                Most people start with The Session — one focused conversation, no commitment,
                strictly confidential — to get their bearings before deciding what comes next.
              </p>
              <Link
                href="/booking?service=the-session"
                className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-[5px_5px_0_0_#9d5cff]"
              >
                Book The Session
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog: core ladder, availability strip, specialist sessions, retainers */}
      <ServicesCatalog services={services} />

      {/* Objection FAQ — sits near the pricing table, not a replacement for /faq */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <h2 className="text-h2 mb-10 text-center font-display font-extrabold tracking-tight text-primary-dark">
          Before you decide
        </h2>
        <div className="mx-auto max-w-3xl space-y-3">
          {objectionFaqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border-2 border-primary-dark bg-neutral-100 p-5 open:shadow-pop-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-md font-bold text-primary-dark marker:content-none">
                {item.q}
                <ChevronDown size={18} className="shrink-0 text-primary-violet transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-body-sm leading-relaxed text-neutral-500">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <h2 className="text-h2 mb-12 text-center font-display font-extrabold tracking-tight text-primary-dark">How Humanly compares</h2>

        {/* Below md: same `comparison` data as stacked cards. A 4-column table forced a sideways
            swipe on every phone with no visible affordance; a dl reads in one pass instead. */}
        <div className="grid gap-4 md:hidden">
          {comparison.map((row) => (
            <div key={row.aspect} className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary-dark break-words">{row.aspect}</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="shrink-0 font-semibold text-neutral-400">Internal HR</dt>
                  <dd className="min-w-0 text-right text-neutral-500 [overflow-wrap:anywhere]">{row.hr}</dd>
                </div>
                <div className="-mx-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl bg-violet-tint px-3 py-2">
                  <dt className="shrink-0 font-bold text-primary-violet">Humanly</dt>
                  <dd className="min-w-0 text-right font-semibold text-primary-violet [overflow-wrap:anywhere]">{row.humanly}</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <dt className="shrink-0 font-semibold text-neutral-400">Employment Lawyer</dt>
                  <dd className="min-w-0 text-right text-neutral-500 [overflow-wrap:anywhere]">{row.lawyer}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-3xl border-2 border-primary-dark bg-neutral-100 shadow-pop-sm md:block">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b-2 border-primary-dark">
                <th className="p-5 text-sm font-bold uppercase tracking-wider text-primary-dark">Aspect</th>
                <th className="p-5 text-sm font-bold uppercase tracking-wider text-neutral-400">Internal HR</th>
                <th className="bg-violet-tint p-5 text-sm font-bold uppercase tracking-wider text-primary-violet">Humanly</th>
                <th className="p-5 text-sm font-bold uppercase tracking-wider text-neutral-400">Employment Lawyer</th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-500">
              {comparison.map((row, i) => (
                <tr key={row.aspect} className={`border-t border-neutral-300 ${i % 2 === 0 ? "bg-surface-container-low/40" : ""}`}>
                  <td className="p-5 font-bold text-primary-dark">{row.aspect}</td>
                  <td className="p-5">{row.hr}</td>
                  <td className="bg-violet-tint p-5 font-semibold text-primary-violet">{row.humanly}</td>
                  <td className="p-5">{row.lawyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <LatestPosts title="Thinking behind the advice" />
    </div>
  );
}
