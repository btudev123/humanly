"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { ShieldCheck, Lock, EyeOff, HardDrive } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="max-w-4xl mx-auto px-5 md:px-[64px] pt-20 md:pt-28 pb-24">
        {/* Header */}
        <header className="text-center mb-16 relative">
          <Scribble variant="sparkle" className="absolute -top-8 right-10 w-40 h-40 text-amber/10 -z-0" />
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-violet/10 px-4 py-2 mb-6">
            <ShieldCheck className="text-primary-violet" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-violet">
              Data first. Humans always.
            </span>
          </div>
          <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
            How we handle information at Humanly — transparent, minimal, and never shared.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-neutral-300 p-8 md:p-16 shadow-sm relative overflow-hidden"
        >
          <Scribble variant="loop" className="absolute -bottom-10 -left-10 w-60 h-60 text-amber/5 -z-0" />

          <div className="relative z-10 space-y-12 leading-relaxed text-neutral-500">
            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <EyeOff className="text-primary-violet shrink-0" size={24} />
                1. Confidentiality Commitment
              </h2>
              <p>
                Humanly does not contact your employer. Ever. Under no circumstances will we share
                your identity, the content of your consultations, or any related documentation with
                your organization, its representatives, or any third party without your express
                written consent.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <HardDrive className="text-amber shrink-0" size={24} />
                2. Data We Collect
              </h2>
              <p className="mb-4">
                We gather only what's necessary to serve you effectively, securely, and confidentially:
              </p>
              <ul className="grid gap-3">
                {[
                  {
                    label: "Name & email",
                    detail: "Needed for booking, confirmation, and report delivery.",
                  },
                  {
                    label: "Session intake notes",
                    detail: "Stored encrypted; deleted after report delivery unless you request otherwise.",
                  },
                  {
                    label: "Payment information",
                    detail: "Processed entirely via Stripe. Humanly never sees or stores your full card details.",
                  },
                  {
                    label: "Resource download data",
                    detail: "Limited to email and name for gated content delivery.",
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex gap-4 bg-neutral-bg p-5 rounded-lg border border-neutral-200"
                  >
                    <Lock className="shrink-0 text-primary-violet mt-0.5" size={18} />
                    <div>
                      <h4 className="font-extrabold text-primary-dark">{item.label}</h4>
                      <p className="text-sm mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <ShieldCheck className="text-primary-violet shrink-0" size={24} />
                3. Data Sharing & Retention
              </h2>
              <div className="p-6 md:p-8 bg-amber/5 rounded-lg border-2 border-dashed border-amber/20 space-y-4">
                <p>
                  We do not sell, rent, or share personal information with third parties. We do not
                  use your information for marketing or advertising. We do not run tracking scripts or
                  third-party analytics that expose your browsing behavior.
                </p>
                <p>
                  Admin metadata (appointment dates, payment records) is retained for financial
                  compliance. All session notes are deleted after report delivery unless you request
                  long-term storage for ongoing advisory relationships.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-extrabold text-2xl text-primary-dark flex items-center gap-3">
                <Lock className="text-primary-dark shrink-0" size={24} />
                4. Security
              </h2>
              <p>
                We employ industry-standard encryption for data at rest and in transit. Our
                infrastructure is hosted on encrypted servers, and we handle your story with the same
                rigor we apply to financial institutions. No unauthorized third party will access your
                data.
              </p>
            </section>
          </div>
        </motion.div>

        {/* Last revised */}
        <p className="mt-12 text-xs text-neutral-300 text-center uppercase tracking-[0.2em]">
          Last revised: {new Date().getFullYear()} · talkhumanly.com
        </p>
      </div>
    </div>
  );
}