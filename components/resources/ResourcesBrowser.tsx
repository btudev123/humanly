"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileText, Search } from "lucide-react";
import { formatAed } from "@/lib/products";
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
      <section className="mx-auto max-w-7xl px-5 md:px-[64px]">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-violet">Resource Hub</p>
            <h1 className="mt-4 text-[32px] font-extrabold leading-[1.2] text-primary-dark md:text-[48px]">
              Practical guides for moments HR makes complicated.
            </h1>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-neutral-500">
              Guides, explainers, scripts, and scenario-based resources for employees navigating UAE and GCC workplace questions.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-neutral-300 bg-white p-3 shadow-sm">
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
      <section className="mx-auto mt-12 max-w-7xl px-5 md:px-[64px]">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <article
              key={resource.slug}
              className="flex min-h-[360px] flex-col rounded-lg border border-neutral-300 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-violet/10 text-primary-violet">
                  {resource.gated ? <BookOpen size={22} /> : <FileText size={22} />}
                </div>
                <div className="flex items-center gap-2">
                  {resource.gated && (
                    <span className="rounded-lg bg-amber/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber">
                      {resource.amount ? formatAed(resource.amount) : "Premium"}
                    </span>
                  )}
                  <span className="rounded-lg bg-neutral-bg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                    {resource.minutes} min
                  </span>
                </div>
              </div>
              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-violet">
                {resource.category}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-primary-dark">{resource.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-neutral-500">{resource.summary}</p>
              <p className="mt-5 text-xs text-neutral-400">
                Updated {resource.updatedAt} · Reviewed by {resource.reviewer}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/resources/${resource.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark transition-colors hover:border-primary-violet"
                >
                  Read article
                  <ArrowRight size={16} />
                </Link>
                {!resource.gated && (
                  <a
                    href={resource.pdf}
                    download
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary-violet"
                  >
                    <Download size={16} />
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
