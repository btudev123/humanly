"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { formatAed } from "@/lib/products";

export function ResourceUnlockForm({
  resourceSlug,
  amount,
}: {
  resourceSlug: string;
  amount: number;
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
    <form action={submit} className="grid gap-4 rounded-lg border border-primary-violet/20 bg-primary-violet/5 p-6">
      <div className="flex items-center gap-3">
        <LockKeyhole className="text-primary-violet" size={22} />
        <div>
          <h2 className="text-2xl font-extrabold text-primary-dark">Unlock premium PDF</h2>
          <p className="text-neutral-500">Stripe handles payment. Download unlocks after payment succeeds.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-primary-dark"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-primary-dark"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-violet px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white disabled:opacity-60"
      >
        {isPending ? "Opening Stripe..." : `Pay ${formatAed(amount)} and unlock`}
        {!isPending && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
