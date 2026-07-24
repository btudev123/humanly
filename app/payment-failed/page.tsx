import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Payment Not Completed",
  description: "Your Humanly payment was cancelled or could not be completed.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/payment-failed") },
};

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-40 text-center md:px-margin-desktop">
      <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-primary-dark bg-neutral-100 p-10 shadow-pop md:p-14">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-dark bg-coral/15">
          <AlertCircle className="text-coral" size={42} />
        </div>
        <h1 className="text-h1 font-display font-extrabold tracking-tight text-primary-dark">
          Payment was not completed
        </h1>
        <p className="mt-4 text-body-lg leading-relaxed text-neutral-500">
          Stripe did not confirm a successful payment, so booking and paid downloads remain locked.
        </p>
        <Link
          href="/booking"
          className="btn-pop mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop-sm"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Try again
        </Link>
      </div>
    </div>
  );
}
