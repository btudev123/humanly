import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Humanly",
  description:
    "Humanly privacy policy covering confidential intake, booking, payment, resource download, and advisory data handling.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
