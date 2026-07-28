"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { serviceProducts, formatAed } from "@/lib/products";
import { useState, useEffect } from "react";
import { Scribble } from "@/components/ui/Scribble";
import { TestimonialsCarousel, type Testimonial } from "@/components/reviews/TestimonialsCarousel";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  MessageSquare,
  Search,
  ClipboardCheck,
  Users,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Copy & data                                                       */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "100%", label: "Confidential", detail: "No employer notification or shared access." },
  { value: "60 min", label: "Strategy Sessions", detail: "Focused guidance with written next steps." },
  { value: "Global", label: "Worldwide Reach", detail: "Plus deep UAE, GCC & North America guides." },
  { value: "20+", label: "Years In HR", detail: "Executive experience now in your corner." },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "Safe Space",
    description:
      "Speak freely without fear of your employer finding out. Every conversation is privileged and confidential by design.",
    tint: "bg-violet-tint",
    doodle: "heart" as const,
    doodleColor: "#7c3aed",
  },
  {
    icon: Search,
    title: "Reality Check",
    description:
      "An honest, evidence-based read on your situation — what the law says, what your employer will likely do, and where your leverage is.",
    tint: "bg-orange-tint",
    doodle: "star-fill" as const,
    doodleColor: "#ff6a1a",
  },
  {
    icon: ClipboardCheck,
    title: "Clear Next Steps",
    description:
      "Leave with scripts, questions to ask, documents to prepare, and a calm sequence of actions you can take the same day.",
    tint: "bg-violet-tint",
    doodle: "bolt" as const,
    doodleColor: "#7c3aed",
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
    copy: "Share your workplace issue in plain language. No complex forms — just a human-centred understanding of your situation.",
  },
  {
    icon: Search,
    title: "Virtual Session",
    copy: "Meet face-to-face over Zoom. A safe, neutral space to map risks, options, and your next move.",
  },
  {
    icon: ClipboardCheck,
    title: "48-Hour Report",
    copy: "Walk away with a comprehensive action plan within 48 hours. Clarity, grounding, and peace of mind — fast.",
  },
];

const trustSignals: Testimonial[] = [
  {
    id: "ts-1",
    author: "Karma Harb",
    role: "Founder credibility",
    company: undefined,
    quote: "Founded by Karma Harb after 20+ years inside HR leadership across UAE, Saudi Arabia, and international environments.",
    date: "2025-01-01",
    verified: true,
    rating: undefined, thumbnail: undefined, mediaUrl: undefined, mediaType: undefined, transcript: undefined,
  },
  {
    id: "ts-2",
    author: "Humanly",
    role: "Early-stage transparency",
    company: undefined,
    quote: "Humanly does not publish testimonials until they are verified, consented, and privacy-safe.",
    date: "2025-01-01",
    verified: true,
    rating: undefined, thumbnail: undefined, mediaUrl: undefined, mediaType: undefined, transcript: undefined,
  },
  {
    id: "ts-3",
    author: "Humanly",
    role: "Performance-first proof",
    company: undefined,
    quote: "Future video or Instagram testimonials will load as lightweight thumbnails with transcripts before third-party embeds.",
    date: "2025-01-01",
    verified: true,
    rating: undefined, thumbnail: undefined, mediaUrl: undefined, mediaType: undefined, transcript: undefined,
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
    a: "Your call may be recorded solely so your advisor can take accurate notes — it stays private and confidential, and is never shared with your employer or any third party. You receive a written summary of key points and recommended next steps within 48 hours.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes. You can reschedule or cancel up to 24 hours before your session with no charge. Workplace situations are unpredictable.",
  },
];

const marqueeItems = [
  "Strictly Confidential",
  "No Employer Notification",
  "UAE & GCC Labour Law",
  "Written Action Plan",
  "Neutral & Independent",
  "20+ Years In HR",
  "Zero Corporate Conflict",
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function Eyebrow({ children, color = "orange" }: { children: React.ReactNode; color?: "orange" | "violet" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm`}
    >
      <span className={`h-2 w-2 rounded-full ${color === "orange" ? "bg-accent-orange" : "bg-primary-violet"}`} />
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={faq.q}
            className={`rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 transition-shadow ${isOpen ? "shadow-pop-sm" : ""}`}
          >
            <button
              className="flex w-full items-center justify-between gap-5 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="font-display text-lg font-bold text-primary-dark">{faq.q}</span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark transition-colors ${
                  isOpen ? "bg-accent-orange" : "bg-neutral-100"
                }`}
              >
                {isOpen ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 leading-relaxed text-neutral-500">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function HomeContent() {
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="overflow-clip bg-surface text-on-surface">

      {/* ============================ HERO ============================ */}
      <section className="relative px-margin-mobile pb-12 pt-32 md:px-margin-desktop md:pb-20 md:pt-40">
        {/* backdrop */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="dot-grid absolute inset-0 opacity-60" />
          <div className="blob absolute -right-24 top-10 h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(124,58,237,0.22),transparent_70%)]" />
          <div className="blob absolute -left-32 bottom-0 h-[380px] w-[380px] bg-[radial-gradient(circle,rgba(255,106,26,0.18),transparent_70%)]" style={{ animationDelay: "-6s" }} />
        </div>

        {/* floating doodles */}
        <Scribble variant="star-fill" color="#ff6a1a" className="absolute left-[6%] top-28 hidden h-7 w-7 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[8%] top-44 hidden h-16 w-16 opacity-50 md:block" />
        <Scribble variant="arrow-curved" color="#7c3aed" className="absolute left-[44%] top-24 hidden h-14 w-16 opacity-60 lg:block" />

        <div className="relative mx-auto grid max-w-max-width items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left */}
          <div>
            <Reveal>
              <Eyebrow>
                <LockKeyhole size={13} className="text-primary-violet" />
                100% Confidential · Global Advisory
              </Eyebrow>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="mt-7 font-display text-[clamp(2.6rem,6.6vw,4.6rem)] font-extrabold leading-[0.98] tracking-tight text-primary-dark">
                Is your internal HR really on your side?{" "}
                <span className="relative inline-block">
                  <span className="highlighter-violet highlighter">Well we are.</span>
                  <Scribble variant="underline-bold" color="#fda544" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" animate />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-7 max-w-xl text-body-lg text-neutral-500">
                Independent, neutral, and confidential HR advisory for professionals worldwide
                navigating workplace challenges — wherever you work.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/booking"
                  className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-4 text-[15px] font-bold text-primary-dark shadow-pop"
                >
                  <CalendarCheck size={18} strokeWidth={2.5} />
                  Book a Confidential Session
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-7 py-4 text-[15px] font-bold text-primary-dark transition-colors hover:bg-violet-tint"
                >
                  View Services
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9 grid max-w-xl gap-x-6 gap-y-3 sm:grid-cols-2">
                {[
                  "No employer notification",
                  "Confidential by design",
                  "Global & regional labour-law expertise",
                  "Action plan within 48 hours",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm font-medium text-neutral-500">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-primary-violet" size={18} />
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right — sticker card cluster */}
          <div className="relative min-h-[460px] md:min-h-[540px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 mx-auto max-w-[440px] rotate-[-2deg] rounded-[2rem] border-2 border-primary-dark bg-primary-dark p-6 text-on-primary shadow-pop-orange"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-primary/50">Private Case Room</p>
                  <h2 className="text-h3 mt-1.5 font-display font-bold text-on-primary">Workplace Strategy</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Encrypted
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  ["Concern", "Manager retaliation after a formal complaint"],
                  ["Priority", "Protect record & preserve evidence"],
                  ["Next Step", "Draft a neutral escalation email"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-on-primary/10 bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-primary/45">{label}</p>
                    <p className="mt-1.5 text-[15px] font-medium text-on-primary/90">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-2 bottom-20 w-[240px] rotate-[3deg] rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-violet">
                <ShieldCheck size={22} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">Confidentiality Promise</p>
              <p className="mt-1.5 text-[15px] font-bold leading-snug text-primary-dark">No notification. No shared access. Strictly confidential.</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-1 bottom-0 w-[210px] rotate-[-4deg] rounded-3xl border-2 border-primary-dark bg-accent-orange p-5 text-primary-dark shadow-pop-sm"
            >
              <Sparkles size={22} strokeWidth={2.5} />
              <p className="mt-3 font-display text-4xl font-extrabold leading-none">60 min</p>
              <p className="mt-2 text-[13px] font-medium leading-snug text-primary-dark/80">Focused session + written action summary.</p>
            </motion.div>

            <Scribble variant="star-fill" color="#7c3aed" className="absolute right-10 top-2 h-6 w-6 animate-float-slow" />
          </div>
        </div>
      </section>

      {/* ============================ MARQUEE ============================ */}
      <section className="border-y-2 border-primary-dark bg-primary-violet py-4 text-neutral-100">
        <div className="marquee gap-0">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 pr-8" aria-hidden={dup === 1}>
              {marqueeItems.map((item) => (
                <span key={item} className="flex items-center gap-8 text-sm font-bold uppercase tracking-[0.18em] whitespace-nowrap">
                  {item}
                  <Scribble variant="star-fill" color="#ff9a4d" className="h-4 w-4" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============================ STATS ============================ */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-20">
        <div className="mx-auto grid max-w-max-width gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div className="h-full rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 transition-transform hover:-translate-y-1">
                <p className="font-display text-5xl font-extrabold text-gradient">{stat.value}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">{stat.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{stat.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ====================== THE PROBLEM ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto max-w-max-width">
          <Reveal className="relative mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow color="violet">The Gap</Eyebrow>
            <h2 className="text-h2 relative mt-6 inline-block font-display font-extrabold tracking-tight text-primary-dark">
              Caught in the{" "}
              <span className="relative inline-block">
                unsafe middle?
                <Scribble variant="circle-rough" color="#ff6a1a" strokeWidth={3} className="absolute -inset-x-4 -inset-y-3 h-[150%] w-[120%]" />
              </span>
            </h2>
            <p className="mt-6 text-body-lg text-neutral-500">
              Workplace issues leave employees trapped between conflicting interests. It doesn&apos;t have to be that way.
            </p>
          </Reveal>

          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {/* Internal HR */}
            <Reveal>
              <div className="flex h-full flex-col rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary-dark bg-neutral-200 text-neutral-500">
                  <span className="material-symbols-outlined text-[26px]">corporate_fare</span>
                </div>
                <h3 className="text-h3 font-display font-bold text-primary-dark">Internal HR</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">The Company</p>
                <div className="mt-6 space-y-5 border-t-2 border-dashed border-neutral-300 pt-6">
                  <div>
                    <p className="text-sm font-bold text-primary-dark">Mandate</p>
                    <p className="text-neutral-500">Protect the business.</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-dark">Perception</p>
                    <p className="text-neutral-500">Unsafe for the employee.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Humanly */}
            <Reveal delay={0.08}>
              <div className="relative flex h-full flex-col rounded-3xl border-2 border-primary-dark bg-primary-dark p-8 text-on-primary shadow-pop-orange md:-translate-y-4">
                <Scribble variant="star-fill" color="#ff6a1a" className="absolute -right-3 -top-3 h-9 w-9 animate-wiggle" />
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-accent-orange bg-accent-orange text-primary-dark">
                  <span className="material-symbols-outlined fill-icon text-[26px]">balance</span>
                </div>
                <h3 className="text-h3 font-display font-bold text-on-primary">Humanly</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-orange-light">The Sweet Spot</p>
                <div className="mt-6 space-y-5 border-t-2 border-dashed border-white/20 pt-6">
                  <div>
                    <p className="text-sm font-bold text-on-primary">Mandate</p>
                    <p className="text-inverse-primary">Protect the individual.</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-primary">Perception</p>
                    <p className="text-inverse-primary">Dignified &amp; neutral.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Lawyers */}
            <Reveal delay={0.16}>
              <div className="flex h-full flex-col rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary-dark bg-neutral-200 text-neutral-500">
                  <span className="material-symbols-outlined text-[26px]">gavel</span>
                </div>
                <h3 className="text-h3 font-display font-bold text-primary-dark">Employment Lawyers</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">The Extreme</p>
                <div className="mt-6 space-y-5 border-t-2 border-dashed border-neutral-300 pt-6">
                  <div>
                    <p className="text-sm font-bold text-primary-dark">Mandate</p>
                    <p className="text-neutral-500">Litigation.</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-dark">Perception</p>
                    <p className="text-neutral-500">Expensive &amp; aggressive.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====================== 3 PILLARS ====================== */}
      <section className="relative px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto max-w-max-width">
          <Reveal className="mb-14 text-center">
            <Eyebrow>What Humanly Is</Eyebrow>
            <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
              Practical strategy, zero legal jargon.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-500">Built on three core principles.</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08}>
                <div className={`group relative h-full overflow-hidden rounded-3xl border-2 border-primary-dark ${pillar.tint} p-8 transition-transform hover:-translate-y-1`}>
                  <Scribble variant={pillar.doodle} color={pillar.doodleColor} className="absolute right-5 top-5 h-10 w-10 opacity-25 transition-opacity group-hover:opacity-60" />
                  <span className="font-display text-6xl font-extrabold text-primary-dark/10">0{i + 1}</span>
                  <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary-dark bg-neutral-100 text-primary-violet">
                    <pillar.icon size={26} />
                  </div>
                  <h3 className="text-h3 mt-5 font-display font-bold text-primary-dark">{pillar.title}</h3>
                  <p className="mt-3 leading-relaxed text-neutral-500">{pillar.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== SERVICES / PRICING ====================== */}
      <section id="services" className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto max-w-max-width">
          <Reveal className="relative mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow color="violet">Pricing</Eyebrow>
            <h2 className="text-h2 relative mt-6 inline-block font-display font-extrabold tracking-tight text-primary-dark">
              A confidential reality check
              <Scribble variant="underline" color="#ff6a1a" strokeWidth={4} className="absolute -bottom-3 left-0 h-3.5 w-full" />
            </h2>
            <p className="mt-6 text-body-lg text-neutral-500">From a quick document review to ongoing retainers — see the full range of advisory options.</p>
          </Reveal>

          {/* ONE-OFF ADVISORY SESSIONS */}
          <div className="mb-16">
            <Reveal>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">One-Off Advisory Sessions</p>
              <div className="mb-8 h-0.5 w-16 bg-accent-orange" />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviceProducts.filter((s) => s.category === "session").map((service, i) => (
                <Reveal key={service.slug} delay={i * 0.06} className="h-full">
                  <div
                    className={`relative flex h-full flex-col gap-4 rounded-3xl border-2 border-primary-dark p-7 transition-transform hover:-translate-y-1 ${
                      service.featured ? "bg-primary-dark text-on-primary shadow-pop-orange" : "bg-neutral-100"
                    }`}
                  >
                    {service.featured && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <h3 className={`font-display text-lg font-bold leading-snug ${service.featured ? "text-on-primary" : "text-primary-dark"}`}>{service.name}</h3>
                      <p className={`mt-1 text-sm ${service.featured ? "text-on-primary/60" : "text-neutral-500"}`}>{service.duration}</p>
                    </div>
                    <p className={`font-display text-4xl font-extrabold ${service.featured ? "text-accent-orange" : "text-primary-dark"}`}>
                      {formatAed(service.amountAed)}
                    </p>
                    <p className={`flex-grow text-sm leading-relaxed ${service.featured ? "text-on-primary/70" : "text-neutral-500"}`}>{service.description}</p>
                    <Link
                      href={`/booking?service=${service.slug}`}
                      className={`btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark px-5 py-3 text-sm font-bold ${
                        service.featured ? "bg-accent-orange text-primary-dark" : "bg-primary-dark text-on-primary"
                      }`}
                    >
                      <CalendarCheck size={16} strokeWidth={2.5} />
                      {service.needsScheduling ? "Book Now" : "Get Started"}
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* MONTHLY RETAINERS */}
          <div className="mb-16">
            <Reveal>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">Monthly Retainers</p>
              <div className="mb-8 h-0.5 w-16 bg-accent-orange" />
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {serviceProducts.filter((s) => s.category === "retainer").map((service, i) => (
                <Reveal key={service.slug} delay={i * 0.06} className="h-full">
                  <div className="flex h-full flex-col gap-4 rounded-3xl border-2 border-primary-dark bg-violet-tint p-7 transition-transform hover:-translate-y-1">
                    <div>
                      <h3 className="text-h4 font-display font-bold leading-snug text-primary-dark">{service.name}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{service.subtitle}</p>
                    </div>
                    <p className="font-display text-4xl font-extrabold text-primary-dark">
                      {formatAed(service.amountAed)}<span className="text-2xl">/mo</span>
                    </p>
                    <ul className="flex-grow space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 shrink-0 text-primary-violet" size={16} />
                          <span className="text-neutral-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/booking?service=${service.slug}`}
                      className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-primary-dark px-5 py-3 text-sm font-bold text-on-primary"
                    >
                      <CalendarCheck size={16} strokeWidth={2.5} />
                      Get Started
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* CORPORATE & SME ADD-ONS */}
          <div className="mb-12">
            <Reveal>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-violet">Corporate & SME Add-Ons</p>
              <div className="mb-8 h-0.5 w-16 bg-accent-orange" />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {serviceProducts.filter((s) => s.category === "corporate").map((service, i) => (
                <Reveal key={service.slug} delay={i * 0.06} className="h-full">
                  <div className="flex h-full flex-col gap-4 rounded-3xl border-2 border-primary-dark bg-orange-tint p-7 transition-transform hover:-translate-y-1">
                    <div>
                      <h3 className="text-h4 font-display font-bold leading-snug text-primary-dark">{service.name}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{service.subtitle}</p>
                    </div>
                    <p className="font-display text-4xl font-extrabold text-primary-dark">
                      {formatAed(service.amountAed)}{service.priceNote && <span className="text-2xl">{service.priceNote}</span>}
                    </p>
                    <ul className="flex-grow space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 shrink-0 text-accent-orange" size={16} />
                          <span className="text-neutral-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/booking?service=${service.slug}`}
                      className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-3 text-sm font-bold text-primary-dark"
                    >
                      <CalendarCheck size={16} strokeWidth={2.5} />
                      Book Now
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="text-center">
            <Link href="/services" className="group inline-flex items-center gap-2 font-bold text-primary-violet transition-colors hover:text-accent-orange">
              View full pricing details
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ====================== FOUNDER ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto grid max-w-max-width items-center gap-12 md:grid-cols-12">
          {/* photo */}
          <Reveal className="order-2 md:order-1 md:col-span-5">
            <div className="relative">
              <div className="blob absolute -left-6 -top-6 -z-10 h-40 w-40 bg-accent-orange/30" />
              <Scribble variant="loop" color="#7c3aed" className="absolute -right-6 -top-8 h-24 w-24 opacity-60" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-primary-dark shadow-pop">
                <img
                  src="/karma-harb.png"
                  alt="Karma Harb — Founder & Lead Advisor at Humanly"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-5 -right-3 rotate-[4deg] rounded-2xl border-2 border-primary-dark bg-accent-orange px-5 py-3 text-primary-dark shadow-pop-sm">
                <p className="font-display text-2xl font-extrabold leading-none">20+ yrs</p>
                <p className="text-[11px] font-bold uppercase tracking-wider">in HR leadership</p>
              </div>
            </div>
          </Reveal>

          {/* copy */}
          <Reveal delay={0.1} className="order-1 flex flex-col gap-6 md:order-2 md:col-span-7 md:pl-6">
            <Eyebrow>The Founder</Eyebrow>
            <h2 className="text-h2 font-display font-extrabold tracking-tight text-primary-dark">
              Executive experience.{" "}
              <span className="relative inline-block text-primary-violet">
                Human approach.
                <Scribble variant="underline" color="#ff6a1a" strokeWidth={4} className="absolute -bottom-2 left-0 h-3 w-full" />
              </span>
            </h2>
            <p className="max-w-prose text-body-lg leading-relaxed text-neutral-500">
              20+ years in Human Resources across the UAE, Saudi Arabia, and international environments —
              combining the strategic weight of a C-Suite executive with the empathy of a coach.
            </p>
            <div className="relative rounded-3xl border-2 border-primary-dark bg-violet-tint p-7">
              <span className="material-symbols-outlined absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-base text-primary-dark">format_quote</span>
              <p className="font-display text-h3 font-bold italic text-primary-dark">
                &ldquo;Everyone deserves to feel heard at work.&rdquo;
              </p>
            </div>
            <Link href="/about" className="group inline-flex items-center gap-2 font-bold text-primary-violet transition-colors hover:text-accent-orange">
              Read Karma&apos;s full story
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ====================== IS THIS YOU? ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto max-w-max-width">
          <Reveal className="mb-14 text-center">
            <Eyebrow color="violet">Who This Is For</Eyebrow>
            <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">Is this you?</h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-500">If any of these resonate, we can help.</p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {triggers.map((trigger, i) => (
              <Reveal key={trigger.icon} delay={i * 0.05}>
                <div className="group flex h-full items-center gap-4 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 transition-transform hover:-translate-y-1 hover:bg-orange-tint">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet transition-colors group-hover:bg-accent-orange group-hover:text-primary-dark">
                    <span className="material-symbols-outlined fill-icon text-[26px]">{trigger.icon}</span>
                  </div>
                  <h3 className="text-h4 font-display font-bold leading-snug text-primary-dark">{trigger.label}</h3>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Link
              href="/booking"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop"
            >
              <CalendarCheck size={18} strokeWidth={2.5} />
              Get Confidential Support
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ====================== HOW IT WORKS ====================== */}
      <section className="relative overflow-hidden bg-primary-dark px-margin-mobile py-20 text-on-primary md:px-margin-desktop md:py-28">
        <Scribble variant="spiral" color="#ff6a1a" className="absolute left-6 top-10 hidden h-20 w-20 opacity-30 md:block" />
        <Scribble variant="star-fill" color="#9d5cff" className="absolute bottom-12 right-12 hidden h-8 w-8 animate-float md:block" />

        <div className="mx-auto max-w-max-width">
          <Reveal className="mb-16 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-light">
              <span className="h-2 w-2 rounded-full bg-accent-orange" /> Low overhead · High efficiency
            </span>
            <h2 className="text-h2 mt-6 inline-block font-display font-extrabold tracking-tight text-on-primary">
              From chaos to clarity in{" "}
              <span className="relative inline-block text-accent-orange">
                48 hours
                <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={4} className="absolute -bottom-3 left-0 h-3.5 w-full" />
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-primary/70">
              A streamlined process that cuts corporate red tape — delivering actionable insight and support when you need it most.
            </p>
          </Reveal>

          <div className="relative grid gap-10 md:grid-cols-3">
            <Scribble variant="wave" color="#ffffff" strokeWidth={2} className="absolute left-[16%] right-[16%] top-9 hidden h-6 opacity-20 md:block" />
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-orange bg-accent-orange text-primary-dark">
                    <step.icon size={30} strokeWidth={2} />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary-dark bg-neutral-100 font-display text-sm font-extrabold text-primary-dark">
                      {i + 1}
                    </span>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-h3 font-display font-bold text-on-primary">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-on-primary/70">{step.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== TESTIMONIALS ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto grid max-w-max-width gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Eyebrow>Trust Signals</Eyebrow>
            <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
              No fake reviews. Trust starts cleaner than that.
            </h2>
            <p className="mt-6 text-body-lg text-neutral-500">
              Humanly is early-stage, so this focuses on founder expertise, process transparency, and future verified testimonial slots.
            </p>
            <Link href="/booking" className="group mt-8 inline-flex items-center gap-2 font-bold text-primary-violet transition-colors hover:text-accent-orange">
              Start your story
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <TestimonialsCarousel
              testimonials={trustSignals}
              title="No fake reviews. Trust starts cleaner than that."
              subtitle="Humanly is early-stage, so this section focuses on founder expertise, process transparency, and future verified testimonial slots."
            />
          </Reveal>
        </div>
      </section>

      {/* ====================== BOOKING CTA BAND ====================== */}
      <section id="book" className="px-margin-mobile py-16 md:px-margin-desktop md:py-20">
        <Reveal className="mx-auto max-w-max-width">
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-violet-tint p-10 text-center md:p-16">
            <Scribble variant="star-fill" color="#ff6a1a" className="absolute left-10 top-10 hidden h-8 w-8 animate-wiggle md:block" />
            <Scribble variant="spiral" color="#7c3aed" className="absolute bottom-8 right-10 hidden h-16 w-16 opacity-50 md:block" />
            <h2 className="text-h2 mx-auto max-w-2xl font-display font-extrabold tracking-tight text-primary-dark">
              Book your confidential session
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-neutral-500">
              Pay securely through Stripe first. Once payment succeeds, your private scheduling page unlocks.
            </p>
            <Link
              href="/booking"
              className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop"
            >
              Start Secure Booking
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-500">
              <span className="flex items-center gap-1.5"><LockKeyhole size={15} className="text-primary-violet" /> No recording</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-primary-violet" /> Confidential by design</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-primary-violet" /> No commitment</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ====================== FAQ ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mx-auto grid max-w-max-width gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-28">
            <Eyebrow color="violet">FAQ</Eyebrow>
            <h2 className="text-h2 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
              Designed for people who need privacy first.
            </h2>
            <p className="mt-6 text-body-lg text-neutral-500">
              Common questions about confidentiality, scope, and how the consultation works.
            </p>
            <Link href="/faq" className="group mt-8 inline-flex items-center gap-2 font-bold text-primary-violet transition-colors hover:text-accent-orange">
              View all questions
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      {/* ====================== FINAL CTA ====================== */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <Reveal className="relative mx-auto flex max-w-max-width flex-col items-center overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark px-6 py-16 text-center text-on-primary shadow-pop-orange md:py-24">
          <Scribble variant="loop" color="#ff6a1a" className="absolute -left-6 -top-6 h-32 w-32 opacity-25" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute right-10 top-10 hidden h-8 w-8 animate-float md:block" />
          <Scribble variant="heart" color="#ff6a1a" className="absolute bottom-10 left-12 hidden h-9 w-9 animate-float-slow md:block" />

          <h2 className="text-h2 relative max-w-3xl font-display font-extrabold leading-[1.02] tracking-tight">
            Ready to find your{" "}
            <span className="relative inline-block text-accent-orange">
              safe space?
              <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-body-lg text-on-primary/70">
            Take the first step toward resolving workplace challenges with dignity. Confidential, supportive,
            and designed to map out your next move.
          </p>
          <Link
            href="/booking"
            className="btn-pop mt-10 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-10 py-5 text-base font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
          >
            <Sparkles size={20} strokeWidth={2.5} />
            Book Your Triage Session
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        </Reveal>
      </section>

      {/* ====================== STICKY MOBILE CTA ====================== */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary-dark bg-neutral-bg/95 p-3 backdrop-blur-md md:hidden"
          >
            <Link
              href="/booking"
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange py-3.5 text-[15px] font-bold text-primary-dark"
            >
              <CalendarCheck size={18} strokeWidth={2.5} />
              Book Confidential Session
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
