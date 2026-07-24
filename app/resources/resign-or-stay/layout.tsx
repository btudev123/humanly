import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resign or Stay? — A Free Decision Framework",
  description:
    "Weighing whether to leave your job? Work through a confidential, honest decision framework — financial reality, four lenses, a scoring matrix, and the options in between. Free, no sign-up.",
  alternates: { canonical: absoluteUrl("/resources/resign-or-stay") },
  openGraph: {
    title: "Resign or Stay? — A Free Decision Framework",
    description: "This decision is never just about the job. A framework to think it through clearly, on your own terms.",
    url: absoluteUrl("/resources/resign-or-stay"),
    type: "article",
  },
};

export default function ResignOrStayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
