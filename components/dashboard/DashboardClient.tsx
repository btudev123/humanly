"use client";

import { useEffect, useState, useTransition } from "react";
import { Upload, DollarSign, MessageSquarePlus } from "lucide-react";
import { serviceProducts, formatUsd } from "@/lib/products";

type UploadedResource = {
  slug: string;
  title: string;
  amount: number | null;
  published: boolean;
};

export function DashboardClient() {
  const [message, setMessage] = useState("");
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([]);
  const [isPending, startTransition] = useTransition();

  async function loadResources() {
    const response = await fetch("/api/dashboard/resources", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { resources?: UploadedResource[] };
    setUploadedResources(data.resources || []);
  }

  useEffect(() => {
    void loadResources();
  }, []);

  function postJson(url: string, payload: Record<string, unknown>) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };
      setMessage(response.ok ? "Saved." : data.error || "Something went wrong.");
    });
  }

  function uploadResource(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/dashboard/uploads", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };
      setMessage(response.ok ? "Resource uploaded." : data.error || "Upload failed.");
      if (response.ok) await loadResources();
    });
  }

  function toggleResource(slug: string, published: boolean) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/dashboard/resources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, published }),
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };
      setMessage(response.ok ? "Resource visibility updated." : data.error || "Update failed.");
      if (response.ok) await loadResources();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet"><DollarSign size={20} /></span>
          <h2 className="font-display text-xl font-bold text-primary-dark">Set prices</h2>
        </div>
        <div className="space-y-4">
          {serviceProducts.map((product) => (
            <form
              key={product.slug}
              action={(formData) =>
                postJson("/api/dashboard/prices", {
                  slug: product.slug,
                  name: product.name,
                  amount: Number(formData.get("amount")) * 100,
                  kind: "consultation",
                  mode: product.mode,
                })
              }
              className="rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-4"
            >
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                {product.name}
                <input
                  name="amount"
                  type="number"
                  min="1"
                  defaultValue={product.amount / 100}
                  className="rounded-xl border-2 border-primary-dark/30 bg-neutral-100 px-3 py-2 text-base text-primary-dark outline-none transition focus:border-primary-dark"
                />
              </label>
              <p className="mt-2 text-xs text-neutral-500">Current seed: {formatUsd(product.amount)}</p>
              <button className="btn-pop mt-3 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-orange-tint text-accent-orange"><Upload size={20} /></span>
          <h2 className="font-display text-xl font-bold text-primary-dark">Upload resource</h2>
        </div>
        <form action={uploadResource} className="grid gap-4">
          <input name="title" required placeholder="Resource title" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="slug" required placeholder="resource-slug" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="category" required placeholder="Category" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <textarea name="summary" required placeholder="Short summary" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="amount" type="number" min="1" required placeholder="Price in USD cents (e.g. 1500 = $15)" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="file" type="file" accept="application/pdf" required className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <label className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <input name="published" type="checkbox" />
            Publish on resource hub
          </label>
          <button
            disabled={isPending}
            className="btn-pop rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm disabled:opacity-60"
          >
            Upload private PDF
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-neutral-500">Uploaded PDFs</h3>
          {uploadedResources.length ? (
            uploadedResources.map((resource) => (
              <div key={resource.slug} className="rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-4">
                <p className="font-bold text-primary-dark">{resource.title}</p>
                <p className="text-xs text-neutral-500">{resource.slug} · {resource.amount ? formatUsd(resource.amount) : "No price"}</p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggleResource(resource.slug, !resource.published)}
                  className="mt-3 rounded-full border-2 border-primary-dark px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-primary-dark transition-colors hover:bg-violet-tint disabled:opacity-60"
                >
                  {resource.published ? "Unpublish" : "Publish"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">No uploaded PDFs yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 shadow-pop-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-primary-dark bg-violet-tint text-primary-violet"><MessageSquarePlus size={20} /></span>
          <h2 className="font-display text-xl font-bold text-primary-dark">Future testimonials</h2>
        </div>
        <form
          action={(formData) =>
            postJson("/api/dashboard/testimonials", {
              type: String(formData.get("type") || "video"),
              mediaUrl: String(formData.get("mediaUrl") || ""),
              transcript: String(formData.get("transcript") || ""),
              personLabel: String(formData.get("personLabel") || ""),
              roleLabel: String(formData.get("roleLabel") || ""),
              published: formData.get("published") === "on",
            })
          }
          className="grid gap-4"
        >
          <select name="type" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark">
            <option value="video">Video</option>
            <option value="instagram">Instagram</option>
            <option value="text">Text</option>
          </select>
          <input name="mediaUrl" placeholder="Video or Instagram URL" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="personLabel" placeholder="Anonymous client label" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <input name="roleLabel" placeholder="Role label" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <textarea name="transcript" placeholder="Transcript for SEO and accessibility" className="rounded-2xl border-2 border-primary-dark/30 px-4 py-3 outline-none transition focus:border-primary-dark" />
          <label className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <input name="published" type="checkbox" />
            Publish only if verified and real
          </label>
          <button className="btn-pop rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-3 text-sm font-bold uppercase tracking-[0.1em] text-primary-dark shadow-pop-sm">
            Save testimonial slot
          </button>
        </form>
        {message && <p className="mt-4 rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-3 text-sm font-semibold text-primary-dark">{message}</p>}
      </section>
    </div>
  );
}
