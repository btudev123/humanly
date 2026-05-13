import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Humanly | Our Radical Mission",
  description: "Learn about Humanly's mission to protect employee dignity through neutral advocacy and AI-enhanced support.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
