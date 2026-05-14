"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { Gavel, AlertCircle, CheckCircle2, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="max-w-4xl mx-auto px-5 md:px-[64px] pt-20 md:pt-28 pb-24">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
            The formal stuff. Clear, fair, and designed to support a respectful partnership.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-neutral-300 p-8 md:p-16 shadow-sm relative overflow-hidden"
        >
          <Scribble variant="loop" className="absolute -top-20 -right-20 w-80 h-80 text-amber/5 -z-0" />

          <div className="relative z-10 space-y-12 leading-relaxed text-neutral-500">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <Scale className="text-amber shrink-0" size={24} />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Humanly, you agree to be bound by these terms. If you represent
                an organization, these terms extend to any users under your account management.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <AlertCircle className="text-coral shrink-0" size={24} />
                2. Nature of Service
              </h2>
              <p>
                Humanly provides workplace advocacy, mediation, and education. We are{" "}
                <span className="text-primary-violet font-extrabold">NOT</span> a law firm, and our
                advice is not legal counsel. We recommend consulting a licensed attorney for specific
                legal litigation.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <CheckCircle2 className="text-primary-violet shrink-0" size={24} />
                3. User Responsibilities
              </h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  "Provide accurate information for consultations.",
                  "Respect the professional boundaries of advisors.",
                  "Maintain confidentiality of shared templates.",
                  "Ensure timely payment for booked sessions.",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 bg-neutral-bg p-5 rounded-lg border border-neutral-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-violet mt-2 shrink-0" />
                    <span className="text-neutral-500">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <Gavel className="text-primary-dark shrink-0" size={24} />
                4. Liability Disclaimer
              </h2>
              <div className="p-6 md:p-8 bg-amber/5 rounded-lg border-2 border-dashed border-amber/20">
                <p>
                  While we strive for the best possible outcomes, workplace transitions and disputes
                  are inherently complex. Humanly is not liable for employment outcomes, including
                  termination, disciplinary action, or loss of income stemming from independent
                  decisions made after a consultation.
                </p>
              </div>
            </section>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <div className="mt-16 p-10 md:p-12 bg-primary-violet/5 rounded-lg border border-primary-violet/10 text-center">
          <h3 className="font-extrabold text-xl text-primary-dark mb-4">
            Questions about our legal terms?
          </h3>
          <p className="text-neutral-500 mb-8">
            We're happy to explain them in plain human language.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary-violet text-white px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-primary-dark transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}