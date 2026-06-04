"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { Gavel, AlertCircle, CheckCircle2, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="overflow-clip bg-surface">
      <div className="mx-auto max-w-4xl px-margin-mobile pb-24 pt-32 md:px-margin-desktop md:pt-40">
        {/* Header */}
        <header className="relative mb-14 text-center">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
          <h1 className="inline-block font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
            Terms of{" "}
            <span className="relative inline-block">
              Service
              <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
            The formal stuff. Clear, fair, and designed to support a respectful partnership.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop md:p-14"
        >
          <div className="relative z-10 space-y-12 leading-relaxed text-neutral-500">
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-orange-tint text-accent-orange"><Scale size={20} /></span>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Humanly, you agree to be bound by these terms. If you represent an organization, these terms extend to any users under your account management.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-coral/15 text-coral"><AlertCircle size={20} /></span>
                2. Nature of Service
              </h2>
              <p>
                Humanly provides workplace advocacy, mediation, and education. We are{" "}
                <span className="font-extrabold text-primary-violet">NOT</span> a law firm, and our advice is not legal counsel. We recommend consulting a licensed attorney for specific legal litigation.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet"><CheckCircle2 size={20} /></span>
                3. User Responsibilities
              </h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {[
                  "Provide accurate information for consultations.",
                  "Respect the professional boundaries of advisors.",
                  "Maintain confidentiality of shared templates.",
                  "Ensure timely payment for booked sessions.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl border-2 border-primary-dark/20 bg-surface-container-low p-5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-orange" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-dark"><Gavel size={20} /></span>
                4. Liability Disclaimer
              </h2>
              <div className="rounded-2xl border-2 border-dashed border-accent-orange/40 bg-orange-tint p-6 md:p-8">
                <p>
                  While we strive for the best possible outcomes, workplace transitions and disputes are inherently complex. Humanly is not liable for employment outcomes, including termination, disciplinary action, or loss of income stemming from independent decisions made after a consultation.
                </p>
              </div>
            </section>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <div className="mt-14 rounded-[2rem] border-2 border-primary-dark bg-violet-tint p-10 text-center md:p-12">
          <h3 className="font-display text-xl font-bold text-primary-dark">Questions about our legal terms?</h3>
          <p className="mb-8 mt-3 text-neutral-500">We&apos;re happy to explain them in plain human language.</p>
          <a
            href="/contact"
            className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[14px] font-bold text-primary-dark shadow-pop-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
