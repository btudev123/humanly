"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Calendar, CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react";
import {
  serviceProducts,
  formatUsd,
  formatAed,
  type ServiceCategory,
} from "@/lib/products";
import { cn } from "@/lib/utils";

const concerns = [
  "Performance warning or PIP",
  "Toxic manager or harassment",
  "Contract, severance, or redundancy",
  "Burnout, boundaries, or exit planning",
];

const categoryFilters: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "session", label: "Sessions" },
  { value: "retainer", label: "Retainers" },
  { value: "corporate", label: "Corporate" },
];

export function BookingFunnel() {
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [selected, setSelected] = useState("individual-advisory");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const visibleServices = useMemo(
    () =>
      category === "all"
        ? serviceProducts
        : serviceProducts.filter((product) => product.category === category),
    [category]
  );

  const selectedProduct =
    serviceProducts.find((product) => product.slug === selected) || serviceProducts[0];

  function changeCategory(next: ServiceCategory | "all") {
    setCategory(next);
    // Keep the selection valid for the visible set so the summary stays in sync.
    if (next !== "all" && selectedProduct.category !== next) {
      const firstInCategory = serviceProducts.find((product) => product.category === next);
      if (firstInCategory) setSelected(firstInCategory.slug);
    }
  }

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const payload = {
        productSlug: selected,
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        concern: String(formData.get("concern") || ""),
        urgency: String(formData.get("urgency") || ""),
        message: String(formData.get("message") || ""),
      };

      const response = await fetch("/api/checkout/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error || "Checkout could not be started. Please try again.");
        return;
      }

      window.location.assign(data.url);
    });
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:gap-8">
      {/* ── Step 1 — choose a service ─────────────────────────────── */}
      <section className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-dark">
              <Calendar size={18} strokeWidth={2.5} />
            </span>
            <h2 className="text-xl font-extrabold text-primary-dark sm:text-2xl">
              <span className="text-primary-violet">1.</span> Choose your support
            </h2>
          </div>

          {/* Category filter — horizontally scrollable on small screens */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => changeCategory(filter.value)}
                className={cn(
                  "shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors",
                  category === filter.value
                    ? "border-primary-dark bg-primary-dark text-white"
                    : "border-primary-dark/20 bg-neutral-100 text-neutral-500 hover:border-primary-dark/50"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visibleServices.map((service) => {
            const active = selected === service.slug;
            return (
              <label
                key={service.slug}
                className={cn(
                  "group relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all",
                  active
                    ? "border-primary-dark bg-violet-tint shadow-pop-sm"
                    : "border-primary-dark/15 bg-neutral-100 hover:border-primary-dark/60"
                )}
              >
                <input
                  type="radio"
                  name="service"
                  value={service.slug}
                  checked={active}
                  onChange={() => setSelected(service.slug)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      active ? "border-primary-dark bg-accent-orange" : "border-neutral-300 group-hover:border-primary-dark/60"
                    )}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold leading-snug text-primary-dark">
                      {service.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                      <Clock size={12} strokeWidth={2.5} />
                      {service.duration}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-dark px-2.5 py-1 text-sm font-extrabold text-white">
                    {formatAed(service.amountAed)}
                    {service.priceNote ?? ""}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-500 line-clamp-2">
                  {service.description}
                </p>
              </label>
            );
          })}
        </div>
      </section>

      {/* ── Step 2 — private intake ───────────────────────────────── */}
      <section className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm sm:p-6 md:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-dark">
            <Lock size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-primary-dark sm:text-2xl">
              <span className="text-primary-violet">2.</span> Private intake
            </h2>
            <p className="mt-1 text-sm text-neutral-500 sm:text-base">
              Payment happens first through Stripe. Scheduling unlocks only after a successful payment.
            </p>
          </div>
        </div>

        {/* Selected-service summary */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary-dark/15 bg-violet-tint/60 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-violet">Selected</p>
            <p className="mt-0.5 truncate text-base font-extrabold text-primary-dark">{selectedProduct.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-primary-dark">
              {formatAed(selectedProduct.amountAed)}
              {selectedProduct.priceNote ?? ""}
            </p>
            <p className="text-xs font-semibold text-neutral-400">
              charged in USD · {formatUsd(selectedProduct.amount)}
              {selectedProduct.priceNote ?? ""}
            </p>
          </div>
        </div>

        <form action={submit} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Name
              <input name="name" required className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Email
              <input name="email" type="email" required className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Phone
              <input name="phone" className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Urgency
              <select name="urgency" className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark">
                <option>This week</option>
                <option>Next 48 hours</option>
                <option>Planning ahead</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            Situation
            <select name="concern" className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark">
              {concerns.map((concern) => (
                <option key={concern}>{concern}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            What is happening?
            <textarea
              name="message"
              rows={4}
              className="rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark"
              placeholder="A short version is enough. Karma will review this before the call."
            />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="btn-pop inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm disabled:opacity-60"
          >
            <ShieldCheck size={18} strokeWidth={2.5} />
            {isPending
              ? "Opening Stripe..."
              : `Pay ${formatAed(selectedProduct.amountAed)}${selectedProduct.priceNote ?? ""} with Stripe`}
            {!isPending && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>
          <div className="grid gap-3 rounded-2xl border-2 border-dashed border-neutral-300 p-4 text-sm text-neutral-500 sm:grid-cols-3">
            {["Stripe handles payment", "Scheduling unlocks after payment", "No employer notification"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-primary-violet" />
                {item}
              </span>
            ))}
          </div>
        </form>
      </section>
    </div>
  );
}
