import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Humanly | Confidential HR Advice",
  description:
    "Contact Humanly privately for confidential HR advisory support across UAE and GCC workplace issues.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
