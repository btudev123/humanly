import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/terms");
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
