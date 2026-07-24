import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about");
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
