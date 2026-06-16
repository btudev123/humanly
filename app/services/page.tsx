"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";
import {
  formatUsd,
  serviceProducts,
  serviceCategoryLabels,
  type ServiceCategory,
} from "@/lib/products";

const categoryOrder: { key: ServiceCategory; blurb: string }[] = [
  { key: "session", blurb: "One-off, pay-as-you-go advisory — book exactly what your situation needs." },
  { key: "retainer", blurb: "Ongoing monthly support for live, evolving situations." },
  { key: "corporate", blurb: "Employer-side guidance and team workshops for SMEs." },
];

const comparison = [
  { aspect: "Who they protect", hr: "The company", humanly: "You, the individual", lawyer: "Your legal position" },
  { aspect: "Confidentiality", hr: "Limited — reports to management", humanly: "Absolute — no employer contact", lawyer: "Attorney-client privilege" },
  { aspect: "Cost", hr: "Free (but conflicted)", humanly: "$75–$1,400", lawyer: "$550–$1,400+" },
  { aspect: "Approach", hr: "Policy-driven", humanly: "Human-centered, practical", lawyer: "Litigation-focused" },
  { aspect: "Speed", hr: "Slow — internal processes", humanly: "Same-week sessions, fast turnaround", lawyer: "Weeks to months" },
  { aspect: "Emotional support", hr: "Not their role", humanly: "Core to the approach", lawyer: "Not their role" },
];

export default function ServicesPage() {
  return (
    <div className="overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      {/* Header */}
      <section className="relative mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#ff6a1a" className="absolute left-[10%] top-0 hidden h-8 w-8 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[10%] top-6 hidden h-16 w-16 opacity-50 md:block" />

        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <span className="h-2 w-2 rounded-full bg-accent-orange" /> Services
        </span>
        <h1 className="mx-auto mt-6 inline-block font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          Expert HR advisory,{" "}
          <span className="relative inline-block">
            on your terms
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" animate />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-neutral-500">
          From a quick async document review to an executive retainer — choose the level of support
          that fits your situation. Pay securely, then book.
        </p>
      </section>

      {/* Catalog grouped by category */}
      {categoryOrder.map(({ key, blurb }) => {
        const items = serviceProducts.filter((product) => product.category === key);
        if (items.length === 0) return null;

        return (
          <section key={key} className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
            <div className="mb-8 max-w-2xl">
              <h2 className="font-display text-h2 font-extrabold tracking-tight text-primary-dark">
                {serviceCategoryLabels[key]}
              </h2>
              <p className="mt-3 text-body-lg text-neutral-500">{blurb}</p>
            </div>

            <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((service, index) => (
                <motion.article
                  key={service.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col gap-5 rounded-3xl border-2 border-primary-dark p-8 ${
                    service.featured
                      ? "bg-primary-dark text-on-primary shadow-pop-orange"
                      : "bg-neutral-100 transition-transform hover:-translate-y-1"
                  }`}
                >
                  {service.featured && (
                    <span className="absolute -top-3.5 left-8 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                      Most Popular
                    </span>
                  )}

                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${service.featured ? "border-accent-orange bg-accent-orange text-primary-dark" : "border-primary-dark bg-violet-tint text-primary-violet"}`}>
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <h3 className={`font-display text-h3 font-bold ${service.featured ? "text-on-primary" : "text-primary-dark"}`}>{service.name}</h3>
                    <p className={`mt-1 text-sm font-bold uppercase tracking-wider ${service.featured ? "text-orange-light" : "text-primary-violet"}`}>{service.subtitle}</p>
                  </div>

                  <p className={`leading-relaxed ${service.featured ? "text-on-primary/70" : "text-neutral-500"}`}>{service.description}</p>

                  <div className={`border-t-2 border-dashed pt-5 ${service.featured ? "border-white/15" : "border-neutral-300"}`}>
                    <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.16em] ${service.featured ? "text-orange-light" : "text-accent-orange"}`}>What you get</p>
                    <ul className="space-y-2.5">
                      {service.features.map((item) => (
                        <li key={item} className={`flex gap-2.5 text-sm ${service.featured ? "text-on-primary/80" : "text-neutral-500"}`}>
                          <CheckCircle2 className={service.featured ? "mt-0.5 shrink-0 text-accent-orange" : "mt-0.5 shrink-0 text-primary-violet"} size={16} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`mt-auto border-t-2 border-dashed pt-5 ${service.featured ? "border-white/15" : "border-neutral-300"}`}>
                    <p className={`text-xs font-bold uppercase tracking-[0.14em] ${service.featured ? "text-on-primary/60" : "text-neutral-400"}`}>{service.duration}</p>
                    <p className={`mt-1 font-display text-4xl font-extrabold ${service.featured ? "text-on-primary" : "text-primary-dark"}`}>
                      {formatUsd(service.amount)}
                      {service.priceNote && (
                        <span className={`text-xl font-bold ${service.featured ? "text-on-primary/60" : "text-neutral-400"}`}>{service.priceNote}</span>
                      )}
                    </p>
                    <Link
                      href="/booking"
                      className={`btn-pop mt-4 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark px-6 py-3.5 text-[15px] font-bold ${
                        service.featured ? "bg-accent-orange text-primary-dark shadow-pop-sm" : "bg-primary-dark text-on-primary"
                      }`}
                    >
                      {service.needsScheduling ? "Book Now" : "Get Started"}
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        );
      })}

      {/* Comparison */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <h2 className="mb-12 text-center font-display text-h2 font-extrabold tracking-tight text-primary-dark">How Humanly compares</h2>
        <div className="overflow-x-auto rounded-3xl border-2 border-primary-dark bg-neutral-100 shadow-pop-sm">
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

      {/* Confidentiality promise */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-on-primary shadow-pop-orange md:p-14">
          <Scribble variant="spiral" color="#ff6a1a" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
            <div>
              <ShieldCheck className="mb-6 text-accent-orange" size={40} />
              <h2 className="font-display text-h2 font-extrabold tracking-tight">The Confidentiality Promise</h2>
              <p className="mt-4 text-body-lg leading-relaxed text-on-primary/70">
                We do not alert employers, sell workplace data, or accept employer-side advisory work that would compromise individual trust. What you share stays in the room.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8">
              <h3 className="font-display text-2xl font-bold">Not sure where to start?</h3>
              <p className="mt-3 leading-relaxed text-on-primary/70">
                Most professionals begin with a single Individual Advisory Session. No commitment, strictly confidential — get your bearings and decide what comes next.
              </p>
              <Link
                href="/booking"
                className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-[5px_5px_0_0_#9d5cff]"
              >
                Book a session
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
