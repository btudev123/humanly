"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Calendar, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { serviceProducts, formatAed } from "@/lib/products";
import { cn } from "@/lib/utils";

const concerns = [
  "Performance warning or PIP",
  "Toxic manager or harassment",
  "Contract, severance, or redundancy",
  "Burnout, boundaries, or exit planning",
];

export function BookingFunnel() {
  const [selected, setSelected] = useState("triage");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedProduct = serviceProducts.find((product) => product.slug === selected) || serviceProducts[0];

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
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Calendar className="text-primary-violet" size={22} />
          <h2 className="text-2xl font-extrabold text-primary-dark">Choose your support</h2>
        </div>
        <div className="grid gap-4">
          {serviceProducts.map((service) => (
            <label
              key={service.slug}
              className={cn(
                "cursor-pointer rounded-lg border-2 p-5 transition-all",
                selected === service.slug
                  ? "border-primary-violet bg-primary-violet/5 shadow-lg shadow-primary-violet/10"
                  : "border-neutral-300 bg-white hover:border-primary-violet/50"
              )}
            >
              <input
                type="radio"
                name="service"
                value={service.slug}
                checked={selected === service.slug}
                onChange={() => setSelected(service.slug)}
                className="sr-only"
              />
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected === service.slug ? "border-primary-violet bg-primary-violet" : "border-neutral-300"
                  )}
                >
                  {selected === service.slug && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-extrabold text-primary-dark">{service.name}</h3>
                    <span className="text-2xl font-extrabold text-primary-dark">
                      {formatAed(service.amount)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-primary-violet">
                    {service.subtitle}
                  </p>
                  <p className="mt-2 leading-relaxed text-neutral-500">{service.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-start gap-3">
          <Lock className="mt-1 text-primary-violet" size={22} />
          <div>
            <h2 className="text-2xl font-extrabold text-primary-dark">Private intake</h2>
            <p className="mt-1 text-neutral-500">
              Payment happens first through Stripe. Scheduling unlocks only after a successful payment.
            </p>
          </div>
        </div>
        <form action={submit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Name
              <input name="name" required className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Email
              <input name="email" type="email" required className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Phone
              <input name="phone" className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Urgency
              <select name="urgency" className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark">
                <option>This week</option>
                <option>Next 48 hours</option>
                <option>Planning ahead</option>
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            Situation
            <select name="concern" className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark">
              {concerns.map((concern) => (
                <option key={concern}>{concern}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
            What is happening?
            <textarea
              name="message"
              rows={5}
              className="rounded-lg border border-neutral-300 px-4 py-3 text-base text-primary-dark"
              placeholder="A short version is enough. Karma will review this before the call."
            />
          </label>
          {error && <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-primary-violet px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white hover:bg-primary-dark disabled:opacity-60"
          >
            <ShieldCheck size={18} />
            {isPending ? "Opening Stripe..." : `Pay ${formatAed(selectedProduct.amount)} with Stripe`}
            {!isPending && <ArrowRight size={18} />}
          </button>
          <div className="grid gap-3 rounded-lg bg-neutral-bg p-4 text-sm text-neutral-500 sm:grid-cols-3">
            {["Stripe handles payment", "Scheduling unlocks after payment", "No employer notification"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary-violet" />
                {item}
              </span>
            ))}
          </div>
        </form>
      </section>
    </div>
  );
}
