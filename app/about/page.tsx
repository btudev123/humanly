"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  Globe,
  Heart,
  MapPin,
  Quote,
  ScanSearch,
  ClipboardList,
  Network,
  Scale,
  Repeat,
} from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

// Karma's real career path — organisations, no fabricated dates.
const careerPath = [
  { org: "Canadian Security Intelligence Service", note: "Began her career inside one of Canada's most sensitive, regulated environments." },
  { org: "Government of Alberta", note: "Broader public-service HR, including an embedded advisory role during the COVID-19 response." },
  { org: "CBC / Radio-Canada", note: "People and employee-relations work inside national public media." },
  { org: "Canada's national investment regulator", note: "Led HR through the IIROC and MFDA merger that formed CIRO." },
  { org: "Multi-entity investment group — UAE, KSA & Pakistan", note: "Led the HR function across borders and employment-law regimes." },
  { org: "Founded Humanly", note: "Independent, confidential HR advisory built for employees, not employers." },
];

const expertise = [
  { title: "Workplace investigations", desc: "Complex, sensitive investigations across jurisdictions — harassment, misconduct, policy breach. I know how they should work, and where they go wrong.", icon: ScanSearch },
  { title: "Performance management & PIPs", desc: "From issuing PIPs to managing terminations with legal precision and human care. If you've received one, I can tell you what it really means.", icon: ClipboardList },
  { title: "Restructuring & workforce change", desc: "Led redundancies, entity wind-downs, and cross-border relocations. I know what you're entitled to and how the process must be run.", icon: Network },
  { title: "Employee relations & labour law", desc: "Advising on UAE Federal Decree-Law No. 33 of 2021, KSA labour law, GCC frameworks, and North American employment law — translated into the practical.", icon: Scale },
  { title: "Change management", desc: "Prosci Certified Change Practitioner. Led one of Canada's most significant recent regulatory transformations and pandemic-era HR response.", icon: Repeat },
];

const values = [
  { title: "Radical Empathy", desc: "We listen without judgment. Your perspective is the one that matters most.", icon: Heart, tint: "bg-violet-tint" },
  { title: "Neutral Ground", desc: "No stake in your company's politics, no reporting to management, no conflict of interest.", icon: Building2, tint: "bg-orange-tint" },
  { title: "Pure Clarity", desc: "We cut through legalese and corporate double-speak to tell you what's actually happening — and what you can do.", icon: Globe, tint: "bg-violet-tint" },
];

const credentials = [
  "~20 years in HR leadership",
  "Master's in HR & Employment Relations",
  "Prosci Certified Change Practitioner",
  "Regulated industries, government & media",
  "Investment-management HR leadership",
  "UAE, KSA, Pakistan & Canada experience",
  "Workplace investigations specialist",
  "GCC & North American labour law",
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
          <Scribble variant="loop" color="#7c35e3" className="absolute -right-6 -top-8 h-24 w-24 opacity-60" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-primary-dark shadow-pop">
            <img
              alt="Karma Harb — founder of Humanly, HR advisor"
              className="h-full w-full object-cover"
              src="/karma-harb.png"
            />
          </div>
          <div className="absolute -bottom-5 -right-3 rotate-[4deg] rounded-2xl border-2 border-primary-dark bg-accent-orange px-5 py-3 text-primary-dark shadow-pop-sm">
            <p className="font-display text-2xl font-extrabold leading-none">~20 yrs</p>
            <p className="text-[11px] font-bold uppercase tracking-wider">in HR leadership</p>
          </div>
        </div>

        {/* Copy */}
        <div className="order-1 flex flex-col gap-7 md:order-2 md:col-span-7 md:pl-6">
          <span className="inline-flex w-max items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
            <span className="h-2 w-2 rounded-full bg-accent-orange" /> About Karma Harb
          </span>
          <h1 className="font-display text-h1-mobile font-extrabold leading-[1.04] tracking-tight text-primary-dark md:text-h1-desktop">
            HR expertise that{" "}
            <span className="relative inline-block text-primary-violet">
              puts people first.
              <Scribble variant="underline-bold" color="#fda544" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
            </span>
          </h1>
          <p className="max-w-prose text-body-lg leading-relaxed text-neutral-500">
            I&apos;m Karma Harb, a Human Resources leader with close to 20 years of experience across
            regulated industries, government, media, and investment management — from the Canadian
            Security Intelligence Service to leading HR across a multi-entity investment group spanning
            the UAE, Saudi Arabia, and Pakistan. I founded Humanly because every working person
            deserves access to honest, expert HR guidance — not just those with a seat at the
            boardroom table.
          </p>
          <div className="relative rounded-3xl border-2 border-primary-dark bg-violet-tint p-7">
            <span className="absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-primary-dark">
              <Quote size={15} />
            </span>
            <p className="font-display text-h3 font-bold italic text-primary-dark">
              &ldquo;Your HR manages the workplace. We manage your career.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Career path + why */}
      <section className="mx-auto mt-24 grid max-w-max-width gap-16 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div>
          <h2 className="mb-8 font-display text-h2 font-extrabold tracking-tight text-primary-dark">The path to Humanly</h2>
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-7 before:top-4 before:w-0.5 before:bg-neutral-300">
            {careerPath.map((item, i) => (
              <motion.div
                key={item.org}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative flex gap-5"
              >
                <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-dark bg-primary-dark font-display text-sm font-extrabold text-on-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="pt-1.5">
                  <p className="font-bold text-primary-dark">{item.org}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-neutral-500">{item.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="mb-4 font-display text-h2 font-extrabold tracking-tight text-primary-dark">Why I created Humanly</h2>
            <div className="space-y-4 leading-relaxed text-neutral-500">
              <p>For years, people have been finding their way to me. Former colleagues. Friends of friends. People who had just walked out of a difficult meeting with HR and didn&apos;t know what had happened to them. People who&apos;d received a performance improvement plan and had no idea what it meant for their future.</p>
              <p>The calls kept coming, and the questions were always serious — terminations, investigations, what they were actually entitled to, whether what was happening to them was even legal. The more time I spent in senior HR roles, the more clearly I saw the gap between what employees experience and the support available to them.</p>
              <p>Humanly is the answer to those calls. Expert, honest, human HR guidance — from someone who has sat on both sides of the table and knows exactly how these conversations work.</p>
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

      {/* What I bring to the table */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-display text-h2 font-extrabold tracking-tight text-primary-dark">What I bring to the table</h2>
          <p className="mt-3 leading-relaxed text-neutral-500">
            My experience is not theoretical. It was built across real organisations, real situations,
            and real people — and it&apos;s exactly what I bring to your corner.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {expertise.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-7 transition-transform hover:-translate-y-1"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
                <item.icon size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-primary-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-24 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 text-center">
          <Scribble variant="star-fill" color="#fda544" className="mx-auto mb-4 h-10 w-10 animate-wiggle" />
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
          <Scribble variant="loop" color="#fda544" className="absolute -left-6 -top-6 h-28 w-28 opacity-25" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute right-10 top-10 hidden h-8 w-8 animate-float md:block" />
          <div className="relative z-10">
            <h2 className="font-display text-h2 font-extrabold tracking-tight">Ready to talk to someone who actually knows this?</h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-on-primary/70">
              Karma reads every intake personally. Whether you&apos;re dealing with a situation right now
              or simply want to understand your options, it&apos;s a confidential, no-pressure conversation.
            </p>
            <Link
              href="/booking"
              className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
            >
              Book a Confidential Consultation
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
