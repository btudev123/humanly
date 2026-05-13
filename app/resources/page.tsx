"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Download, FileText, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const resources = [
  {
    title: "UAE Labour Contract Review Checklist",
    category: "UAE Labour Law",
    minutes: 8,
    summary: "A plain-English checklist for reviewing clauses, probation terms, notice periods, and end-of-service questions.",
    pdf: "/resources/uae-labour-contract-review.pdf",
  },
  {
    title: "What Counts as Workplace Harassment?",
    category: "Workplace Safety",
    minutes: 10,
    summary: "How to document patterns, preserve evidence, and decide whether to escalate internally or externally.",
    pdf: "/resources/workplace-harassment-guide.pdf",
  },
  {
    title: "PIP Response Strategy",
    category: "Performance",
    minutes: 12,
    summary: "A practical guide to responding to performance plans without sounding defensive or conceding too much.",
    pdf: "/resources/pip-response-strategy.pdf",
  },
  {
    title: "Redundancy and Severance Preparation",
    category: "Exits",
    minutes: 9,
    summary: "What to ask, what to avoid signing too quickly, and how to negotiate from a calm factual record.",
    pdf: "/resources/redundancy-severance-prep.pdf",
  },
  {
    title: "Manager Conflict Conversation Script",
    category: "Communication",
    minutes: 6,
    summary: "A structured script for raising concerns while keeping the conversation professional and documented.",
    pdf: "/resources/manager-conflict-script.pdf",
  },
  {
    title: "Confidentiality Before You Book",
    category: "Privacy",
    minutes: 5,
    summary: "What Humanly collects, what it does not collect, and how your information is handled during intake.",
    pdf: "/resources/confidentiality-before-booking.pdf",
  },
];

const categories = ["All", ...Array.from(new Set(resources.map((item) => item.category)))];

export default function Resources() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const matchesQuery = `${resource.title} ${resource.category} ${resource.summary}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || resource.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-28">
      <section className="px-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-violet">Resource hub</p>
              <h1 className="mt-5 font-serif text-6xl font-black italic leading-[0.9] text-primary-purple md:text-8xl">
                Practical guides for moments HR makes complicated.
              </h1>
            </div>
            <div>
              <p className="text-xl leading-relaxed text-primary-purple/64">
                Guides, explainers, scripts, glossary entries, and scenario-based articles built for employees navigating UAE workplace questions with privacy and confidence.
              </p>
              <div className="mt-7 flex items-center gap-3 rounded-lg bg-white p-3 shadow-xl shadow-primary-purple/5 ring-1 ring-primary-purple/10">
                <Search className="ml-2 text-primary-violet" size={21} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search rights, harassment, PIP, severance..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-primary-purple outline-none placeholder:text-primary-purple/35"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-lg border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] ${
                  category === item ? "border-primary-violet bg-primary-violet text-white" : "border-primary-purple/10 bg-white text-primary-purple"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, index) => (
            <motion.article
              key={resource.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="flex min-h-[360px] flex-col rounded-lg bg-white p-6 shadow-xl shadow-primary-purple/5 ring-1 ring-primary-purple/10"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-violet/10 text-primary-violet">
                  <FileText size={22} />
                </div>
                <span className="rounded-lg bg-[#FAFAFA] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary-purple/50">
                  {resource.minutes} min
                </span>
              </div>
              <p className="mt-8 text-[10px] font-black uppercase tracking-[0.22em] text-secondary-orange">{resource.category}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-primary-purple">{resource.title}</h2>
              <p className="mt-4 flex-1 leading-relaxed text-primary-purple/58">{resource.summary}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-purple/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-primary-purple">
                  Read article
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={resource.pdf}
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-purple px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-5">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-lg bg-primary-purple p-8 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/58">
              <ShieldCheck size={16} className="text-secondary-orange" />
              Confidential learning path
            </div>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">Not ready to book? Stay informed privately.</h2>
            <p className="mt-3 text-white/68">Monthly workplace rights notes, scripts, and scenario explainers.</p>
          </div>
          <form className="flex gap-3">
            <input className="min-w-0 rounded-lg border border-white/15 bg-white/10 px-4 py-4 text-white placeholder:text-white/46" placeholder="Email address" type="email" />
            <button className="rounded-lg bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-primary-purple">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
