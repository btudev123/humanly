"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { ShieldCheck, Lock, EyeOff, HardDrive } from "lucide-react";

export default function Privacy() {
  return (
    <div className="overflow-clip bg-surface">
      <div className="mx-auto max-w-4xl px-margin-mobile pb-24 pt-32 md:px-margin-desktop md:pt-40">
        {/* Header */}
        <header className="relative mb-14 text-center">
          <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
          <Scribble variant="spiral" color="#9d5cff" className="absolute right-10 top-0 hidden h-16 w-16 opacity-40 md:block" />
          {/* Block wrapper: otherwise this pill and the `inline-block` h1 share a line on wide screens. */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
              <ShieldCheck size={13} className="text-primary-violet" /> Data first. Humans always.
            </span>
          </div>
          <h1 className="text-h1 mt-6 inline-block font-display font-extrabold tracking-tight text-primary-dark">
            Privacy{" "}
            <span className="relative inline-block">
              Policy
              <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
            How we handle information at Humanly — transparent, minimal, and never shared.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop md:p-14"
        >
          <div className="relative z-10 space-y-12 leading-relaxed text-neutral-500">
            <section className="space-y-4">
              <h2 className="text-h3 flex items-center gap-3 font-display font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet"><EyeOff size={20} /></span>
                1. Confidentiality Commitment
              </h2>
              <p>
                Humanly does not contact your employer. Ever. Under no circumstances will we share your identity, the content of your consultations, or any related documentation with your organization, its representatives, or any third party without your express written consent.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-h3 flex items-center gap-3 font-display font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-orange-tint text-accent-orange"><HardDrive size={20} /></span>
                2. Data We Collect
              </h2>
              <p>We gather only what&apos;s necessary to serve you effectively, securely, and confidentially:</p>
              <ul className="grid gap-3">
                {[
                  { label: "Name & email", detail: "Needed for booking, confirmation, and report delivery." },
                  { label: "Session intake notes", detail: "Stored encrypted; deleted after report delivery unless you request otherwise." },
                  { label: "Payment information", detail: "Processed entirely via Stripe. Humanly never sees or stores your full card details." },
                  { label: "Resource download data", detail: "Limited to email and name for gated content delivery." },
                ].map((item) => (
                  <li key={item.label} className="flex gap-4 rounded-2xl border-2 border-primary-dark/20 bg-surface-container-low p-5">
                    <Lock className="mt-0.5 shrink-0 text-primary-violet" size={18} />
                    <div>
                      <h4 className="font-bold text-primary-dark">{item.label}</h4>
                      <p className="mt-0.5 text-sm">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-h3 flex items-center gap-3 font-display font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet"><ShieldCheck size={20} /></span>
                3. Data Sharing & Retention
              </h2>
              <div className="space-y-4 rounded-2xl border-2 border-dashed border-accent-orange/40 bg-orange-tint p-6 md:p-8">
                <p>
                  We do not sell, rent, or share personal information with third parties. We do not use your information for marketing or advertising. We do not run tracking scripts or third-party analytics that expose your browsing behavior.
                </p>
                <p>
                  Admin metadata (appointment dates, payment records) is retained for financial compliance. All session notes are deleted after report delivery unless you request long-term storage for ongoing advisory relationships.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-h3 flex items-center gap-3 font-display font-bold text-primary-dark">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-dark"><Lock size={20} /></span>
                4. Security
              </h2>
              <p>
                We employ industry-standard encryption for data at rest and in transit. Our infrastructure is hosted on encrypted servers, and we handle your story with the same rigor we apply to financial institutions. No unauthorized third party will access your data.
              </p>
            </section>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-xs uppercase tracking-[0.2em] text-neutral-400">
          Last revised: {new Date().getFullYear()} · talkhumanly.com
        </p>
      </div>
    </div>
  );
}
