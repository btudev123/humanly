import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Are You Being Managed Out? — Free Diagnostic",
  description:
    "10 honest questions to gauge whether you're being quietly managed out of your job — with what each signal means and what you can do next. Free, confidential, no sign-up.",
  alternates: { canonical: "https://talkhumanly.com/resources/managed-out" },
  openGraph: {
    title: "Are You Being Managed Out? — Free Diagnostic",
    description:
      "10 questions. Honest answers. A clearer picture of what might be happening at work — and what you can do about it.",
    url: "https://talkhumanly.com/resources/managed-out",
    type: "article",
  },
};

export default function ManagedOutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
