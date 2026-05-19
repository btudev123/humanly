import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Booking Success | Humanly",
  description: "Humanly booking confirmation page.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/success") },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
