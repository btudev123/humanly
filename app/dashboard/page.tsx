import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarCheck, LockKeyhole, Upload, Wallet } from "lucide-react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getAdminState } from "@/lib/auth/admin";
import { hasDatabase } from "@/lib/db/client";
import { getDashboardMetrics } from "@/lib/db/repository";
import { formatAed } from "@/lib/products";
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
      <div className="min-h-screen bg-neutral-bg px-5 py-32 text-center md:px-[64px]">
        <LockKeyhole className="mx-auto mb-6 text-primary-violet" size={44} />
        <h1 className="text-4xl font-extrabold text-primary-dark">Dashboard locked</h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-500">{adminState.message}</p>
      </div>
    );
  }

  if (!hasDatabase()) {
    return (
      <div className="min-h-screen bg-neutral-bg px-5 py-32 md:px-[64px]">
        <div className="mx-auto max-w-3xl rounded-lg border border-neutral-300 bg-white p-8">
          <h1 className="text-3xl font-extrabold text-primary-dark">Connect Neon Postgres</h1>
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
    <div className="min-h-screen bg-neutral-bg px-5 py-28 md:px-[64px]">
      <header className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-violet">
          Admin dashboard · {adminState.email}
        </p>
        <h1 className="mt-4 text-[32px] font-extrabold leading-[1.2] text-primary-dark md:text-[48px]">
          Revenue, bookings, resources, and funnel controls.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-500">
          Keep prices, paid PDFs, and future verified testimonial media in one place.
        </p>
      </header>
      <section className="mx-auto mt-10 grid max-w-7xl gap-4 md:grid-cols-4">
        {[
          { icon: Wallet, label: "Revenue", value: formatAed(metrics.revenue) },
          { icon: CalendarCheck, label: "Paid orders", value: String(metrics.paidOrders) },
          { icon: BarChart3, label: "Bookings", value: String(metrics.bookings) },
          { icon: Upload, label: "Uploaded resources", value: String(metrics.uploadedResources) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-neutral-300 bg-white p-6 shadow-sm">
            <item.icon className="mb-5 text-primary-violet" size={26} />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-primary-dark">{item.value}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto mt-8 max-w-7xl">
        <DashboardClient />
      </section>
      <section className="mx-auto mt-8 max-w-7xl rounded-lg border border-neutral-300 bg-white p-6">
        <h2 className="text-xl font-extrabold text-primary-dark">Funnel events</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {metrics.funnel.length ? (
            metrics.funnel.map((event) => (
              <div key={event.event} className="rounded-lg bg-neutral-bg p-4">
                <p className="font-bold text-primary-dark">{event.event}</p>
                <p className="text-sm text-neutral-500">{event.count} events</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-500">No funnel events recorded yet.</p>
          )}
        </div>
      </section>
      <div className="mx-auto mt-8 max-w-7xl">
        <Link href="/" className="text-sm font-bold text-primary-violet underline">
          Return to site
        </Link>
      </div>
    </div>
  );
}
