"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

const factors = [
  "Financial safety net",
  "Role satisfaction",
  "Manager relationship",
  "Wellbeing impact",
  "Team & culture",
  "Career growth here",
  "External opportunities",
  "Personal values alignment",
  "Visa / immigration stability",
  "Gut instinct about staying",
];

const middlePaths = [
  "Negotiate an exit package",
  "Request a role transfer",
  "Take medical leave to reset",
  "A direct conversation with leadership",
  "Raise a formal grievance",
  "Set a deadline — stay until X happens",
  "Begin a quiet job search while staying",
  "Request a sabbatical",
];

const steps = [
  {
    title: "Pause before you decide anything",
    body: "Decisions made in the heat of a hard moment are rarely the right ones. Before anything else: did something just trigger this — a bad meeting, a review? Are you in fight-or-flight, or genuine reflection? Can you give yourself 24–48 hours before doing anything formal? If you're not calm, your job right now isn't to decide. It's to stabilise.",
  },
  {
    title: "Face your financial reality",
    body: "How you leave determines what you receive. Resigning may forfeit end-of-service entitlements that termination would preserve. Do you have 3–6 months of expenses without salary? What's your visa grace period? Which fixed obligations depend on your income? Know the numbers before you move — resigning feels like control, but it's often the costlier path.",
  },
  {
    title: "Ask the honest questions",
    body: "Across four lenses — the work itself (does it still use your strengths?), the people (one person or the whole system?), your wellbeing (is it costing you your health?), and your future (where does staying put you in 12 months?). Be honest; this is for you.",
  },
];

export default function ResignOrStay() {
  const [scores, setScores] = useState<number[]>(Array(10).fill(3));
  const [open, setOpen] = useState<number | null>(0);

  const total = scores.reduce((a, b) => a + b, 0);
  const pct = Math.round((total / (factors.length * 5)) * 100);

  const result = useMemo(() => {
    if (pct >= 65)
      return { tone: "text-primary-violet", bar: "bg-primary-violet", msg: "Your scores lean toward staying. There's enough here worth protecting or working with — but watch the factors dragging the score down." };
    if (pct >= 40)
      return { tone: "text-accent-orange", bar: "bg-accent-orange", msg: "Your scores are genuinely mixed — real trade-offs on both sides. The middle-path options below are worth exploring carefully before you commit." };
    return { tone: "text-coral", bar: "bg-coral", msg: "Your scores lean toward leaving. Multiple dimensions aren't working for you. The question now is how to leave well — on your terms, with your entitlements protected." };
  }, [pct]);

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <div className="mx-auto max-w-3xl">
        <Link href="/resources" className="mb-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-2 text-sm font-bold text-primary-dark transition-colors hover:bg-violet-tint">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to resources
        </Link>

        <div className="rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-7 shadow-pop sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-violet-tint px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark">
            Free framework · no sign-up
          </p>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-tight tracking-tight text-primary-dark">
            Resign or Stay?
          </h1>
          <p className="mt-3 text-lg text-neutral-500">
            One of the hardest decisions in your working life. This won&apos;t make it for you — but it
            will help you think it through clearly, honestly, and on your own terms.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <div key={step.title} className="overflow-hidden rounded-2xl border-2 border-primary-dark bg-neutral-100">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-tint font-bold text-primary-dark">{i + 1}</span>
                <span className="flex-1 font-semibold text-primary-dark">{step.title}</span>
                <ChevronRight size={20} className={`shrink-0 text-neutral-400 transition-transform ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 pl-[4.5rem] text-sm leading-relaxed text-neutral-500">{step.body}</p>}
            </div>
          ))}
        </div>

        {/* Scoring */}
        <div className="mt-6 rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-7 sm:p-9">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-primary-dark">Score your situation</h2>
          <p className="mt-2 text-sm text-neutral-500">Rate each factor from 1 (strongly favours leaving) to 5 (strongly favours staying). Honest answers only — this is for you.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {factors.map((f, i) => (
              <label key={f} className="flex items-center gap-3 text-sm">
                <span className="flex-1 text-primary-dark">{f}</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={scores[i]}
                  onChange={(e) => setScores((prev) => { const n = [...prev]; n[i] = Number(e.target.value); return n; })}
                  className="w-24 accent-primary-violet"
                />
                <span className="w-4 text-right font-bold text-primary-dark">{scores[i]}</span>
              </label>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border-l-4 border-primary-dark bg-violet-tint p-5">
            <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div className={`h-full rounded-full ${result.bar} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <p className={`font-display text-xl font-extrabold ${result.tone}`}>{total} / {factors.length * 5}</p>
            <p className="mt-1 text-sm leading-relaxed text-primary-dark">{result.msg}</p>
          </div>
        </div>

        {/* Middle paths */}
        <div className="mt-6 rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-7 sm:p-9">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-primary-dark">The options in between</h2>
          <p className="mt-2 text-sm text-neutral-500">Resign or stay isn&apos;t always the only binary. Before you commit, consider whether any of these are available to you.</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {middlePaths.map((p) => (
              <span key={p} className="rounded-full border-2 border-primary-dark bg-violet-tint px-4 py-1.5 text-sm font-semibold text-primary-dark">{p}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[2rem] border-2 border-primary-dark bg-primary-dark p-8 text-on-primary shadow-pop-orange sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-extrabold">Not sure what to do next?</p>
            <p className="mt-1 text-sm text-on-primary/70">Speak confidentially with a Humanly advisor — no judgment, no agenda, just clarity.</p>
          </div>
          <Link href="/booking" className="btn-pop inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-pop-sm">
            Book a consultation
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-neutral-400">
          This framework is for information only and does not constitute legal, HR, or financial advice.
        </p>
      </div>
    </div>
  );
}
