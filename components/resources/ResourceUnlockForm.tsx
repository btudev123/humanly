"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { aedFromUsdCents, formatAed, formatUsd } from "@/lib/products";

export function ResourceUnlockForm({
  resourceSlug,
  amount,
  priceNote,
  membership,
}: {
  resourceSlug: string;
  amount: number;
  priceNote?: string;
  membership?: boolean;
}) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const response = await fetch("/api/checkout/resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceSlug,
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error || "Resource checkout could not be started.");
        return;
      }

      window.location.assign(data.url);
    });
  }

  return (
    <form action={submit} className="grid gap-4 rounded-3xl border-2 border-primary-dark bg-violet-tint p-6 shadow-pop-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-dark bg-neutral-100 text-primary-violet">
          <LockKeyhole size={20} />
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-primary-dark">
            {membership ? "Join the membership" : "Unlock this resource"}
          </h2>
          <p className="text-neutral-500">
            {membership
              ? "Stripe handles your subscription. Access is emailed once payment succeeds."
              : "Stripe handles payment. Your download is emailed and unlocks on screen once payment succeeds."}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-2xl border-2 border-primary-dark/30 bg-neutral-100 px-4 py-3 text-primary-dark outline-none transition focus:border-primary-dark"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-2xl border-2 border-primary-dark/30 bg-neutral-100 px-4 py-3 text-primary-dark outline-none transition focus:border-primary-dark"
        />
      </div>
      {error && <p className="rounded-2xl bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-pop inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm disabled:opacity-60"
      >
        {isPending
          ? "Opening Stripe..."
          : `Pay ${formatAed(aedFromUsdCents(amount))}${priceNote ?? ""} ${membership ? "and join" : "and unlock"}`}
        {!isPending && <ArrowRight size={18} strokeWidth={2.5} />}
      </button>
      <p className="text-center text-xs font-semibold text-neutral-400">
        ≈ {formatUsd(amount)}{priceNote ?? ""} · charged securely in USD via Stripe
      </p>
    </form>
  );
}
