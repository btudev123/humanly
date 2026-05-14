"use client";

import { motion, AnimatePresence } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { useState } from "react";
import { Plus, Minus, Search, Sparkles, MessageCircle, ShieldCheck, Calendar } from "lucide-react";

const faqData = [
  {
    category: "Confidentiality",
    icon: ShieldCheck,
    items: [
      {
        q: "Is my employer notified when I book a call?",
        a: "Absolutely not. Humanly is a third-party platform. We have no direct connection to your company's systems, HR departments, or management. Your identity and the contents of your session are strictly between you and your advisor.",
      },
      {
        q: "How secure is my data?",
        a: "We use AES-256 encryption for all data at rest and TLS for all data in transit. We follow UAE data protection standards and treat your personal story with the same security we treat bank data.",
      },
      {
        q: "Will this session be recorded?",
        a: "No. Sessions are never recorded. Your advisor may take handwritten notes to prepare your written follow-up, but these notes are destroyed after the report is delivered unless you request otherwise.",
      },
    ],
  },
  {
    category: "Services & Support",
    icon: Sparkles,
    items: [
      {
        q: "What kind of expertise does Karma have?",
        a: "Karma Harb has 20+ years of senior HR leadership experience across the UAE, Saudi Arabia, and international markets. She's led HR functions inside major corporate structures and knows exactly how internal systems operate — which is what makes her external advice so precise.",
      },
      {
        q: "Can you help me with a legal case?",
        a: "We provide strategic advocacy and education to help you navigate workplace issues or prepare for legal processes. However, Humanly is not a law firm. If your situation requires formal litigation, we'll help you understand what to ask an attorney and what evidence to gather.",
      },
      {
        q: "What's the difference between The Triage and The Strategy?",
        a: "The Triage (60 min, AED 450) is a live conversation where you receive immediate verbal guidance, clarity, and next-step direction. The Strategy (AED 950) includes everything in The Triage plus a structured written report with situation summary, risk assessment, recommended actions, and suggested scripts you can use immediately.",
      },
    ],
  },
  {
    category: "Booking & Payments",
    icon: Calendar,
    items: [
      {
        q: "What if I need to reschedule?",
        a: "We understand workplace crises aren't always predictable. You can reschedule any consultation up to 24 hours before the session start time via your confirmation email with no penalty.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No. The price you see on the service page is the total price. This includes your consultation, any templates provided by your advisor during the session, and — if you book The Strategy — your written follow-up report.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards via Stripe, including Visa and Mastercard. Payment is processed securely in AED. No card details are stored on our servers.",
      },
      {
        q: "Can I cancel and get a refund?",
        a: "Yes. Cancellations made at least 24 hours before your session receive a full refund. Cancellations within 24 hours receive a 50% refund. No-shows are non-refundable, but you can reschedule once at no cost.",
      },
    ],
  },
];

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 last:border-0 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span
          className={`font-extrabold text-lg transition-colors ${
            isOpen ? "text-primary-violet" : "text-primary-dark group-hover:text-primary-violet"
          }`}
        >
          {q}
        </span>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-all ${
            isOpen
              ? "bg-primary-violet text-white"
              : "bg-neutral-200 text-neutral-500 group-hover:bg-primary-violet/10 group-hover:text-primary-violet"
          }`}
        >
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="leading-relaxed text-neutral-500 pt-5 pb-2">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [query, setQuery] = useState("");
  const filtered = faqData
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        `${item.q} ${item.a}`.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="max-w-5xl mx-auto px-5 md:px-[64px] pt-20 md:pt-28 pb-24">
        {/* Header */}
        <header className="text-center mb-20 relative">
          <Scribble variant="loop" className="absolute -top-10 left-10 w-32 h-32 text-amber/10" />
          <div className="inline-flex items-center gap-2 rounded-full bg-amber/10 px-4 py-2 mb-6">
            <MessageCircle className="text-amber" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dark">
              We have answers
            </span>
          </div>
          <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
            Everything you need to know about navigating your workplace journey with Humanly.
          </p>
          {/* Search */}
          <div className="relative mx-auto mt-10 max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-violet" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search confidentiality, booking, payment, harassment..."
              className="w-full rounded-lg border border-neutral-300 bg-white py-5 pl-14 pr-5 text-primary-dark outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-violet/50 focus:border-primary-violet transition shadow-sm"
            />
          </div>
        </header>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filtered.map((section, si) => (
            <motion.section
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
              className="bg-white p-8 md:p-12 rounded-lg border border-neutral-300 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-200">
                <div className="w-12 h-12 bg-primary-violet/10 rounded-lg flex items-center justify-center text-primary-violet">
                  <section.icon size={24} />
                </div>
                <h2 className="font-extrabold text-2xl text-primary-dark uppercase tracking-tight">
                  {section.category}
                </h2>
              </div>
              <div>
                {section.items.map((item, ii) => (
                  <AccordionItem key={ii} {...item} />
                ))}
              </div>
            </motion.section>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-lg bg-white border border-neutral-300 p-10 text-center">
              <p className="font-extrabold text-xl text-primary-dark">No FAQ matches that search.</p>
              <p className="mt-2 text-neutral-500">Try a broader term or book a private consultation.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-lg bg-primary-dark p-12 md:p-16 text-white text-center relative overflow-hidden">
          <Scribble variant="sparkle" className="absolute top-8 right-8 w-24 h-24 text-amber/20" />
          <div className="relative z-10">
            <h3 className="font-extrabold text-2xl md:text-3xl mb-4">Still have a unique question?</h3>
            <p className="text-neutral-300 leading-relaxed mb-8 max-w-md mx-auto">
              Our support team is here to help you discreetly. No question is too sensitive.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:hello@talkhumanly.com"
                className="inline-flex items-center gap-2 rounded-full bg-amber text-primary-dark px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-amber/90 transition-colors"
              >
                Email us
              </a>
              <a
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 text-white px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs transition-colors border border-white/20"
              >
                Book a session
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}