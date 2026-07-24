import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarCheck, LockKeyhole, Upload, Wallet } from "lucide-react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getAdminState } from "@/lib/auth/admin";
import { hasDatabase } from "@/lib/db/client";
import { getDashboardMetrics } from "@/lib/db/repository";
import { formatUsd } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Humanly",
  description: "Humanly admin dashboard for revenue, bookings, prices, resources, and testimonials.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/dashboard") },
};

export default async function DashboardPage() {
  const adminState = await getAdminState();

  if (!adminState.ok) {
    return (
      <div className="min-h-screen bg-surface px-margin-mobile py-36 text-center md:px-margin-desktop">
        <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-10 shadow-pop">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
            <LockKeyhole size={32} />
          </div>
          <h1 className="text-h1 font-display font-extrabold tracking-tight text-primary-dark">Dashboard locked</h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">{adminState.message}</p>
        </div>
      </div>
    );
  }

  if (!hasDatabase()) {
    return (
      <div className="min-h-screen bg-surface px-margin-mobile py-36 md:px-margin-desktop">
        <div className="mx-auto max-w-3xl rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop">
          <h1 className="text-h1 font-display font-extrabold tracking-tight text-primary-dark">Connect Neon Postgres</h1>
          <p className="mt-4 leading-relaxed text-neutral-500">
            Add `DATABASE_URL` or `POSTGRES_URL`, run the SQL in `lib/db/migrations.sql`,
            then return here to track revenue, bookings, resources, and funnel events.
          </p>
        </div>
      </div>
    );
  }

  const metrics = await getDashboardMetrics();

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-32 md:px-margin-desktop md:pt-40">
      <header className="mx-auto max-w-max-width">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <span className="h-2 w-2 rounded-full bg-accent-orange" /> Admin · {adminState.email}
        </span>
        <h1 className="text-h1 mt-5 font-display font-extrabold tracking-tight text-primary-dark">
          Revenue, bookings, resources, and funnel controls.
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-neutral-500">
          Keep prices, paid PDFs, and future verified testimonial media in one place.
        </p>
      </header>
      <section className="mx-auto mt-10 grid max-w-max-width gap-4 md:grid-cols-4">
        {[
          { icon: Wallet, label: "Revenue", value: formatUsd(metrics.revenue) },
          { icon: CalendarCheck, label: "Paid orders", value: String(metrics.paidOrders) },
          { icon: BarChart3, label: "Bookings", value: String(metrics.bookings) },
          { icon: Upload, label: "Uploaded resources", value: String(metrics.uploadedResources) },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6 transition-transform hover:-translate-y-1">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
              <item.icon size={24} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-gradient">{item.value}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto mt-8 max-w-max-width">
        <DashboardClient />
      </section>
      <section className="mx-auto mt-8 max-w-max-width rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6">
        <h2 className="text-h3 font-display font-bold text-primary-dark">Funnel events</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {metrics.funnel.length ? (
            metrics.funnel.map((event) => (
              <div key={event.event} className="rounded-2xl border-2 border-primary-dark/15 bg-surface-container-low p-4">
                <p className="font-bold text-primary-dark">{event.event}</p>
                <p className="text-sm text-neutral-500">{event.count} events</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-500">No funnel events recorded yet.</p>
          )}
        </div>
      </section>
      <div className="mx-auto mt-8 max-w-max-width">
        <Link href="/" className="text-sm font-bold text-primary-violet underline">
          Return to site
        </Link>
      </div>
    </div>
  );
}
