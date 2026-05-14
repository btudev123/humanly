"use client";

import { motion } from "motion/react";
import { ArrowRight, Calendar, CheckCircle2, Lock, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";
import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    icon: Calendar,
    title: "Confirmation email arrives",
    desc: "Within minutes of booking, you'll receive your Zoom link, date/time, and pre-session intake form.",
  },
  {
    icon: MessageCircle,
    title: "Karma reviews your intake",
    desc: "Your intake form is read before the session so no time is wasted re-explaining your situation.",
  },
  {
    icon: ShieldCheck,
    title: "Session happens — stay private",
    desc: "The session is confidential, unrecorded, and designed to give you clarity and actionable next steps.",
  },
];

const faqs = [
  {
    question: "Will this session be recorded?",
    answer: "No. Humanly sessions are never recorded. Your confidentiality is absolute.",
  },
  {
    question: "What is your confidentiality policy?",
    answer: "We do not contact your employer, share your information, or store session content beyond what's needed for your report. See our full Privacy Policy for details.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer: "Yes. You can cancel or reschedule up to 24 hours before your session via the link in your confirmation email. Late cancellations may be subject to a fee.",
  },
  {
    question: "What happens after I book?",
    answer: "You'll receive a confirmation email with your Zoom link, session date/time, and a link to our pre-session intake form. Karma reviews every intake before the session.",
  },
  {
    question: "Do you offer in-person sessions?",
    answer: "All sessions are conducted virtually via Zoom or Google Meet. This ensures flexibility for professionals across the GCC and maintains confidentiality.",
  },
];

export default function BookingPage() {
  const [selected, setSelected] = useState("triage");

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Trust Header */}
      <header className="px-5 md:px-[64px] max-w-7xl mx-auto pt-20 md:pt-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-dark/5 px-4 py-2 mb-6">
          <Lock className="text-primary-violet" size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dark">
            Everything discussed is strictly confidential
          </span>
        </div>
        <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark max-w-3xl mx-auto">
          Book a confidential session
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
          Choose the level of support that fits your situation. Every session begins with a confidential intake review by Karma.
        </p>
      </header>

      {/* Service Selector */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-14">
        <div className="grid gap-4">
          {[
            {
              value: "triage",
              title: "The Triage",
              sub: "60-minute advisory session",
              price: "AED 550",
              desc: "A private consultation for verbal guidance and clarity on immediate next steps.",
            },
            {
              value: "strategy",
              title: "The Strategy",
              sub: "Triage + written follow-up report",
              price: "AED 950",
              desc: "A structured document with situation summary, risk assessment, recommended actions, and suggested scripts.",
            },
            {
              value: "retainer",
              title: "The Retainer",
              sub: "Ongoing monthly support",
              price: "AED 1,800/month",
              desc: "Two strategy sessions per month, message review, priority access, and ongoing situation monitoring.",
            },
          ].map((service) => (
            <label
              key={service.value}
              className={`cursor-pointer rounded-lg p-6 border-2 transition-all relative ${
                selected === service.value
                  ? "border-primary-violet bg-primary-violet/5 shadow-lg shadow-primary-violet/10"
                  : "border-neutral-300 bg-white hover:border-primary-violet/50"
              }`}
            >
              <input
                type="radio"
                name="service"
                value={service.value}
                checked={selected === service.value}
                onChange={() => setSelected(service.value)}
                className="sr-only"
              />
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected === service.value
                      ? "border-primary-violet bg-primary-violet"
                      : "border-neutral-300"
                  }`}
                >
                  {selected === service.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h3 className="font-extrabold text-2xl text-primary-dark">{service.title}</h3>
                    <span className="text-2xl font-extrabold text-primary-dark">{service.price}</span>
                  </div>
                  <p className="mt-1 font-semibold text-sm uppercase tracking-[0.12em] text-primary-violet">
                    {service.sub}
                  </p>
                  <p className="mt-2 leading-relaxed text-neutral-500">{service.desc}</p>
                </div>
              </div>
              {selected === service.value && (
                <Scribble variant="sparkle" className="absolute -top-3 -right-3 w-8 h-8 text-amber" />
              )}
            </label>
          ))}
        </div>
      </section>

      {/* Cal.com Embed Placeholder */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-12">
        <div className="rounded-lg bg-white border border-neutral-300 shadow-sm overflow-hidden">
          <div className="bg-primary-dark px-6 py-4 flex items-center gap-3">
            <Calendar className="text-amber" size={20} />
            <span className="font-bold text-sm uppercase tracking-[0.12em] text-white">
              Select your date & time
            </span>
          </div>
          <div className="p-6 min-h-[400px] flex items-center justify-center text-center">
            <div className="max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-violet/10 flex items-center justify-center">
                <Calendar className="text-primary-violet" size={28} />
              </div>
              <p className="font-extrabold text-2xl text-primary-dark mb-2">
                Cal.com scheduling
              </p>
              <p className="text-sm leading-relaxed text-neutral-500 mb-6">
                The booking widget loads here — pre-filtered to{" "}
                <span className="font-bold text-primary-violet">
                  {selected === "triage" ? "The Triage" : selected === "strategy" ? "The Strategy" : "The Retainer"}
                </span>.
                Insert your Cal.com embed snippet to activate.
              </p>
              <div className="rounded-lg bg-amber/10 p-4 inline-block">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber">
                  🔒 No payment details stored on this server. All payments processed securely via Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Markers Row */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-6 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: Lock, text: "No recording" },
          { icon: ShieldCheck, text: "Confidential by design" },
          { icon: MessageCircle, text: "Karma reads every intake" },
        ].map((item) => (
          <div key={item.text} className="rounded-lg bg-white border border-neutral-300 p-4">
            <item.icon className="mx-auto text-primary-violet mb-2" size={18} />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">{item.text}</p>
          </div>
        ))}
      </section>

      {/* What Happens Next */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-20">
        <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark text-center mb-10">
          What happens next
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-lg bg-white border border-neutral-300 p-8 shadow-sm"
            >
              <step.icon className="text-primary-violet mb-5" size={32} />
              <h3 className="font-extrabold text-xl text-primary-dark mb-3">{step.title}</h3>
              <p className="leading-relaxed text-neutral-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 md:px-[64px] max-w-3xl mx-auto mt-20">
        <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark text-center mb-10">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-lg bg-white border border-neutral-300 p-6"
            >
              <summary className="cursor-pointer font-bold text-primary-dark list-none flex items-center justify-between gap-4">
                <span className="text-lg">{faq.question}</span>
                <span className="shrink-0 text-primary-violet group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-neutral-500">{faq.answer}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Micro-copy reassurance */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-12 text-center">
        <p className="text-xs text-neutral-400 italic">
          No commitment until you confirm. Strictly confidential. Your employer will not be contacted.
        </p>
      </section>

      {/* Footer-light — no full nav, just brand + legal */}
      <footer className="mt-20 border-t border-neutral-300 bg-white py-10">
        <div className="px-5 md:px-[64px] max-w-7xl mx-auto text-center">
          <Link href="/" className="font-extrabold text-2xl text-primary-dark hover:text-primary-violet transition-colors">
            Humanly
          </Link>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-neutral-500">
            <Link href="/privacy" className="hover:text-primary-violet underline transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary-violet underline transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-primary-violet underline transition-colors">FAQ</Link>
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            © 2026 Humanly HR Advisory. All rights reserved. Neutral advocacy for the modern workplace.
          </p>
        </div>
      </footer>
    </div>
  );
}