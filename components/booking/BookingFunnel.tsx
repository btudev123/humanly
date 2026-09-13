"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight, Calendar, CheckCircle2, Clock, Info, Lock, ShieldCheck } from "lucide-react";
import {
  serviceProducts,
  formatAed,
  type ServiceCategory,
} from "@/lib/products";
import { getIntakeForm, splitAnswers, type IntakeField } from "@/lib/intake";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-2xl border-2 border-primary-dark/20 px-4 py-3 text-base font-normal normal-case tracking-normal text-primary-dark outline-none transition focus:border-primary-dark";

const labelClass =
  "grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500";

/**
 * One intake question. Uncontrolled on purpose — the whole form is remounted with a
 * `key` when the service changes, which clears answers that no longer apply rather
 * than carrying an interview date over onto a document review.
 */
function IntakeFieldInput({ field }: { field: IntakeField }) {
  return (
    <label className={cn(labelClass, field.half ? "" : "sm:col-span-2")}>
      {field.label}
      {field.required && <span className="sr-only"> (required)</span>}

      {field.type === "select" ? (
        <select name={field.id} required={field.required} className={fieldClass}>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          name={field.id}
          rows={4}
          required={field.required}
          placeholder={field.placeholder}
          className={fieldClass}
        />
      ) : (
        <input
          name={field.id}
          type={field.type === "url" ? "url" : field.type === "date" ? "date" : "text"}
          required={field.required}
          placeholder={field.placeholder}
          className={fieldClass}
        />
      )}

      {field.help && (
        <span className="text-[11px] font-medium normal-case tracking-normal text-neutral-400">
          {field.help}
        </span>
      )}
    </label>
  );
}

const categoryFilters: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "core", label: "Core advisory" },
  { value: "specialist", label: "Specialist" },
  { value: "retainer", label: "Retainers" },
];

export function BookingFunnel() {
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [selected, setSelected] = useState("individual-advisory");
  const [error, setError] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reveal hidden products (e.g. the internal test service) with ?test=1, and honour
  // ?service=<slug> so links from articles, services and resources land on the right
  // one preselected instead of dropping the reader on the default.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowHidden(params.get("test") === "1");

    const requested = params.get("service");
    if (requested && serviceProducts.some((product) => product.slug === requested)) {
      setSelected(requested);
    }
  }, []);

  const availableProducts = useMemo(
    () => serviceProducts.filter((product) => showHidden || !product.hidden),
    [showHidden]
  );

  const visibleServices = useMemo(
    () =>
      category === "all"
        ? availableProducts
        : availableProducts.filter((product) => product.category === category),
    [category, availableProducts]
  );

  const selectedProduct =
    availableProducts.find((product) => product.slug === selected) || availableProducts[0];

  // The intake questions follow the service: an interview-prep client is asked for the
  // job posting, not whether they've been put on a PIP.
  const intakeForm = useMemo(() => getIntakeForm(selectedProduct), [selectedProduct]);

  function changeCategory(next: ServiceCategory | "all") {
    setCategory(next);
    // Keep the selection valid for the visible set so the summary stays in sync.
    if (next !== "all" && selectedProduct.category !== next) {
      const firstInCategory = availableProducts.find((product) => product.category === next);
      if (firstInCategory) setSelected(firstInCategory.slug);
    }
  }

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      // Collect answers by the selected service's own field list, so a question that
      // isn't on screen can never be posted.
      const answers: Record<string, string> = {};
      for (const field of intakeForm.fields) {
        answers[field.id] = String(formData.get(field.id) || "");
      }
      const { concern, urgency, message, details } = splitAnswers(intakeForm, answers);

      const payload = {
        productSlug: selected,
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        concern,
        urgency,
        message,
        details,
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
      {/* ── Step 1 — choose a service ─────────────────────────────── */}
      <section className="min-w-0 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm sm:p-6 md:p-8">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-dark">
              <Calendar size={18} strokeWidth={2.5} />
            </span>
            <h2 className="text-h3 font-extrabold text-primary-dark">
              <span className="text-primary-violet">1.</span> Choose your support
            </h2>
          </div>

          {/* Category filter — horizontally scrollable on small screens */}
          <div className="-mx-1 flex min-w-0 max-w-full gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
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
                    <h3 className="text-h4 font-extrabold leading-snug text-primary-dark">
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
      <section className="min-w-0 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 shadow-pop-sm sm:p-6 md:p-8">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-dark bg-violet-tint text-primary-dark">
            <Lock size={18} strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-h3 font-extrabold text-primary-dark">
              <span className="text-primary-violet">2.</span> Private intake
            </h2>
            <p className="mt-1 text-sm text-neutral-500 sm:text-base">
              {selectedProduct.needsScheduling
                ? "Payment happens first through Stripe. Scheduling unlocks only after a successful payment."
                : "Payment happens first through Stripe. This service is delivered by email — there is no call to schedule."}
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
            <p className="text-xs font-semibold text-neutral-400">Secured by Stripe</p>
          </div>
        </div>

        {/* Remounted per service so answers to questions that no longer apply are dropped. */}
        <form key={selectedProduct.slug} action={submit} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input name="name" required autoComplete="name" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Email
              <input name="email" type="email" required autoComplete="email" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Phone
              <input name="phone" type="tel" autoComplete="tel" className={fieldClass} />
            </label>
          </div>

          {intakeForm.note && (
            <p className="flex items-start gap-2.5 rounded-2xl border-2 border-dashed border-primary-violet/40 bg-violet-tint/50 p-4 text-sm leading-relaxed text-primary-dark">
              <Info size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary-violet" />
              {intakeForm.note}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {intakeForm.fields.map((field) => (
              <IntakeFieldInput key={field.id} field={field} />
            ))}
          </div>

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
            {[
              "Stripe handles payment",
              selectedProduct.needsScheduling
                ? "Scheduling unlocks after payment"
                : "Delivered to your inbox",
              "No employer notification",
            ].map((item) => (
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
