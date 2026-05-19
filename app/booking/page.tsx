import type { Metadata } from "next";
import { BookingFunnel } from "@/components/booking/BookingFunnel";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Confidential HR Consultation",
  description:
    "Book a private Humanly consultation. Pay securely through Stripe first, then choose a confidential Cal.com session time.",
  alternates: { canonical: absoluteUrl("/booking") },
  openGraph: {
    title: "Book a Confidential HR Consultation | Humanly",
    description:
      "Private HR guidance for UAE and GCC professionals. Stripe handles payment, then scheduling unlocks.",
    url: absoluteUrl("/booking"),
  },
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-neutral-bg pb-24 pt-28">
      <header className="mx-auto max-w-4xl px-5 text-center md:px-[64px]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-dark/5 px-4 py-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dark">
            Confidential by design · Stripe secured · UAE & GCC focused
          </span>
        </div>
        <h1 className="mx-auto max-w-3xl text-[32px] font-extrabold leading-[1.2] text-primary-dark md:text-[48px]">
          Pay securely, then book your private HR session.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-neutral-500">
          Choose the level of support that fits your situation. After successful payment,
          Stripe redirects you to the scheduling page.
        </p>
      </header>
      <section className="mx-auto mt-14 max-w-7xl px-5 md:px-[64px]">
        <BookingFunnel />
      </section>
    </div>
  );
}
