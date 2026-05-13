import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Confidential Workplace Advocacy",
  description: "Explore our range of services including labor law education, AI message drafting, and burnout support.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
