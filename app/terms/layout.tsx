import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | Humanly",
  description:
    "Humanly terms for confidential HR advisory, paid resources, Stripe payments, bookings, refunds, and service scope.",
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
