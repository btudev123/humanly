"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { FullScreenScrollFX, type FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";
import { Scribble } from "@/components/ui/Scribble";
import { TestimonialsCarousel, type Testimonial } from "@/components/reviews/TestimonialsCarousel";
import {
  ArrowRight,
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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Full-Screen Scroll Sections — HR themed                           */
/* ------------------------------------------------------------------ */

const heroSections = [
  {
    id: "hero",
    leftLabel: "Your HR",
    title: "Isn't On Your Side",
    rightLabel: "We Are",
    background:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fm=jpg&fit=crop",
  },
  {
    id: "safe",
    leftLabel: "100% Private",
    title: "Safe Space",
    rightLabel: "Zero Exposure",
    background:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80&fm=jpg&fit=crop",
  },
  {
    id: "clarity",
    leftLabel: "Evidence-Based",
    title: "Reality Check",
    rightLabel: "No Sugarcoating",
    background:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&fm=jpg&fit=crop",
  },
  {
    id: "action",
    leftLabel: "Written Plan",
    title: "Clear Next Steps",
    rightLabel: "48-Hour Turnaround",
    background:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&fm=jpg&fit=crop",
  },
  {
    id: "dignity",
    leftLabel: "Dignified Exit",
    title: "Your Terms",
    rightLabel: "No Retaliation",
    background:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80&fm=jpg&fit=crop",
  },
];

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

const trustSignals: Testimonial[] = [
  {
    id: "ts-1",
    author: "Karma Harb",
    role: "Founder credibility",
    quote: "Founded by Karma Harb after 20+ years inside HR leadership across UAE, Saudi Arabia, and international environments.",
    date: "2025-01-01",
    verified: true,
  },
  {
    id: "ts-2",
    author: "Humanly",
    role: "Early-stage transparency",
    quote: "Humanly does not publish testimonials until they are verified, consented, and privacy-safe.",
    date: "2025-01-01",
    verified: true,
  },
  {
    id: "ts-3",
    author: "Humanly",
    role: "Performance-first proof",
    quote: "Future video or Instagram testimonials will load as lightweight thumbnails with transcripts before third-party embeds.",
    date: "2025-01-01",
    verified: true,
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
  const scrollApiRef = useRef<FullScreenFXAPI>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface antialiased">
      {/* ============ FULL-SCREEN SCROLL HERO ============ */}
      <FullScreenScrollFX
        sections={heroSections}
        apiRef={scrollApiRef}
        header={
          <>
            <div className="text-[clamp(1.5rem,6vw,4.5rem)] font-black leading-none tracking-[-0.02em] text-[var(--fx-text)]">
              Humanly
            </div>
            <div className="mt-2 text-[clamp(0.7rem,1.4vw,1.1rem)] font-semibold uppercase tracking-[0.18em] text-[#fda544]">
              Independent HR Advisory
            </div>
          </>
        }
        footer={
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-[#fda544] px-6 py-3 text-sm font-bold text-[#3f1b73] transition-colors hover:bg-[#fdb844]"
          >
            <CalendarCheck size={18} />
            Book a Confidential Session
          </Link>
        }
        colors={{
          text: "rgba(255,255,255,0.94)",
          overlay: "rgba(63,27,115,0.52)",
          pageBg: "#ffffff",
          stageBg: "#3f1b73",
        }}
        fontFamily="Poppins, system-ui, sans-serif"
        showProgress
        durations={{ change: 0.7, snap: 800 }}
      />

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

      {/* ============ THREE PILLARS ============ */}
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

      {/* ============ TRIGGER GRID ============ */}
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
            <TestimonialsCarousel
              testimonials={trustSignals}
              title="No fake reviews. Trust starts cleaner than that."
              subtitle="Humanly is early-stage, so this section focuses on founder expertise, process transparency, and future verified testimonial slots."
            />
          </div>
        </div>
      </section>

      {/* ============ BOOKING ============ */}
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
                The funnel collects a short confidential intake, sends you to Stripe Checkout, and redirects paid clients to Cal.com scheduling.
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

      {/* ============ FAQ ============ */}
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