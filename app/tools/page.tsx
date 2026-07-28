import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench, Zap } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";
import { pageMetadata } from "@/lib/seo";
import { LatestPosts } from "@/components/blog/LatestPosts";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/tools");
}

const tools = [
  {
    href: "/resources/managed-out",
    tag: "Free Quiz · 10 Questions",
    title: "Are You Being Managed Out?",
    desc: "A scored 10-question diagnostic that tells you plainly whether the signs point to a managed exit — and what each signal means.",
    time: "~5 min",
    color: "bg-violet-tint",
    accent: "text-primary-violet",
    badge: "bg-primary-dark text-on-primary",
  },
  {
    href: "/resources/resign-or-stay",
    tag: "Free Tool · Scoring Matrix",
    title: "Resign or Stay?",
    desc: "A decision framework with a weighted scoring matrix that maps your real options — including the grey-area moves most people miss.",
    time: "~8 min",
    color: "bg-accent-orange/10",
    accent: "text-accent-orange",
    badge: "bg-accent-orange text-primary-dark",
  },
];

const coming = [
  { title: "Document Checklist Generator", desc: "Know exactly what to document before a formal HR meeting." },
  { title: "Severance Calculator (UAE)", desc: "Estimate your end-of-service gratuity under UAE Labour Law." },
  { title: "Workplace Rights Quiz", desc: "Find out which rights apply to your situation in under 3 minutes." },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen overflow-clip bg-surface pb-24 pt-32 md:pt-40">
      {/* Hero */}
      <section className="relative mx-auto max-w-max-width px-margin-mobile text-center md:px-margin-desktop">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#fda544" className="absolute left-[10%] top-0 hidden h-8 w-8 animate-float md:block" />
        <Scribble variant="spiral" color="#9d5cff" className="absolute right-[10%] top-6 hidden h-16 w-16 opacity-50 md:block" />

        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <Wrench size={13} className="text-primary-violet" /> Free Tools
        </span>
        <h1 className="text-h1 mx-auto mt-6 max-w-3xl font-display font-extrabold tracking-tight text-primary-dark">
          Tools to help you{" "}
          <span className="relative inline-block">
            think clearly
            <Scribble variant="underline-bold" color="#fda544" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" animate />
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body-lg text-neutral-500">
          Free, interactive tools built for professionals navigating real workplace situations. No sign-up, no fluff.
        </p>
      </section>

      {/* Tools grid */}
      <section className="mx-auto mt-16 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="btn-pop group flex flex-col gap-5 rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex items-center gap-2 rounded-full border-2 border-primary-dark px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${tool.badge}`}>
                  <Zap size={11} strokeWidth={3} />
                  Free
                </span>
                <span className="rounded-full border border-neutral-300 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                  {tool.time}
                </span>
              </div>

              <div className={`rounded-2xl border-2 border-primary-dark px-5 py-4 ${tool.color}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${tool.accent}`}>{tool.tag}</p>
              </div>

              <div>
                <h2 className="text-h3 font-display font-extrabold tracking-tight text-primary-dark">{tool.title}</h2>
                <p className="mt-3 leading-relaxed text-neutral-500">{tool.desc}</p>
              </div>

              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary-dark">
                Start now <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Coming soon</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {coming.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-100/50 p-6 opacity-70"
            >
              <h3 className="text-h4 font-display font-bold text-primary-dark">{item.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary-dark bg-primary-dark p-10 text-center text-on-primary shadow-pop-orange md:p-14">
          <Scribble variant="spiral" color="#fda544" className="absolute right-8 top-8 hidden h-20 w-20 opacity-30 md:block" />
          <Scribble variant="star-fill" color="#9d5cff" className="absolute bottom-8 left-10 hidden h-8 w-8 animate-float md:block" />
          <div className="relative z-10">
            <h2 className="text-h2 font-display font-extrabold tracking-tight">Need personalised advice?</h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-body-lg text-on-primary/70">
              Tools give you clarity. A confidential consultation gives you a plan.
            </p>
            <Link
              href="/booking"
              className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
            >
              Book a Consultation
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      <LatestPosts title="Latest from the blog" />
    </div>
  );
}
