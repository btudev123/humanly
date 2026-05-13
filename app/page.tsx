"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

const stats = [
  { value: "100%", label: "confidential intake", detail: "No employer notification or shared access." },
  { value: "45 min", label: "strategy sessions", detail: "Focused guidance with written next steps." },
  { value: "UAE", label: "workplace rights focus", detail: "Built for regional employee concerns." },
  { value: "0", label: "corporate conflict", detail: "Humanly is designed for the individual." },
];

const services = [
  "Harassment or bullying documentation",
  "PIP and performance response strategy",
  "Contract, resignation, and severance guidance",
  "Manager conflict and HR meeting preparation",
];

const steps = [
  {
    icon: MessageSquare,
    title: "Private intake",
    copy: "Share the workplace issue in plain language. You decide how much detail to provide.",
  },
  {
    icon: Search,
    title: "Situation audit",
    copy: "We map facts, risks, leverage, timelines, documents, and likely employer responses.",
  },
  {
    icon: ClipboardCheck,
    title: "Action plan",
    copy: "Leave with scripts, questions to ask, escalation options, and a calm sequence of next steps.",
  },
];

const testimonials = [
  {
    quote: "The advice was specific enough to use the same day. I stopped guessing and knew exactly how to respond.",
    role: "Senior operations manager",
    outcome: "Documented a workplace concern before escalation",
  },
  {
    quote: "I needed someone who understood HR systems but was clearly not on the company's side. That distinction mattered.",
    role: "Technology employee",
    outcome: "Prepared a PIP response and meeting script",
  },
  {
    quote: "The session helped me negotiate an exit without burning the relationship or signing too quickly.",
    role: "Commercial director",
    outcome: "Reviewed redundancy and severance options",
  },
];

const pricing = [
  {
    name: "Clarity Consultation",
    price: "$120",
    description: "Best for one urgent question or a first read on your situation.",
    features: ["45-minute private session", "Risk and leverage map", "Written action summary"],
  },
  {
    name: "Advocacy Plan",
    price: "$340",
    description: "Best for active conflict, PIPs, harassment concerns, or exits.",
    features: ["Two strategy sessions", "Document review checklist", "Email and meeting scripts", "Seven days of follow-up"],
    featured: true,
  },
  {
    name: "For Organizations",
    price: "Custom",
    description: "Confidential external support for teams and growing companies.",
    features: ["Employee-safe intake", "Aggregated insights only", "Privacy-led implementation"],
  },
];

const faqs = [
  {
    q: "Will my employer know I booked?",
    a: "No. Humanly does not notify employers, connect to company systems, or share your intake details.",
  },
  {
    q: "Is Humanly a law firm?",
    a: "No. We provide HR advocacy, workplace strategy, and education. If legal representation is needed, we help you prepare better questions for counsel.",
  },
  {
    q: "What should I bring?",
    a: "Bring contracts, emails, messages, meeting notes, timelines, or just the story. The first job is to create clarity.",
  },
];

function OutcomeCarousel() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-2xl font-semibold leading-snug text-slate-950">"{current.quote}"</p>
          <div className="mt-7 border-t border-slate-200 pt-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary-violet">{current.role}</p>
            <p className="mt-2 text-slate-600">{current.outcome}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-2">
          {testimonials.map((item, itemIndex) => (
            <button
              key={item.role}
              aria-label={`Show story ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-2 rounded-full transition-all ${index === itemIndex ? "w-9 bg-primary-purple" : "w-2 bg-slate-300"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous story"
            onClick={() => setIndex((value) => (value - 1 + testimonials.length) % testimonials.length)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-950 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next story"
            onClick={() => setIndex((value) => (value + 1) % testimonials.length)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-950 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQPreview() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {faqs.map((faq, index) => (
        <div key={faq.q} className="p-6">
          <button className="flex w-full items-center justify-between gap-5 text-left" onClick={() => setOpen(open === index ? -1 : index)}>
            <span className="text-lg font-bold text-slate-950">{faq.q}</span>
            <span className="text-xl text-primary-violet">{open === index ? "-" : "+"}</span>
          </button>
          <AnimatePresence>
            {open === index && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4 leading-relaxed text-slate-600"
              >
                {faq.a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#f7f5f2] text-slate-950">
      <section className="relative overflow-hidden px-5 pb-20 pt-28">
        <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_80%_10%,rgba(124,53,227,0.18),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f7f5f2_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
              <LockKeyhole size={14} className="text-primary-violet" />
              Confidential workplace advocacy
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 md:text-7xl lg:text-[5.6rem] lg:leading-[0.94]">
              Professional HR support when the workplace stops feeling safe.
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-slate-600">
              Humanly helps employees understand their options, prepare the right language, and move through difficult workplace situations with dignity and confidentiality.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/booking" className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary-purple px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl shadow-primary-purple/20 transition hover:-translate-y-0.5 hover:bg-primary-violet">
                <CalendarCheck size={18} />
                Book Consultation
              </Link>
              <Link href="/services" className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-slate-900 transition hover:-translate-y-0.5 hover:border-primary-purple">
                View Services
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-primary-violet" size={18} />
                  {service}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[540px]">
            <motion.div
              animate={{ y: [0, -10, 0], rotateX: [0, 2, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 top-6 mx-auto max-w-[560px] rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-primary-purple/15 backdrop-blur"
            >
              <div className="rounded-[1.4rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Private case room</p>
                    <h2 className="mt-2 text-2xl font-semibold">Workplace strategy plan</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Encrypted</span>
                </div>
                <div className="mt-8 grid gap-4">
                  {[
                    ["Concern", "Manager retaliation after formal complaint"],
                    ["Priority", "Protect record and preserve evidence"],
                    ["Next step", "Draft neutral escalation email"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">{label}</p>
                      <p className="mt-2 font-medium text-white/90">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 left-0 w-[280px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            >
              <ShieldCheck className="text-primary-violet" size={26} />
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Confidentiality promise</p>
              <p className="mt-2 text-lg font-semibold leading-snug">No employer notification. No company access. No shared transcripts.</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-4 w-[250px] rounded-2xl bg-primary-purple p-5 text-white shadow-xl shadow-primary-purple/25"
            >
              <Users size={24} className="text-secondary-orange" />
              <p className="mt-4 text-4xl font-semibold">45 min</p>
              <p className="mt-1 text-sm text-white/70">Focused strategy session with a written action summary.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-4xl font-semibold text-primary-purple">{stat.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-violet">How it works</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">A clear process for unclear moments.</h2>
            </div>
            <p className="text-xl leading-relaxed text-slate-600">
              The goal is not dramatic branding. It is a calm system that helps people make better decisions before a high-stakes conversation.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-violet/10 text-primary-violet">
                  <step.icon size={22} />
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{step.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-violet">Success stories</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">Credible outcomes, anonymized by design.</h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              No fake enterprise logo strip. Humanly builds trust through clear process, precise outcomes, and privacy-preserving stories.
            </p>
          </div>
          <OutcomeCarousel />
        </div>
      </section>

      <section className="px-5 py-20" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-violet">Pricing</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">Transparent support. No surprise retainers.</h2>
            </div>
            <Link href="/booking" className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary-purple px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
              Book Consultation
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-7 ${plan.featured ? "border-primary-purple bg-primary-purple text-white shadow-xl shadow-primary-purple/20" : "border-slate-200 bg-white"}`}>
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className={`mt-3 leading-relaxed ${plan.featured ? "text-white/72" : "text-slate-600"}`}>{plan.description}</p>
                <p className="mt-8 text-5xl font-semibold">{plan.price}</p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CheckCircle2 className={plan.featured ? "text-secondary-orange" : "text-primary-violet"} size={20} />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-violet">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">Designed for people who need privacy first.</h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              Common questions about confidentiality, scope, and how the consultation works.
            </p>
            <Link href="/faq" className="mt-8 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-purple">
              View all questions
              <ArrowRight size={18} />
            </Link>
          </div>
          <FAQPreview />
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto rounded-[2rem] bg-slate-950 p-8 text-white md:p-12 lg:max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-secondary-orange">Start privately</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
                Get a professional plan before your next workplace conversation.
              </h2>
            </div>
            <Link href="/booking" className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-5 text-sm font-bold uppercase tracking-[0.14em] text-slate-950">
              <CalendarCheck size={18} />
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
