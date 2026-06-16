"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, Search } from "lucide-react";
import { formatUsd } from "@/lib/products";
import type { Resource } from "@/lib/resources";

export function ResourcesBrowser({ resources }: { resources: Resource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(resources.map((resource) => resource.category)))];
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const matchesQuery = `${resource.title} ${resource.category} ${resource.summary}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || resource.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, query, resources]);

  return (
    <>
      <section className="mx-auto max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
              <span className="h-2 w-2 rounded-full bg-accent-orange" /> Resource Hub
            </span>
            <h1 className="mt-5 font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
              Practical guides for moments HR makes complicated.
            </h1>
          </div>
          <div>
            <p className="text-body-lg leading-relaxed text-neutral-500">
              Guides, explainers, scripts, and scenario-based resources for employees navigating UAE and GCC workplace questions.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 p-2 pl-4 transition focus-within:shadow-pop-sm">
              <Search className="text-primary-violet" size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rights, harassment, PIP, severance..."
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-primary-dark outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
        <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border-2 border-primary-dark px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-all ${
                category === item
                  ? "bg-accent-orange text-primary-dark shadow-pop-sm"
                  : "bg-neutral-100 text-primary-dark hover:bg-violet-tint"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-12 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <article
              key={resource.slug}
              className="flex min-h-[360px] flex-col rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
                  {resource.gated ? <BookOpen size={22} /> : <FileText size={22} />}
                </div>
                <div className="flex items-center gap-2">
                  {resource.gated && (
                    <span className="rounded-full border-2 border-primary-dark bg-accent-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-dark">
                      {resource.amount ? formatUsd(resource.amount) : "Premium"}
                      {resource.interval ? "/mo" : ""}
                    </span>
                  )}
                  <span className="rounded-full border border-neutral-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                    {resource.membership ? "Membership" : `${resource.minutes} min`}
                  </span>
                </div>
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-violet">
                {resource.category}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-primary-dark">{resource.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-neutral-500">{resource.summary}</p>
              <p className="mt-5 text-xs text-neutral-400">
                Updated {resource.updatedAt} · Reviewed by {resource.reviewer}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/resources/${resource.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark transition-colors hover:bg-violet-tint"
                >
                  Read article
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                {!resource.gated && (
                  <a
                    href={resource.pdf}
                    download
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-primary-dark px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-on-primary transition-colors hover:bg-primary-violet"
                  >
                    <Download size={16} strokeWidth={2.5} />
                    PDF
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
