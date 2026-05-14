"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Scribble } from "@/components/ui/Scribble";

const resources = [
  {
    title: "UAE Labour Contract Review Checklist",
    category: "Know Your Rights",
    minutes: 8,
    summary: "A plain-English checklist for reviewing clauses, probation terms, notice periods, and end-of-service questions.",
    pdf: "/resources/uae-labour-contract-review.pdf",
    gated: false,
  },
  {
    title: "What Counts as Workplace Harassment?",
    category: "Toxic Workplaces",
    minutes: 10,
    summary: "How to document patterns, preserve evidence, and decide whether to escalate internally or externally.",
    pdf: "/resources/workplace-harassment-guide.pdf",
    gated: false,
  },
  {
    title: "PIP Response Strategy",
    category: "Performance Issues",
    minutes: 12,
    summary: "A practical guide to responding to performance plans without sounding defensive or conceding too much.",
    pdf: "/resources/pip-response-strategy.pdf",
    gated: false,
  },
  {
    title: "Redundancy and Severance Preparation",
    category: "Resignations",
    minutes: 9,
    summary: "What to ask, what to avoid signing too quickly, and how to negotiate from a calm factual record.",
    pdf: "/resources/redundancy-severance-prep.pdf",
    gated: false,
  },
  {
    title: "Manager Conflict Conversation Script",
    category: "Toxic Workplaces",
    minutes: 6,
    summary: "A structured script for raising concerns while keeping the conversation professional and documented.",
    pdf: "/resources/manager-conflict-script.pdf",
    gated: false,
  },
  {
    title: "Confidentiality Before You Book",
    category: "Know Your Rights",
    minutes: 5,
    summary: "What Humanly collects, what it does not collect, and how your information is handled during intake.",
    pdf: "/resources/confidentiality-before-booking.pdf",
    gated: false,
  },
  {
    title: "Expat Rights Checklist — GCC Labor Law 2025",
    category: "Expat Labor Law",
    minutes: 14,
    summary: "Key labor law protections every expat professional should know across UAE, KSA, and Qatar.",
    pdf: "/resources/uae-labour-contract-review.pdf",
    gated: true,
  },
  {
    title: "What to Do When You Receive a PIP in the UAE",
    category: "Performance Issues",
    minutes: 11,
    summary: "Step-by-step framework: what a PIP means legally in the UAE, how to respond, and when to seek help.",
    pdf: "/resources/pip-response-strategy.pdf",
    gated: true,
  },
  {
    title: "Resign or Stay? A Decision Framework",
    category: "Resignations",
    minutes: 10,
    summary: "A practical decision tool to weigh your options when you're unsure whether to leave or fight.",
    pdf: "/resources/redundancy-severance-prep.pdf",
    gated: true,
  },
];

const categories = ["All", ...Array.from(new Set(resources.map((item) => item.category)))];

export default function ResourcesPage() {
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
    <div className="min-h-screen bg-neutral-bg pb-24 pt-28">
      {/* Header */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-violet">Resource Hub</p>
            <h1 className="mt-4 font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark">
              Practical guides for moments HR makes complicated.
            </h1>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-neutral-500">
              Guides, explainers, scripts, and scenario-based resources built for employees navigating UAE workplace questions with privacy and confidence.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-neutral-300">
              <Search className="ml-2 text-primary-violet" size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rights, harassment, PIP, severance..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-primary-dark outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-lg border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                category === item
                  ? "border-primary-violet bg-primary-violet text-white"
                  : "border-neutral-300 bg-white text-primary-dark hover:border-primary-violet"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Resource Cards */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, index) => (
            <motion.article
              key={resource.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="flex min-h-[360px] flex-col rounded-lg bg-white p-6 shadow-sm border border-neutral-300 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-violet/10 text-primary-violet">
                  {resource.gated ? <BookOpen size={22} /> : <FileText size={22} />}
                </div>
                <div className="flex items-center gap-2">
                  {resource.gated && (
                    <span className="rounded-lg bg-amber/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber">
                      Premium
                    </span>
                  )}
                  <span className="rounded-lg bg-neutral-bg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    {resource.minutes} min
                  </span>
                </div>
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-violet">{resource.category}</p>
              <h2 className="mt-2 font-extrabold text-2xl leading-tight text-primary-dark">{resource.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-neutral-500">{resource.summary}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {resource.gated ? (
                  <Link
                    href={`/resources/${resource.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-violet px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-primary-dark transition-colors"
                  >
                    Unlock Free
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/resources/${resource.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark hover:border-primary-violet transition-colors"
                    >
                      Read article
                      <ArrowRight size={16} />
                    </Link>
                    <a
                      href={resource.pdf}
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-primary-violet transition-colors"
                    >
                      <Download size={16} />
                      PDF
                    </a>
                  </>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-5 md:px-[64px] max-w-7xl mx-auto mt-24">
        <div className="rounded-lg bg-primary-dark p-10 md:p-14 text-white text-center relative overflow-hidden">
          <Scribble variant="sparkle" className="absolute top-6 right-6 w-20 h-20 text-amber/20" />
          <div className="relative z-10">
            <ShieldCheck className="mx-auto text-amber mb-6" size={40} />
            <h2 className="font-extrabold text-[32px] leading-[1.3] mb-4">
              Need something more specific?
            </h2>
            <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
              Book a Triage session and Karma will provide personalized guidance tailored to your exact situation.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-amber text-primary-dark px-8 py-4 rounded-full text-sm font-bold uppercase tracking-[0.12em] hover:bg-amber/90 transition-colors"
            >
              Book Your Triage
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}