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
  {
    title: "Radical Empathy",
    desc: "We listen without judgment. Your perspective is the one that matters most.",
    icon: Heart,
  },
  {
    title: "Neutral Ground",
    desc: "We have no stake in your company's politics, no reporting to management, no conflict of interest.",
    icon: Building2,
  },
  {
    title: "Pure Clarity",
    desc: "We cut through legalities and corporate double-speak to tell you what's actually happening and what you can do.",
    icon: Globe,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-bg pb-24 pt-28">
      {/* Hero */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto grid md:grid-cols-12 gap-10 items-center">
        {/* Left: Visual */}
        <div className="md:col-span-5 relative order-2 md:order-1 mt-12 md:mt-0">
          <div className="rounded-xl overflow-hidden border border-neutral-300 bg-white relative aspect-[4/5]">
            <img
              alt="Karma Harb — founder of Humanly, HR advisor"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
            />
          </div>
          <Scribble variant="circle" className="absolute -top-8 -left-8 w-24 h-24 text-amber/40 pointer-events-none" />
        </div>

        {/* Right: Copy */}
        <div className="md:col-span-6 md:col-start-7 flex flex-col gap-8 order-1 md:order-2">
          <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
            Executive Experience.
            <br />
            <span className="text-primary-violet">Human Approach.</span>
          </h1>

          <div className="flex flex-col gap-4">
            <div className="relative inline-block w-max">
              <h2 className="font-semibold text-[32px] leading-[1.3] text-primary-dark">Karma Harb, Founder</h2>
              <Scribble variant="underline" className="absolute -bottom-2 left-0 w-full h-3 text-amber" />
            </div>
            <p className="text-lg leading-relaxed text-neutral-500 max-w-prose">
              20+ years in Human Resources across the UAE, Saudi Arabia, and international environments. Combines the strategic weight of a C-Suite executive with the empathy of a coach.
            </p>
          </div>

          {/* Quote block */}
          <div className="p-6 bg-white border border-neutral-300 rounded-lg relative">
            <div className="absolute -top-4 -left-4 bg-primary-violet text-white rounded-full w-8 h-8 flex items-center justify-center">
              <Quote size={14} />
            </div>
            <p className="font-semibold text-2xl leading-relaxed text-primary-dark italic">
              &ldquo;Everyone deserves to feel heard at work.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Career Timeline + Philosophy */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24 grid md:grid-cols-2 gap-16">
        {/* Timeline */}
        <div>
          <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark mb-8">
            The Path to Humanly
          </h2>
          <div className="space-y-6">
            {careerTimeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-5"
              >
                <div className="shrink-0 w-16 h-10 rounded-lg bg-primary-dark text-white flex items-center justify-center font-extrabold text-sm">
                  {item.year}
                </div>
                <p className="text-base leading-relaxed text-neutral-500 pt-1">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Philosophy + Credentials */}
        <div className="space-y-10">
          <div>
            <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark mb-4">
              Why I Built Humanly
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-neutral-500">
              <p>
                After two decades inside HR departments — Fortune 500s, scaling startups, and everything between — I saw the same pattern repeat: professionals facing workplace challenges had no one truly on their side.
              </p>
              <p>
                Internal HR protects the business. Employment lawyers escalate to litigation. The space between — where most people actually need help — was empty. Humanly fills that space.
              </p>
              <p>
                We provide the confidential, practical guidance that I wish every professional had access to — without fear, without judgment, and without a corporate agenda.
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="font-semibold text-xl text-primary-dark mb-4 flex items-center gap-2">
              <Award className="text-amber" size={22} />
              Credentials & Expertise
            </h3>
            <ul className="grid grid-cols-2 gap-3 text-sm text-neutral-500">
              {[
                "20+ years in HR leadership",
                "UAE, KSA, Qatar experience",
                "CIPD qualified",
                "Fortune 500 background",
                "Startup scaling expertise",
                "Employee relations specialist",
                "Arabic & English fluent",
                "GCC labor law depth",
              ].map((cred) => (
                <li key={cred} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-neutral-300">
                  <MapPin className="text-primary-violet shrink-0" size={14} />
                  <span>{cred}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24">
        <div className="text-center mb-12">
          <Scribble variant="sparkle" className="mx-auto w-16 h-16 text-amber/30 mb-4" />
          <h2 className="font-extrabold text-[32px] leading-[1.3] text-primary-dark">The values we live by.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white p-10 rounded-lg border border-neutral-300 shadow-sm hover:shadow-xl transition-shadow"
            >
              <value.icon className="text-primary-violet mb-6" size={40} />
              <h3 className="font-extrabold text-2xl text-primary-dark mb-3">{value.title}</h3>
              <p className="text-base leading-relaxed text-neutral-500">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24">
        <div className="rounded-lg bg-primary-dark p-10 md:p-14 text-white text-center relative overflow-hidden">
          <Scribble variant="sparkle" className="absolute top-6 left-6 w-20 h-20 text-amber/20" />
          <div className="relative z-10">
            <h2 className="font-extrabold text-[32px] leading-[1.3] mb-4">
              Ready to talk?
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
              Karma reads every intake form personally. Your situation deserves a human response — not a template.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-amber text-primary-dark px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.12em] hover:bg-amber/90 transition-colors"
            >
              Book a Confidential Session
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}