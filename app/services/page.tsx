"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BrainCircuit, BriefcaseBusiness, CheckCircle2, HeartHandshake, Scale, ShieldCheck, Users } from "lucide-react";

const services = [
  {
    title: "Workplace Conflict Advocacy",
    scope: "For manager conflict, bullying patterns, retaliation concerns, grievance preparation, and situations where internal HR does not feel neutral.",
    process: ["Clarify the facts", "Map risk and leverage", "Prepare the next conversation"],
    for: "Employees who need calm, strategic language before escalation.",
    icon: Users,
  },
  {
    title: "Contract and Rights Education",
    scope: "Plain-English support around UAE labour law questions, contract terms, notice periods, end-of-service concerns, probation, and restrictive clauses.",
    process: ["Review key clauses", "Flag questions", "Prepare negotiation points"],
    for: "People who want to understand their position before signing or resigning.",
    icon: Scale,
  },
  {
    title: "PIP and Performance Response",
    scope: "Structured preparation for performance improvement plans, unclear expectations, sudden negative feedback, or documentation that feels unfair.",
    process: ["Audit evidence", "Draft a response", "Create a meeting script"],
    for: "Employees who need to protect their record without sounding defensive.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Exit, Severance and Redundancy Planning",
    scope: "Guidance for resignation, redundancy meetings, severance conversations, handover pressure, references, and reputation protection.",
    process: ["Define outcomes", "Sequence asks", "Prepare written follow-up"],
    for: "Employees considering or facing an exit who want dignity and leverage.",
    icon: HeartHandshake,
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-28">
      <section className="px-5">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-violet">Services</p>
            <h1 className="mt-5 font-serif text-6xl font-black italic leading-[0.9] text-primary-purple md:text-8xl">
              Expert support for the conversations that change work.
            </h1>
          </div>
          <p className="text-xl leading-relaxed text-primary-purple/64">
            Humanly combines senior HR judgment, workplace rights education, and practical communication support. We are not a law firm. We help you understand options, prepare language, and make decisions with dignity.
          </p>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-lg bg-white p-7 shadow-xl shadow-primary-purple/5 ring-1 ring-primary-purple/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-violet text-white">
                <service.icon size={22} />
              </div>
              <h2 className="mt-8 text-3xl font-black leading-tight text-primary-purple">{service.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-primary-purple/60">{service.scope}</p>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary-orange">Process</p>
                  <ul className="mt-4 space-y-3">
                    {service.process.map((item) => (
                      <li key={item} className="flex gap-3 text-primary-purple">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-primary-violet" size={18} />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary-orange">Who it is for</p>
                  <p className="mt-4 leading-relaxed text-primary-purple/60">{service.for}</p>
                </div>
              </div>
              <Link href="/booking" className="mt-8 inline-flex items-center gap-3 rounded-lg bg-primary-purple px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white">
                Book Consultation
                <ArrowRight size={17} />
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-lg bg-primary-purple p-8 text-white lg:grid-cols-[1fr_1fr] lg:p-10">
          <div>
            <ShieldCheck className="text-secondary-orange" size={34} />
            <h2 className="mt-6 font-serif text-5xl font-black italic">The confidentiality promise.</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              We do not alert employers, sell workplace data, or accept employer-side advisory work that would compromise individual trust.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 p-6 ring-1 ring-white/10">
            <BrainCircuit className="text-secondary-pink" size={32} />
            <h3 className="mt-5 text-2xl font-black">AI-assisted, human-led</h3>
            <p className="mt-3 leading-relaxed text-white/70">
              Any AI-supported drafting should use the pro model tier configured for production quality. Final recommendations remain reviewed through Humanly's advocacy lens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
