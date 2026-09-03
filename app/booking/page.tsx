import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BookingFunnel } from "@/components/booking/BookingFunnel";
import { Scribble } from "@/components/ui/Scribble";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/booking");
}

export default function BookingPage() {
  return (
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      <header className="relative mx-auto max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary-dark shadow-pop-sm">
          <span className="h-2 w-2 rounded-full bg-accent-orange" />
          Confidential · Stripe secured · UAE &amp; GCC
        </span>
        <h1 className="text-h1 mx-auto mt-6 max-w-3xl font-display font-extrabold tracking-tight text-primary-dark">
          See real times, then book your{" "}
          <span className="relative inline-block">
            private session
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-body-lg text-neutral-500">
          Choose the level of support that fits your situation, see real times open this week, then
          complete payment securely through Stripe to confirm your exact slot.
        </p>
        {/*
          Theo's copy deck: "/booking currently has no link back to /services — recommend Mira
          add one for anyone who lands on /booking cold (an ad, a shared link) without having
          compared tiers first."
        */}
        <Link
          href="/services"
          className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-bold text-primary-violet hover:text-accent-orange"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Compare tiers on Services
        </Link>
      </header>
      <section className="mx-auto mt-14 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <BookingFunnel />
      </section>
    </div>
  );
}
