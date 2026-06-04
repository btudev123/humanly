"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const services = [
  {
    title: "The Triage",
    sub: "60-Minute Advisory",
    scope: "A private consultation for verbal guidance and clarity on immediate next steps.",
    price: "AED 550",
    process: [
      "Confidential intake review",
      "60-minute Zoom consultation",
      "Verbal guidance and action items",
      "Follow-up resource recommendations",
    ],
    for: "Professionals facing a specific situation — a PIP, a difficult conversation, or a policy question — who need clarity fast.",
    highlight: false,
  },
  {
    title: "The Strategy",
    sub: "Written Follow-Up Report",
    scope: "A structured document including situation summary, risk view, recommended actions, and suggested scripts.",
    price: "AED 950",
    process: [
      "Everything in The Triage",
      "Written situation analysis",
      "Risk assessment and options map",
      "Suggested scripts and talking points",
      "48-hour report turnaround",
    ],
    for: "Professionals who need a tangible, documented plan to reference — ideal for formal processes, negotiations, or complex situations.",
    highlight: true,
  },
  {
    title: "The Retainer",
    sub: "Ongoing Monthly Support",
    scope: "For complex situations requiring message review, strategy check-ins, and emotional containment over time.",
    price: "AED 1,800/mo",
    process: [
      "Two strategy sessions per month",
      "Message and document review between sessions",
      "Priority WhatsApp access",
      "Ongoing situation monitoring",
      "Monthly written summary",
    ],
    for: "Professionals in protracted situations — long investigations, extended negotiations, or those who want a trusted advisor on call.",
    highlight: false,
  },
];

const comparison = [
  { aspect: "Who they protect", hr: "The company", humanly: "You, the individual", lawyer: "Your legal position" },
  { aspect: "Confidentiality", hr: "Limited — reports to management", humanly: "Absolute — no employer contact", lawyer: "Attorney-client privilege" },
  { aspect: "Cost", hr: "Free (but conflicted)", humanly: "AED 550–1,800", lawyer: "AED 2,000–5,000+" },
  { aspect: "Approach", hr: "Policy-driven", humanly: "Human-centered, practical", lawyer: "Litigation-focused" },
  { aspect: "Speed", hr: "Slow — internal processes", humanly: "Same-week sessions, 48h reports", lawyer: "Weeks to months" },
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
          A confidential{" "}
          <span className="relative inline-block">
            reality check
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" animate />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-neutral-500">
          Practical strategy without legal complexity. Three tiers, one mission: getting you clarity and control.
        </p>
      </section>

      {/* Services grid */}
      <section className="mx-auto mt-16 grid max-w-max-width gap-6 px-margin-mobile md:grid-cols-3 md:px-margin-desktop">
        {services.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex flex-col gap-6 rounded-3xl border-2 border-primary-dark p-8 ${
              service.highlight
                ? "bg-primary-dark text-on-primary shadow-pop-orange md:-translate-y-4 md:rotate-[-1deg]"
                : "bg-neutral-100 transition-transform hover:-translate-y-1"
            }`}
          >
            {service.highlight && (
              <>
                <Scribble variant="star-fill" color="#ff6a1a" className="absolute -right-3 -top-3 h-9 w-9 animate-wiggle" />
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                  Most Popular
                </span>
              </>
            )}

            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${service.highlight ? "border-accent-orange bg-accent-orange text-primary-dark" : "border-primary-dark bg-violet-tint text-primary-violet"}`}>
              <Sparkles size={22} />
            </div>

            <div>
              <h2 className={`font-display text-h3 font-bold ${service.highlight ? "text-on-primary" : "text-primary-dark"}`}>{service.title}</h2>
              <p className={`mt-1 text-sm font-bold uppercase tracking-wider ${service.highlight ? "text-orange-light" : "text-primary-violet"}`}>{service.sub}</p>
            </div>

            <p className={`leading-relaxed ${service.highlight ? "text-on-primary/70" : "text-neutral-500"}`}>{service.scope}</p>

            <div className={`border-t-2 border-dashed pt-5 ${service.highlight ? "border-white/15" : "border-neutral-300"}`}>
              <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.16em] ${service.highlight ? "text-orange-light" : "text-accent-orange"}`}>What you get</p>
              <ul className="space-y-2.5">
                {service.process.map((item) => (
                  <li key={item} className={`flex gap-2.5 text-sm ${service.highlight ? "text-on-primary/80" : "text-neutral-500"}`}>
                    <CheckCircle2 className={service.highlight ? "mt-0.5 shrink-0 text-accent-orange" : "mt-0.5 shrink-0 text-primary-violet"} size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`border-t-2 border-dashed pt-5 ${service.highlight ? "border-white/15" : "border-neutral-300"}`}>
              <p className={`mb-2 text-[11px] font-bold uppercase tracking-[0.16em] ${service.highlight ? "text-orange-light" : "text-accent-orange"}`}>Who it&apos;s for</p>
              <p className={`text-sm leading-relaxed ${service.highlight ? "text-on-primary/70" : "text-neutral-500"}`}>{service.for}</p>
            </div>

            <div className="mt-auto pt-2">
              <p className={`mb-4 font-display text-4xl font-extrabold ${service.highlight ? "text-on-primary" : "text-primary-dark"}`}>{service.price}</p>
              <Link
                href="/booking"
                className={`btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark px-6 py-3.5 text-[15px] font-bold ${
                  service.highlight ? "bg-accent-orange text-primary-dark shadow-pop-sm" : "bg-primary-dark text-on-primary"
                }`}
              >
                Book Now
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </motion.article>
        ))}
      </section>

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
              <h3 className="font-display text-2xl font-bold">Most professionals book The Triage first.</h3>
              <p className="mt-3 leading-relaxed text-on-primary/70">
                No commitment. Strictly confidential. A one-hour session to get your bearings and decide what comes next.
              </p>
              <Link
                href="/booking"
                className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-[5px_5px_0_0_#9d5cff]"
              >
                Book Your Triage
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
