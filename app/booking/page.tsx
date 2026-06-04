import type { Metadata } from "next";
import { BookingFunnel } from "@/components/booking/BookingFunnel";
import { Scribble } from "@/components/ui/Scribble";
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
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      <header className="relative mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark shadow-pop-sm">
          <span className="h-2 w-2 rounded-full bg-accent-orange" />
          Confidential · Stripe secured · UAE &amp; GCC
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          Pay securely, then book your{" "}
          <span className="relative inline-block">
            private session
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-neutral-500">
          Choose the level of support that fits your situation. After successful payment, Stripe redirects you to the scheduling page.
        </p>
      </header>
      <section className="mx-auto mt-14 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <BookingFunnel />
      </section>
    </div>
  );
}
