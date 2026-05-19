"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { Scribble } from "@/components/ui/Scribble";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LockKeyhole,
  ShieldCheck,
  MessageSquare,
  Search,
  ClipboardCheck,
  Users,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Copy & data                                                       */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "100%", label: "Confidential", detail: "No employer notification or shared access." },
  { value: "45 min", label: "Strategy Sessions", detail: "Focused guidance with written next steps." },
  { value: "UAE", label: "Regional Focus", detail: "Built for GCC workplace rights and employee concerns." },
  { value: "0", label: "Corporate Conflict", detail: "Humanly advocates exclusively for the individual." },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "Safe Space",
    description: "Speak freely without fear of your employer finding out. Every conversation is privileged and confidential by design.",
  },
  {
    icon: Search,
    title: "Reality Check",
    description: "Get an honest, evidence-based assessment of your situation — what the law says, what your employer is likely to do, and where your leverage is.",
  },
  {
    icon: ClipboardCheck,
    title: "Clear Next Steps",
    description: "Leave with scripts, questions to ask, documents to prepare, and a calm sequence of actions you can take the same day.",
  },
];

const services = [
  {
    name: "The Triage",
    price: "550 AED",
    duration: "60-Minute Advisory",
    description: "A private consultation for verbal guidance and clarity on immediate next steps.",
    features: ["60-minute confidential session", "Situation mapping", "Verbal action plan"],
    featured: false,
    icon: MessageSquare,
  },
  {
    name: "The Strategy",
    price: "950 AED",
    duration: "Written Follow-Up Report",
    description: "A structured document including situation summary, risk view, recommended actions, and suggested scripts.",
    features: ["Confidential session", "Document review checklist", "Written report", "Email & meeting scripts", "48-hour turnaround"],
    featured: true,
    icon: FileText,
  },
  {
    name: "The Retainer",
    price: "Custom",
    duration: "Ongoing Monthly Support",
    description: "For complex situations requiring message review, strategy check-ins, and ongoing containment.",
    features: ["Monthly strategy sessions", "Message & email review", "Real-time guidance", "Priority access"],
    featured: false,
    icon: Users,
  },
];

const triggers = [
  { icon: "trending_down", label: "Delayed promotions or blocked career growth" },
  { icon: "groups", label: "Toxic manager or hostile hierarchy" },
  { icon: "warning", label: "Performance warnings or investigations" },
  { icon: "battery_0_bar", label: "Burnout and boundary violations" },
  { icon: "gavel", label: "Wrongful termination or redundancy fears" },
  { icon: "travel_explore", label: "Visa uncertainty or relocation pressure" },
];

const steps = [
  {
    icon: MessageSquare,
    title: "Private Intake",
    copy: "Share your workplace issue in plain language. No complex forms — just a human-centred understanding of your unique situation.",
  },
  {
    icon: Search,
    title: "Virtual Session",
    copy: "Meet face-to-face over Zoom. We provide a safe, neutral space to map risks, options, and your next move.",
  },
  {
    icon: ClipboardCheck,
    title: "48-Hour Report",
    copy: "Walk away with a comprehensive action plan within 48 hours. Clarity, legal grounding, and peace of mind delivered fast.",
  },
];

const trustSignals = [
  {
    quote: "Founded by Karma Harb after 20+ years inside HR leadership across UAE, Saudi Arabia, and international environments.",
    role: "Founder credibility",
    outcome: "Real operator experience, not invented reviews",
  },
  {
    quote: "Humanly does not publish testimonials until they are verified, consented, and privacy-safe.",
    role: "Early-stage transparency",
    outcome: "No fake client quotes or borrowed social proof",
  },
  {
    quote: "Future video or Instagram testimonials will load as lightweight thumbnails with transcripts before third-party embeds.",
    role: "Performance-first proof",
    outcome: "SEO context without slowing the page",
  },
];

const faqs = [
  {
    q: "Will my employer know I booked a session?",
    a: "No. Humanly does not notify employers, connect to company systems, or share your intake details with anyone. Every session is strictly confidential.",
  },
  {
    q: "Is Humanly a law firm?",
    a: "No. We provide HR advocacy, workplace strategy, and rights education. We are not employment lawyers. If legal representation is needed, we help you prepare better questions for counsel.",
  },
  {
    q: "What should I bring to the session?",
    a: "Bring contracts, emails, messages, meeting notes, timelines — or just your story. Our first job is to create clarity from wherever you are starting.",
  },
  {
    q: "Will the session be recorded?",
    a: "No. Sessions are never recorded. You receive a written summary of key points and recommended next steps within 48 hours.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. You can reschedule or cancel up to 24 hours before your session with no charge. We understand that workplace situations are unpredictable.",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const current = trustSignals[index];

  const prev = useCallback(() => setIndex((v) => (v - 1 + trustSignals.length) % trustSignals.length), []);
  const next = useCallback(() => setIndex((v) => (v + 1) % trustSignals.length), []);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm relative overflow-hidden">
      <Scribble variant="sparkle" className="absolute top-4 right-8 w-16 h-16 text-secondary-orange/20" />
      <AnimatePresence mode="wait">
        <motion.div
          key={current.quote}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-2xl font-semibold leading-snug text-on-surface italic">
            &ldquo;{current.quote}&rdquo;
          </p>
          <div className="mt-8 border-t border-outline-variant pt-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-secondary">{current.role}</p>
            <p className="mt-2 text-on-surface-variant">{current.outcome}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-2">
          {trustSignals.map((_, i) => (
            <button
              key={i}
              aria-label={`Story ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === i ? "w-10 bg-secondary" : "w-2 bg-outline-variant"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-primary-container hover:text-on-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-primary-container hover:text-on-primary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest">
      {faqs.map((faq, i) => (
        <div key={faq.q} className="p-6">
          <button
            className="flex w-full items-center justify-between gap-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-lg font-semibold text-on-surface">{faq.q}</span>
            <span className={`text-2xl transition-colors ${open === i ? "text-secondary" : "text-on-surface-variant"}`}>
              {open === i ? "−" : "+"}
            </span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4 leading-relaxed text-on-surface-variant"
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  /* Sticky mobile CTA bar after 30% scroll */
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.3);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased">

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-margin-mobile md:px-margin-desktop pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(124,53,227,0.10),transparent_40%),linear-gradient(180deg,#ffffff_0%,#faf9f9_100%)]" />
        <Scribble variant="loop" className="absolute top-20 left-10 w-48 h-48 text-secondary-orange/15 -rotate-12 hidden md:block" />
        <Scribble variant="sparkle" className="absolute bottom-10 right-10 w-32 h-32 text-secondary/10 hidden md:block" />

        <div className="relative mx-auto max-w-max-width grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          {/* Left: Copy */}
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant shadow-sm">
              <LockKeyhole size={14} className="text-secondary" />
              100% Confidential · GCC Professionals · 20+ Yrs Experience
            </div>

            <h1 className="max-w-4xl font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-primary relative inline-block">
              Your HR isn't on your side.
              <br />
              <span className="relative inline-block">
                We are.
                <Scribble variant="underline" className="absolute -bottom-3 left-0 w-full h-4 text-secondary-orange" color="#FDA544" />
              </span>
            </h1>

            <p className="mt-6 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Independent, neutral, and confidential HR advisory for professionals navigating workplace challenges in the UAE and GCC.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-secondary text-on-secondary px-8 py-4 font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-xl shadow-secondary/20"
              >
                <CalendarCheck size={18} />
                Book a Confidential Session
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest px-8 py-4 font-label-bold text-label-bold text-on-surface hover:border-secondary transition-colors"
              >
                View Services
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust markers */}
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {[
                "No employer notification",
                "Strictly confidential by design",
                "UAE & GCC labour law expertise",
                "Written action plan within 48 hours",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm font-medium text-on-surface-variant">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-secondary" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating visual */}
          <div className="relative min-h-[480px] md:min-h-[560px]">
            <motion.div
              animate={{ y: [0, -12, 0], rotateX: [0, 2, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 top-0 mx-auto max-w-[480px] rounded-[2rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-2xl shadow-primary/10"
            >
              <div className="rounded-[1.4rem] bg-primary-container p-6 text-on-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-primary/60">Private Case Room</p>
                    <h2 className="mt-2 text-2xl font-semibold text-on-primary">Workplace Strategy Plan</h2>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">Encrypted</span>
                </div>
                <div className="mt-8 grid gap-4">
                  {[
                    ["Concern", "Manager retaliation after formal complaint"],
                    ["Priority", "Protect record and preserve evidence"],
                    ["Next Step", "Draft neutral escalation email"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-on-primary/10 bg-on-primary/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-primary/50">{label}</p>
                      <p className="mt-2 font-medium text-on-primary/90">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-16 left-0 w-[260px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xl"
            >
              <ShieldCheck className="text-secondary" size={26} />
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Confidentiality Promise</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-on-surface">No employer notification. No shared access. No recordings.</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 right-4 w-[230px] rounded-2xl bg-primary p-5 text-on-primary shadow-xl shadow-primary/25"
            >
              <Users size={24} className="text-secondary-orange" />
              <p className="mt-4 text-4xl font-extrabold">45 min</p>
              <p className="mt-1 text-sm text-on-primary/70">Focused strategy session with written action summary.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="border-y border-outline-variant bg-surface-container-low px-margin-mobile md:px-margin-desktop py-10">
        <div className="mx-auto max-w-max-width grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-center md:text-left">
              <p className="text-4xl font-extrabold text-primary">{stat.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">{stat.label}</p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ THE PROBLEM — Unsafe Middle Ground ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="text-center mb-16 relative">
            <h2 className="font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-primary relative inline-block">
              Caught in the unsafe middle ground?
              <Scribble variant="underline" className="absolute -bottom-4 left-0 w-full h-4 text-secondary-orange" color="#FDA544" />
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-2xl mx-auto">
              Navigating workplace issues often leaves employees trapped between conflicting interests. It doesn't have to be this way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
            {/* Internal HR */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 relative flex flex-col h-full">
              <div className="absolute -top-6 -right-6 text-error rotate-12 z-20">
                <svg fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 48 48" width="48">
                  <path d="M24 4L4 40H44L24 4Z" strokeLinejoin="round" />
                  <path d="M24 16V28" />
                  <circle cx="24" cy="36" fill="currentColor" r="1" />
                  <path d="M3 41 C15 42, 35 39, 45 41" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4">
                  <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-2">Internal HR</h3>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-xs">The Company</p>
              </div>
              <div className="space-y-6 flex-grow border-t border-outline-variant pt-6">
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-surface mb-1">Mandate:</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Protect the Business</p>
                </div>
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-surface mb-1">Perception:</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Unsafe for the employee.</p>
                </div>
              </div>
            </div>

            {/* Humanly (highlighted) */}
            <div className="bg-primary-container text-on-primary rounded-xl p-8 relative flex flex-col h-full transform md:-translate-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#56348a] z-10">
              <div className="absolute -top-8 -left-8 text-secondary-orange -rotate-12 z-20">
                <svg fill="none" height="64" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 64 64" width="64">
                  <path d="M32 4V12M32 52V60M4 32H12M52 32H60M12 12L18 18M46 46L52 52M12 52L18 46M46 18L52 12" />
                  <path d="M30 6V14M8 30H16" strokeWidth="1" />
                </svg>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-on-secondary mb-4">
                  <span className="material-symbols-outlined text-[28px] fill-icon">balance</span>
                </div>
                <h3 className="font-h3 text-h3 text-on-primary mb-2">Humanly</h3>
                <p className="font-label-bold text-label-bold text-secondary-fixed uppercase tracking-wider text-xs">The Sweet Spot</p>
              </div>
              <div className="space-y-6 flex-grow border-t border-on-primary-fixed-variant pt-6">
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-primary mb-1">Mandate:</h4>
                  <p className="font-body-md text-body-md text-inverse-primary">Protect the Individual</p>
                </div>
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-primary mb-1">Perception:</h4>
                  <p className="font-body-md text-body-md text-inverse-primary">Dignified & Neutral.</p>
                </div>
              </div>
            </div>

            {/* Employment Lawyers */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 relative flex flex-col h-full">
              <div className="absolute -top-6 -right-4 text-outline rotate-45 z-20">
                <svg fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 48 48" width="48">
                  <path d="M16 20L28 32" />
                  <rect height="24" rx="2" transform="rotate(45 22 8)" width="16" x="22" y="8" />
                  <path d="M8 38H40" />
                  <path d="M15 19L29 33M23 9L39 25" strokeWidth="1" />
                </svg>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4">
                  <span className="material-symbols-outlined text-[28px]">gavel</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-2">Employment Lawyers</h3>
                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider text-xs">The Extreme</p>
              </div>
              <div className="space-y-6 flex-grow border-t border-outline-variant pt-6">
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-surface mb-1">Mandate:</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Litigation</p>
                </div>
                <div>
                  <h4 className="font-label-bold text-label-bold text-on-surface mb-1">Perception:</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Expensive & Aggressive.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT HUMANLY IS — 3 Pillars ============ */}
      <section className="bg-surface-container-low px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="text-center mb-16">
            <h2 className="font-h2 text-h2 md:text-[40px] text-primary">What Humanly Is</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl mx-auto">
              Practical strategy without legal complexity — built on three core principles.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center relative group hover:bg-surface-container-low transition-colors duration-300"
              >
                <Scribble variant="sparkle" className="absolute top-4 right-6 w-12 h-12 text-secondary-orange/20 group-hover:text-secondary-orange/40 transition-opacity" />
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-on-secondary mx-auto mb-6">
                  <pillar.icon size={26} />
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-3">{pillar.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES + PRICING ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24" id="services">
        <div className="mx-auto max-w-max-width">
          <div className="text-center mb-16 relative">
            <h2 className="font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-primary relative inline-block">
              A Confidential Reality Check
              <Scribble variant="underline" className="absolute -bottom-4 left-0 w-full h-4 text-secondary-orange" color="#FDA544" />
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-xl mx-auto">
              Three ways to work with us — from a single session to ongoing support.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            {services.map((service) => (
              <div
                key={service.name}
                className={`rounded-xl p-8 flex flex-col gap-6 relative group transition-colors duration-300 ${
                  service.featured
                    ? "bg-surface-container border-2 border-secondary shadow-lg z-20"
                    : "bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                {service.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-label-bold text-caption px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {service.featured && (
                  <Scribble variant="sparkle" className="absolute -top-6 -right-6 w-16 h-16 text-secondary-orange/40 pointer-events-none" />
                )}
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <service.icon size={22} />
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-primary mb-2">{service.name}</h3>
                  <p className="font-label-bold text-label-bold text-secondary mb-4">{service.duration}</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">{service.description}</p>
                </div>
                <p className="text-4xl font-extrabold text-primary">{service.price}</p>
                <ul className="space-y-3 flex-grow">
                  {service.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <CheckCircle2 className={service.featured ? "text-secondary-orange" : "text-secondary"} size={20} />
                      <span className="font-medium text-on-surface">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/booking"
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-label-bold text-label-bold transition-colors ${
                    service.featured
                      ? "bg-secondary text-on-secondary hover:bg-primary-container"
                      : "border border-outline-variant text-on-surface hover:border-secondary"
                  }`}
                >
                  <CalendarCheck size={18} />
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOUNDER ============ */}
      <section className="bg-surface-container-low px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            {/* Left: Photo */}
            <div className="md:col-span-5 md:col-start-1 relative order-2 md:order-1 mt-12 md:mt-0">
              <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest relative aspect-[4/5]">
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-lg">
                  <div className="text-center">
                    <Users size={64} className="mx-auto text-secondary/40 mb-4" />
                    <p className="font-semibold">Karma Harb</p>
                    <p className="text-sm">Founder & Lead Advisor</p>
                  </div>
                </div>
              </div>
              <Scribble variant="loop" className="absolute -top-8 -left-8 w-24 h-24 text-secondary-orange opacity-80 pointer-events-none" color="#FDA544" />
            </div>

            {/* Right: Copy */}
            <div className="md:col-span-6 md:col-start-7 flex flex-col gap-8 order-1 md:order-2">
              <h2 className="font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-on-surface">
                Executive Experience.
                <br className="hidden md:block" />
                <span className="text-secondary">Human Approach.</span>
              </h2>

              <div className="flex flex-col gap-4 relative">
                <div className="inline-block relative w-max">
                  <h3 className="font-h2 text-h2 text-on-surface">Karma Harb, Founder</h3>
                  <Scribble variant="underline" className="absolute -bottom-2 left-0 w-full h-3 text-secondary-orange" color="#FDA544" />
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-prose leading-relaxed mt-4">
                  20+ years in Human Resources across the UAE, Saudi Arabia, and international environments. Combines the strategic weight of a C-Suite executive with the empathy of a coach.
                </p>
              </div>

              <div className="mt-4 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl relative">
                <div className="absolute -top-4 -left-4 bg-secondary text-on-secondary rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">format_quote</span>
                </div>
                <p className="font-h3 text-h3 text-primary italic">
                  &ldquo;Everyone deserves to feel heard at work.&rdquo;
                </p>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-3 text-secondary font-label-bold text-label-bold hover:text-primary-container transition-colors"
              >
                Read Karma's full story
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO THIS IS FOR — Trigger Grid ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="text-center mb-16 relative">
            <h2 className="font-h2 text-h2 md:text-[40px] text-primary">Is This You?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl mx-auto">
              Workplace challenges shouldn't be faced alone. If any of these resonate, we can help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {triggers.map((trigger, i) => (
              <motion.div
                key={trigger.icon}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 relative overflow-hidden group hover:bg-surface-container-low transition-colors duration-300"
              >
                <Scribble variant="sparkle" className="absolute top-4 right-4 w-10 h-10 text-secondary-orange/20 group-hover:text-secondary-orange/40 transition-opacity" />
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-on-secondary mb-6">
                  <span className="material-symbols-outlined text-[28px] fill-icon">{trigger.icon}</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-2 relative z-10">{trigger.label}</h3>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-secondary text-on-secondary px-8 py-4 font-label-bold text-label-bold hover:bg-primary-container transition-colors shadow-xl shadow-secondary/20"
            >
              <CalendarCheck size={18} />
              Get Confidential Support
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-surface-container-low px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="text-center mb-16">
            <p className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4">Low Overhead. High Efficiency.</p>
            <h2 className="font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-primary relative inline-block">
              From chaos to clarity in 48 hours.
              <Scribble variant="underline" className="absolute -bottom-3 left-0 w-full h-4 text-secondary-orange" color="#FDA544" />
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-2xl mx-auto">
              Our streamlined process cuts through corporate red tape, delivering actionable insights and emotional support when you need it most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-gutter relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[4px] z-0">
              <svg className="text-secondary-orange w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,10 Q250,20 500,10 T1000,10" stroke="currentColor" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="4" />
              </svg>
            </div>

            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center group relative z-10">
                <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <step.icon size={28} />
                  </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full shadow-sm relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-label-bold text-caption px-3 py-1 rounded-full">
                    Step {i + 1}
                  </span>
                  <h3 className="font-h3 text-h3 text-primary mb-3 mt-2">{step.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4">Trust Signals</p>
              <h2 className="font-h2 text-h2 md:text-[40px] text-primary">No fake reviews. Trust starts cleaner than that.</h2>
              <p className="mt-6 font-body-lg text-body-lg text-on-surface-variant">
                Humanly is early-stage, so this section focuses on founder expertise, process transparency, and future verified testimonial slots.
              </p>
              <Link href="/booking" className="mt-8 inline-flex items-center gap-3 text-secondary font-label-bold text-label-bold hover:text-primary-container transition-colors">
                Start your story
                <ArrowRight size={18} />
              </Link>
            </div>
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* ============ BOOKING EMBED ============ */}
      <section className="bg-surface-container-low px-margin-mobile md:px-margin-desktop py-20 md:py-24" id="book">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-h2 text-h2 md:text-[40px] text-primary mb-4">Book Your Confidential Session</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
            Pay securely through Stripe first. Once payment succeeds, your private scheduling page unlocks.
          </p>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <CalendarCheck size={48} className="mx-auto text-secondary mb-4" />
              <p className="font-h3 text-h3 text-primary mb-2">Payment-first booking funnel</p>
              <p className="text-on-surface-variant mb-6 max-w-md">
                The funnel collects a short confidential intake, sends you to Stripe Checkout,
                and redirects paid clients to Cal.com scheduling.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-3 rounded-full bg-secondary text-on-secondary px-8 py-4 font-label-bold text-label-bold hover:bg-primary-container transition-colors"
              >
                Start Secure Booking
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Trust markers near booking */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-on-surface-variant">
            <div className="flex items-center gap-2">
              <LockKeyhole size={16} className="text-secondary" />
              <span className="text-sm">No recording</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary" />
              <span className="text-sm">Confidential by design</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-secondary" />
              <span className="text-sm">No commitment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ (schema-marked) ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24">
        <div className="mx-auto max-w-max-width">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <p className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-4">FAQ</p>
              <h2 className="font-h2 text-h2 md:text-[40px] text-primary">Designed for people who need privacy first.</h2>
              <p className="mt-6 font-body-lg text-body-lg text-on-surface-variant">
                Common questions about confidentiality, scope, and how the consultation works.
              </p>
              <Link href="/faq" className="mt-8 inline-flex items-center gap-3 text-secondary font-label-bold text-label-bold hover:text-primary-container transition-colors">
                View all questions
                <ArrowRight size={18} />
              </Link>
            </div>
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-margin-mobile md:px-margin-desktop py-20 md:py-24 relative overflow-hidden border-t border-outline-variant bg-surface-container-low">
        <Scribble variant="loop" className="absolute -top-10 -left-10 w-64 h-64 text-secondary-orange/20 hidden md:block" />
        <Scribble variant="sparkle" className="absolute bottom-10 right-10 w-48 h-48 text-secondary/10 hidden md:block" />

        <div className="mx-auto max-w-max-width flex flex-col items-center text-center relative z-10">
          <div className="relative inline-block mb-8">
            <h2 className="font-h1-mobile text-h1-mobile md:font-h1-desktop md:text-h1-desktop text-on-surface">
              Ready to find your safe space?
            </h2>
            <Scribble variant="underline" className="absolute -bottom-4 left-0 w-full h-4 text-secondary-orange" color="#FDA544" />
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12">
            Take the first step towards resolving workplace challenges with dignity. Our triage session is confidential, supportive, and designed to map out your next move.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-3 bg-secondary text-on-secondary font-label-bold text-label-bold px-10 py-5 rounded-full hover:bg-primary-container transition-colors shadow-xl shadow-secondary/20"
          >
            <Sparkles size={20} />
            Book Your Triage Session
            <ArrowRight size={20} className="fill-icon" />
          </Link>
        </div>
      </section>

      {/* ============ STICKY MOBILE CTA ============ */}
      {showSticky && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container-lowest border-t border-outline-variant p-4 shadow-2xl"
        >
          <Link
            href="/booking"
            className="flex items-center justify-center gap-3 w-full rounded-full bg-secondary text-on-secondary py-4 font-label-bold text-label-bold"
          >
            <CalendarCheck size={18} />
            Book Confidential Session
          </Link>
        </motion.div>
      )}
    </div>
  );
}

/* needed for Material Symbols inline */
const globalStyles = `
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.fill-icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = globalStyles;
  document.head.appendChild(style);
}
