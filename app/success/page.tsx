"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Clock, FileText, Mail, ShieldCheck, Video } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const prepSteps = [
  "Gather any relevant documents: emails, performance reviews, messages that capture your situation.",
  "Jot down a timeline of events — dates matter when discussing patterns and potential legal exposure.",
  "Note what outcome you're hoping for: clarity, a decision framework, scripted conversations, or ongoing support.",
  "Find a quiet, private space for your session where you can speak freely.",
];

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Confirmation Hero */}
      <header className="px-5 md:px-[64px] max-w-3xl mx-auto pt-20 md:pt-28 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="text-green-600" size={40} />
        </motion.div>
        <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
          Your session is confirmed
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-500">
          You&rsquo;ve done the hard part. We&rsquo;ll take it from here.
        </p>
      </header>

      {/* Session Details */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-12">
        <div className="rounded-lg bg-white border border-neutral-300 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-primary-violet" size={22} />
            <h2 className="font-extrabold text-2xl text-primary-dark">Session details</h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between py-4 border-b border-neutral-200">
              <span className="text-neutral-500">Date & time</span>
              <span className="font-extrabold text-primary-dark">[Set by Cal.com]</span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-neutral-200">
              <span className="text-neutral-500">Service</span>
              <span className="font-extrabold text-primary-dark">The Triage — 60 min</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-neutral-500">Status</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-sm uppercase tracking-[0.08em] text-green-600">
                <CheckCircle2 size={14} />
                Confirmed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Zoom Link */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-4">
        <div className="rounded-lg bg-primary-dark p-8 text-center text-white shadow-sm">
          <Video className="mx-auto text-amber mb-4" size={32} />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber mb-3">Join your session</p>
          <p className="text-lg mb-6">
            A Zoom link has been sent to your email. You can also use the link below.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-primary-dark px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-amber hover:text-primary-dark transition-colors"
          >
            <Video size={16} />
            Open Zoom link
          </a>
        </div>
      </section>

      {/* What's in your inbox */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-4">
        <div className="rounded-lg bg-white border border-neutral-300 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-primary-violet" size={22} />
            <h2 className="font-extrabold text-2xl text-primary-dark">What&rsquo;s in your inbox</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: "Confirmation email with session date, time, and calendar invite" },
              { icon: FileText, text: "Link to your pre-session intake form (Karma reads every intake before your session)" },
              { icon: Video, text: "Zoom / Google Meet link — join from any device, no downloads required" },
            ].map((item, i) => (
              <div key={item.text} className="flex items-start gap-3">
                <item.icon className="shrink-0 text-green-600 mt-0.5" size={18} />
                <p className="leading-relaxed text-neutral-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prepare checklist */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-4">
        <div className="rounded-lg bg-white border border-neutral-300 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="text-primary-violet" size={22} />
            <h2 className="font-extrabold text-2xl text-primary-dark">Prepare for your session</h2>
          </div>
          <ol className="space-y-4">
            {prepSteps.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary-violet/10 text-primary-violet flex items-center justify-center font-extrabold text-xs">
                  {i + 1}
                </span>
                <p className="leading-relaxed text-neutral-500 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Upsell CTA */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-12">
        <div className="rounded-lg bg-amber/5 border-2 border-amber p-8 text-center relative overflow-hidden">
          <Scribble variant="sparkle" className="absolute top-4 right-4 w-16 h-16 text-amber/30" />
          <div className="relative z-10">
            <FileText className="mx-auto text-amber mb-4" size={32} />
            <h3 className="font-extrabold text-2xl text-primary-dark mb-3">
              Add a written strategy report
            </h3>
            <p className="leading-relaxed text-neutral-500 max-w-md mx-auto mb-6">
              Upgrade to The Strategy and receive a structured report summarizing your situation, risk assessment, recommended actions, and suggested scripts.
            </p>
            <span className="block font-extrabold text-3xl text-primary-dark mb-6">
              AED 950
              <span className="text-sm font-normal text-neutral-500 ml-2">one-time</span>
            </span>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-amber text-primary-dark px-8 py-4 rounded-full font-bold uppercase tracking-[0.1em] text-xs hover:bg-amber/90 transition-colors"
            >
              Upgrade to The Strategy
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust footer */}
      <section className="px-5 md:px-[64px] max-w-2xl mx-auto mt-8 mb-20 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <ShieldCheck size={14} />
          <span>Confidential by design. No recording. Your employer will not be contacted.</span>
        </div>
      </section>
    </div>
  );
}