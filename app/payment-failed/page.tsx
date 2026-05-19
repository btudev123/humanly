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
    <div className="min-h-screen bg-neutral-bg px-5 py-32 text-center md:px-[64px]">
      <div className="mx-auto max-w-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="text-red-600" size={42} />
        </div>
        <h1 className="text-[32px] font-extrabold leading-[1.2] text-primary-dark md:text-[48px]">
          Payment was not completed
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-500">
          Stripe did not confirm a successful payment, so booking and paid downloads remain locked.
        </p>
        <Link
          href="/booking"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-violet px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white"
        >
          <ArrowLeft size={18} />
          Try again
        </Link>
      </div>
    </div>
  );
}
