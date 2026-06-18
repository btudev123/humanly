import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resign or Stay? — A Free Decision Framework",
  description:
    "Weighing whether to leave your job? Work through a confidential, honest decision framework — financial reality, four lenses, a scoring matrix, and the options in between. Free, no sign-up.",
  alternates: { canonical: "https://talkhumanly.com/resources/resign-or-stay" },
  openGraph: {
    title: "Resign or Stay? — A Free Decision Framework",
    description: "This decision is never just about the job. A framework to think it through clearly, on your own terms.",
    url: "https://talkhumanly.com/resources/resign-or-stay",
    type: "article",
  },
};

export default function ResignOrStayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
