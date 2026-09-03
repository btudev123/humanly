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
      { q: "Is my employer notified when I book a call?", a: "Absolutely not. Humanly is a third-party platform. We have no direct connection to your company's systems, HR departments, or management. Your identity and the contents of your session are strictly between you and your advisor." },
      { q: "How secure is my data?", a: "We use AES-256 encryption for all data at rest and TLS for all data in transit. We follow UAE data protection standards and treat your personal story with the same security we treat bank data." },
      { q: "Will this session be recorded?", a: "Your call may be recorded solely so your advisor can take accurate notes and prepare your written follow-up. Recordings and notes are kept private and confidential, used only for your file, and are never shared with your employer or any third party." },
    ],
  },
  {
    category: "Services & Support",
    icon: Sparkles,
    items: [
      { q: "What kind of expertise does Karma have?", a: "Karma Harb has 20+ years of senior HR leadership experience across the UAE, Saudi Arabia, and international markets. She's led HR functions inside major corporate structures and knows exactly how internal systems operate — which is what makes her external advice so precise." },
      { q: "Can you help me with a legal case?", a: "We provide strategic advocacy and education to help you navigate workplace issues or prepare for legal processes. However, Humanly is not a law firm. If your situation requires formal litigation, we'll help you understand what to ask an attorney and what evidence to gather." },
      { q: "Which session should I book?", a: "Most people book Full Support (AED 1,200, 60 minutes): the call, a written action plan, and the documents and emails drafted for you, plus two weeks of async WhatsApp access while the situation plays out. Session + Plan (AED 950, 60 minutes) is the same call and plan without the done-for-you drafting. If you only want an expert read on one question, The Session (AED 400, 30 minutes) is a genuine short product. If you only need a single document reviewed, the async Document Review (AED 275) is emailed back with no call required. Ongoing situations are best served by a monthly retainer." },
    ],
  },
  {
    category: "Booking & Payments",
    icon: Calendar,
    items: [
      { q: "What if I need to reschedule?", a: "We understand workplace crises aren't always predictable. You can reschedule any consultation up to 24 hours before the session start time via your confirmation email with no penalty." },
      { q: "Are there any hidden fees?", a: "No. The price you see on the service page is the total price. This includes your consultation, any templates provided by your advisor during the session, and — where the service includes one — your written follow-up summary or report." },
      { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe, including Visa and Mastercard. Payment is processed securely in USD. No card details are stored on our servers." },
      { q: "Can I cancel and get a refund?", a: "Yes. Cancellations made at least 24 hours before your session receive a full refund. Cancellations within 24 hours receive a 50% refund. No-shows are non-refundable, but you can reschedule once at no cost." },
    ],
  },
];

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b-2 border-dashed border-neutral-300 py-5 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="group flex w-full items-center justify-between gap-4 text-left">
        <span className={`font-display text-lg font-bold transition-colors ${isOpen ? "text-primary-violet" : "text-primary-dark group-hover:text-primary-violet"}`}>{q}</span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark transition-colors ${isOpen ? "bg-accent-orange text-primary-dark" : "bg-neutral-100 text-primary-dark"}`}>
          {isOpen ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <p className="pt-4 leading-relaxed text-neutral-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [query, setQuery] = useState("");
  const filtered = faqData
    .map((section) => ({ ...section, items: section.items.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(query.toLowerCase())) }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="overflow-clip bg-surface">
      <div className="mx-auto max-w-5xl px-margin-mobile pb-24 pt-32 md:px-margin-desktop md:pt-40">
        {/* Header */}
        <header className="relative mb-16 text-center">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
          <Scribble variant="loop" color="#9d5cff" className="absolute -top-6 left-6 hidden h-24 w-24 opacity-40 md:block" />
          <Scribble variant="star-fill" color="#ff6a1a" className="absolute right-10 top-0 hidden h-8 w-8 animate-float md:block" />
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
            <MessageCircle size={13} className="text-accent-orange" /> We have answers
          </span>
          <h1 className="text-h1 mt-6 font-display font-extrabold tracking-tight text-primary-dark">
            Frequently asked{" "}
            <span className="relative inline-block">
              questions
              <Scribble variant="underline" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
            Everything you need to know about navigating your workplace journey with Humanly.
          </p>
          <div className="relative mx-auto mt-9 max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-violet" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search confidentiality, booking, payment…"
              className="w-full rounded-full border-2 border-primary-dark bg-neutral-100 py-4 pl-14 pr-5 text-primary-dark outline-none transition placeholder:text-neutral-400 focus:shadow-pop-sm"
            />
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-6">
          {filtered.map((section, si) => (
            <motion.section
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.08 }}
              className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-7 md:p-10"
            >
              <div className="mb-6 flex items-center gap-4 border-b-2 border-dashed border-neutral-300 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
                  <section.icon size={24} />
                </div>
                <h2 className="text-h3 font-display font-bold tracking-tight text-primary-dark">{section.category}</h2>
              </div>
              <div>
                {section.items.map((item, ii) => (
                  <AccordionItem key={ii} {...item} />
                ))}
              </div>
            </motion.section>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-10 text-center">
              <p className="font-display text-xl font-bold text-primary-dark">No FAQ matches that search.</p>
              <p className="mt-2 text-neutral-500">Try a broader term or book a private consultation.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="relative mt-16 overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-12 text-center text-on-primary shadow-pop-orange md:p-16">
          <Scribble variant="spiral" color="#ff6a1a" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <div className="relative z-10">
            <h3 className="text-h2 font-display font-extrabold">Still have a unique question?</h3>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-on-primary/70">
              Our support team is here to help you discreetly. No question is too sensitive.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="mailto:hello@talkhumanly.com" className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-3.5 text-[14px] font-bold text-primary-dark shadow-[5px_5px_0_0_#9d5cff]">
                Email us
              </a>
              <a href="/booking" className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 bg-white/5 px-7 py-3.5 text-[14px] font-bold text-on-primary transition-colors hover:bg-white/10">
                Book a session
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
