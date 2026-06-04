"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Award, Building2, Globe, Heart, MapPin, Quote } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const careerTimeline = [
  { year: "2003", event: "Began HR career in Dubai — multinational corporate environment" },
  { year: "2008", event: "Led HR transformation across MENA region for a Fortune 500" },
  { year: "2013", event: "Advised C-suite on complex employee relations across UAE, KSA, and Qatar" },
  { year: "2018", event: "Built people functions for scaling tech startups — hiring to exits" },
  { year: "2024", event: "Founded Humanly — independent, confidential HR advisory for employees" },
];

const values = [
  { title: "Radical Empathy", desc: "We listen without judgment. Your perspective is the one that matters most.", icon: Heart, tint: "bg-violet-tint" },
  { title: "Neutral Ground", desc: "No stake in your company's politics, no reporting to management, no conflict of interest.", icon: Building2, tint: "bg-orange-tint" },
  { title: "Pure Clarity", desc: "We cut through legalese and corporate double-speak to tell you what's actually happening — and what you can do.", icon: Globe, tint: "bg-violet-tint" },
];

const credentials = [
  "20+ years in HR leadership",
  "UAE, KSA, Qatar experience",
  "CIPD qualified",
  "Fortune 500 background",
  "Startup scaling expertise",
  "Employee relations specialist",
  "Arabic & English fluent",
  "GCC labour law depth",
];

export default function AboutPage() {
  return (
    <div className="overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      {/* Hero */}
      <section className="relative mx-auto grid max-w-max-width items-center gap-12 px-margin-mobile md:grid-cols-12 md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        {/* Visual */}
        <div className="relative order-2 md:order-1 md:col-span-5">
          <div className="blob absolute -left-6 -top-6 -z-10 h-44 w-44 bg-accent-orange/30" />
          <Scribble variant="loop" color="#7c3aed" className="absolute -right-6 -top-8 h-24 w-24 opacity-60" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-primary-dark shadow-pop">
            <img
              alt="Karma Harb — founder of Humanly, HR advisor"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <div className="absolute -bottom-5 -right-3 rotate-[4deg] rounded-2xl border-2 border-primary-dark bg-accent-orange px-5 py-3 text-primary-dark shadow-pop-sm">
            <p className="font-display text-2xl font-extrabold leading-none">20+ yrs</p>
            <p className="text-[11px] font-bold uppercase tracking-wider">in HR leadership</p>
          </div>
        </div>

        {/* Copy */}
        <div className="order-1 flex flex-col gap-7 md:order-2 md:col-span-7 md:pl-6">
          <span className="inline-flex w-max items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-accent-orange" /> The Founder
          </span>
          <h1 className="font-display text-h1-mobile font-extrabold leading-[1.04] tracking-tight text-primary-dark md:text-h1-desktop">
            Executive experience.{" "}
            <span className="relative inline-block text-primary-violet">
              Human approach.
              <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className="max-w-prose text-body-lg leading-relaxed text-neutral-500">
            20+ years in Human Resources across the UAE, Saudi Arabia, and international environments — combining the strategic weight of a C-Suite executive with the empathy of a coach.
          </p>
          <div className="relative rounded-3xl border-2 border-primary-dark bg-violet-tint p-7">
            <span className="absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-primary-dark">
              <Quote size={15} />
            </span>
            <p className="font-display text-h3 font-bold italic text-primary-dark">&ldquo;Everyone deserves to feel heard at work.&rdquo;</p>
          </div>
        </div>
      </section>

      {/* Timeline + philosophy */}
      <section className="mx-auto mt-24 grid max-w-max-width gap-16 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div>
          <h2 className="mb-8 font-display text-h2 font-extrabold tracking-tight text-primary-dark">The path to Humanly</h2>
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-7 before:top-4 before:w-0.5 before:bg-neutral-300">
            {careerTimeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative flex gap-5"
              >
                <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-dark bg-primary-dark font-display text-sm font-extrabold text-on-primary">
                  {item.year}
                </div>
                <p className="pt-3 leading-relaxed text-neutral-500">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="mb-4 font-display text-h2 font-extrabold tracking-tight text-primary-dark">Why I built Humanly</h2>
            <div className="space-y-4 leading-relaxed text-neutral-500">
              <p>After two decades inside HR departments — Fortune 500s, scaling startups, and everything between — I saw the same pattern repeat: professionals facing workplace challenges had no one truly on their side.</p>
              <p>Internal HR protects the business. Employment lawyers escalate to litigation. The space between — where most people actually need help — was empty. Humanly fills that space.</p>
              <p>We provide the confidential, practical guidance I wish every professional had access to — without fear, without judgment, and without a corporate agenda.</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary-dark">
              <Award className="text-accent-orange" size={22} />
              Credentials &amp; expertise
            </h3>
            <ul className="grid grid-cols-1 gap-3 text-sm text-neutral-500 sm:grid-cols-2">
              {credentials.map((cred) => (
                <li key={cred} className="flex items-center gap-2 rounded-2xl border-2 border-primary-dark bg-neutral-100 p-3.5">
                  <MapPin className="shrink-0 text-primary-violet" size={15} />
                  <span className="font-medium text-primary-dark">{cred}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 text-center">
          <Scribble variant="star-fill" color="#ff6a1a" className="mx-auto mb-4 h-10 w-10 animate-wiggle" />
          <h2 className="font-display text-h2 font-extrabold tracking-tight text-primary-dark">The values we live by</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-3xl border-2 border-primary-dark ${value.tint} p-9 transition-transform hover:-translate-y-1`}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary-dark bg-neutral-100 text-primary-violet">
                <value.icon size={26} />
              </div>
              <h3 className="font-display text-h3 font-bold text-primary-dark">{value.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-500">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-center text-on-primary shadow-pop-orange md:p-16">
          <Scribble variant="loop" color="#ff6a1a" className="absolute -left-6 -top-6 h-28 w-28 opacity-25" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute right-10 top-10 hidden h-8 w-8 animate-float md:block" />
          <div className="relative z-10">
            <h2 className="font-display text-h2 font-extrabold tracking-tight">Ready to talk?</h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-primary/70">
              Karma reads every intake form personally. Your situation deserves a human response — not a template.
            </p>
            <Link
              href="/booking"
              className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
            >
              Book a Confidential Session
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
