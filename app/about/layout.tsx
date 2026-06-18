import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Karma Harb & Humanly",
  description:
    "Karma Harb founded Humanly after ~20 years in HR across regulated industries, government, media and investment management — to give every professional honest, confidential, expert HR guidance.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
