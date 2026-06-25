"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Search } from "lucide-react";
import { aedFromUsdCents, formatAed } from "@/lib/products";
import type { Resource } from "@/lib/resources";

const categoryGradients: Record<string, string> = {
  "Diagnostics & Quizzes": "from-violet-tint to-purple-100",
  "Regional Guides": "from-orange-50 to-amber-100",
  "Templates & Kits": "from-slate-100 to-neutral-200",
  "Courses": "from-emerald-50 to-teal-100",
  "Memberships": "from-yellow-50 to-amber-100",
};

const categoryAccents: Record<string, string> = {
  "Diagnostics & Quizzes": "text-primary-violet",
  "Regional Guides": "text-accent-orange",
  "Templates & Kits": "text-primary-dark",
  "Courses": "text-emerald-700",
  "Memberships": "text-amber-700",
};

function CategoryTag({ category }: { category: string }) {
  const color = categoryAccents[category] ?? "text-primary-dark";
  return (
    <span className={`inline-block rounded-full border border-neutral-300 bg-neutral-100 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] ${color}`}>
      {category}
    </span>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const gradient = categoryGradients[resource.category] ?? "from-violet-tint to-purple-100";

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border-2 border-primary-dark bg-neutral-100 transition-transform hover:-translate-y-1">
      {/* Header band */}
      <div className={`relative flex items-end justify-between bg-gradient-to-br p-6 pb-5 ${gradient} border-b-2 border-primary-dark`}>
        <div className="flex flex-col gap-1.5">
          <CategoryTag category={resource.category} />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
            {resource.membership ? "Subscription" : `Tier ${resource.tier}`}
            {resource.minutes > 0 ? ` · ${resource.minutes} min` : ""}
          </p>
        </div>
        {/* Paywall lock */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-dark bg-primary-dark text-accent-orange shadow-pop-sm">
          <LockKeyhole size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h2 className="font-display text-xl font-extrabold leading-tight tracking-tight text-primary-dark">{resource.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">{resource.summary}</p>
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
          {resource.format}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-200 pt-4">
          <div>
            <p className="font-display text-2xl font-extrabold text-primary-dark">
              {resource.amount ? formatAed(aedFromUsdCents(resource.amount)) : "—"}
              {resource.interval && (
                <span className="text-base font-bold text-neutral-400">/mo</span>
              )}
            </p>
          </div>
          <Link
            href={`/resources/${resource.slug}`}
            className="btn-pop inline-flex items-center gap-1.5 rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-2.5 text-xs font-bold text-primary-dark shadow-pop-sm"
          >
            Unlock
            <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ResourcesBrowser({ resources }: { resources: Resource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(resources.map((r) => r.category)))];
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesQuery = `${r.title} ${r.category} ${r.summary}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "All" || r.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, query, resources]);

  return (
    <>
      {/* Filter bar */}
      <section className="mx-auto max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-h2 font-extrabold tracking-tight text-primary-dark">
              Guides, kits &amp; courses
            </h2>
            <p className="mt-2 max-w-lg text-body-lg text-neutral-500">
              Every resource is paywalled — pay once, own it forever.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 p-2 pl-4 transition focus-within:shadow-pop-sm md:max-w-xs md:w-full">
            <Search className="shrink-0 text-primary-violet" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-primary-dark outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border-2 border-primary-dark px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all ${
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

      {/* Grid */}
      <section className="mx-auto mt-8 max-w-max-width px-margin-mobile md:px-margin-desktop">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-neutral-300 p-16 text-center text-neutral-400">
            No resources match your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
