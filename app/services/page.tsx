"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
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
    price: "AED 1,800/month",
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

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-neutral-bg pb-24 pt-28">
      {/* Header */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto text-center relative">
        <Scribble variant="sparkle" className="absolute -top-8 -left-8 md:-left-16 w-24 h-24 text-amber/30" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-violet">Services</p>
        <h1 className="mt-5 font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark max-w-3xl mx-auto relative inline-block">
          A Confidential Reality Check.
          <Scribble variant="underline" className="absolute -bottom-3 left-0 w-full h-4 text-amber" />
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
          Practical strategy without legal complexity. Three tiers, one mission: getting you clarity and control.
        </p>
      </section>

      {/* Services Grid */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-16 grid gap-6 md:grid-cols-3">
        {services.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-lg p-8 flex flex-col gap-6 relative group ${
              service.highlight
                ? "bg-primary-dark text-white shadow-2xl shadow-primary-dark/25 ring-2 ring-primary-violet md:-translate-y-4"
                : "bg-white border border-neutral-300 shadow-sm hover:shadow-lg"
            }`}
          >
            {service.highlight && (
              <>
                <Scribble variant="circle" className="absolute -top-6 -right-6 w-16 h-16 text-amber" color="#FDA544" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-primary-dark font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1 rounded-full z-10">
                  Most Popular
                </span>
              </>
            )}

            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              service.highlight ? "bg-primary-violet text-white" : "bg-primary-violet/10 text-primary-violet"
            }`}>
              <Sparkles size={22} />
            </div>

            <div>
              <h2 className={`text-2xl font-extrabold leading-tight ${service.highlight ? "text-white" : "text-primary-dark"}`}>
                {service.title}
              </h2>
              <p className={`mt-1 font-semibold text-sm uppercase tracking-[0.12em] ${service.highlight ? "text-amber" : "text-primary-violet"}`}>
                {service.sub}
              </p>
            </div>

            <p className={`text-base leading-relaxed ${service.highlight ? "text-white/70" : "text-neutral-500"}`}>
              {service.scope}
            </p>

            <div className={`pt-4 border-t ${service.highlight ? "border-white/10" : "border-neutral-300"}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber mb-3">What You Get</p>
              <ul className="space-y-2.5">
                {service.process.map((item) => (
                  <li key={item} className={`flex gap-2.5 text-sm ${service.highlight ? "text-white/80" : "text-neutral-500"}`}>
                    <CheckCircle2 className="mt-0.5 shrink-0 text-primary-violet" size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`pt-4 border-t ${service.highlight ? "border-white/10" : "border-neutral-300"}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber mb-2">Who It's For</p>
              <p className={`text-sm leading-relaxed ${service.highlight ? "text-white/70" : "text-neutral-500"}`}>
                {service.for}
              </p>
            </div>

            <div className="mt-auto pt-4">
              <p className={`text-2xl font-extrabold mb-4 ${service.highlight ? "text-white" : "text-primary-dark"}`}>
                {service.price}
              </p>
              <Link
                href="/booking"
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-[0.12em] transition-all ${
                  service.highlight
                    ? "bg-amber text-primary-dark hover:bg-amber/90"
                    : "bg-primary-violet text-white hover:bg-primary-dark"
                }`}
              >
                Book Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Comparison Table */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24">
        <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark text-center mb-12">
          How Humanly Compares
        </h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-300 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="p-5 font-bold text-sm uppercase tracking-[0.12em] text-primary-dark">Aspect</th>
                <th className="p-5 font-bold text-sm uppercase tracking-[0.12em] text-neutral-500">Internal HR</th>
                <th className="p-5 font-bold text-sm uppercase tracking-[0.12em] text-primary-violet bg-primary-violet/5">Humanly</th>
                <th className="p-5 font-bold text-sm uppercase tracking-[0.12em] text-neutral-500">Employment Lawyer</th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-500">
              {[
                { aspect: "Who they protect", hr: "The company", humanly: "You, the individual", lawyer: "Your legal position" },
                { aspect: "Confidentiality", hr: "Limited — reports to management", humanly: "Absolute — no employer contact", lawyer: "Attorney-client privilege" },
                { aspect: "Cost", hr: "Free (but conflicted)", humanly: "AED 550–1,800", lawyer: "AED 2,000–5,000+" },
                { aspect: "Approach", hr: "Policy-driven", humanly: "Human-centered, practical", lawyer: "Litigation-focused" },
                { aspect: "Speed", hr: "Slow — internal processes", humanly: "Same-week sessions, 48h reports", lawyer: "Weeks to months" },
                { aspect: "Emotional support", hr: "Not their role", humanly: "Core to the approach", lawyer: "Not their role" },
              ].map((row, i) => (
                <tr key={row.aspect} className={`border-t border-neutral-300 ${i % 2 === 0 ? "bg-neutral-bg/50" : ""}`}>
                  <td className="p-5 font-semibold text-primary-dark">{row.aspect}</td>
                  <td className="p-5">{row.hr}</td>
                  <td className="p-5 font-semibold text-primary-violet bg-primary-violet/5">{row.humanly}</td>
                  <td className="p-5">{row.lawyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confidentiality Promise */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24">
        <div className="rounded-lg bg-primary-dark p-10 md:p-14 text-white relative overflow-hidden">
          <Scribble variant="sparkle" className="absolute top-6 right-6 w-20 h-20 text-amber/30" />
          <div className="relative z-10 grid md:grid-cols-[1fr_1fr] gap-10 items-center">
            <div>
              <ShieldCheck className="text-amber mb-6" size={40} />
              <h2 className="font-extrabold text-[32px] leading-[1.3] mb-4">The Confidentiality Promise</h2>
              <p className="text-lg leading-relaxed text-white/70">
                We do not alert employers, sell workplace data, or accept employer-side advisory work that would compromise individual trust. What you share stays in the room.
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-8 ring-1 ring-white/10">
              <h3 className="font-extrabold text-2xl mb-3">Most professionals book The Triage first.</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                No commitment. Strictly confidential. A one-hour session to get your bearings and decide what comes next.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-amber text-primary-dark px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-[0.12em] hover:bg-amber/90 transition-colors"
              >
                Book Your Triage
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}