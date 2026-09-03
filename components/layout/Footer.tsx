import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Scribble } from "@/components/ui/Scribble";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/services", label: "Services" },
      { href: "/resources", label: "Resources" },
      { href: "/blog", label: "Blog" },
      { href: "/tools", label: "Free Tools" },
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { href: "/booking", label: "Book a Session" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-primary-dark text-neutral-100">
      {/* doodles */}
      <Scribble variant="loop" color="#ff6a1a" className="absolute -top-6 right-10 hidden h-28 w-28 opacity-30 md:block" />
      <Scribble variant="star-fill" color="#ff9a4d" className="absolute bottom-24 left-8 hidden h-8 w-8 animate-float md:block" />
      <Scribble variant="spiral" color="#9d5cff" className="absolute right-1/3 bottom-10 hidden h-20 w-20 opacity-40 md:block" />

      <div className="relative mx-auto max-w-max-width px-margin-mobile md:px-margin-desktop">
        {/* Top CTA row */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 py-14 md:flex-row md:items-end md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-light">
              <span className="h-2 w-2 rounded-full bg-accent-orange" />
              Confidential · Global advisory
            </p>
            <h2 className="text-h2 max-w-2xl font-display font-extrabold leading-[1.02] tracking-tight">
              Your HR manages the workplace.{" "}
              <span className="relative inline-block text-accent-orange">
                We manage your career.
                <Scribble variant="underline-bold" color="#fda544" strokeWidth={4} className="absolute -bottom-3 left-0 h-3.5 w-full" />
              </span>
            </h2>
          </div>
          <Link
            href="/booking"
            className="btn-pop inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-4 text-[15px] font-bold text-primary-dark shadow-[6px_6px_0_0_#9d5cff]"
          >
            Book a Confidential Session
            <ArrowUpRight size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" aria-label="Humanly home" className="inline-flex rounded-2xl bg-surface px-4 py-3">
              <BrandLogo className="h-16 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-100/60">
              Independent, neutral, and confidential HR advisory for professionals worldwide
              navigating workplace challenges — with dedicated guides for the UAE, GCC &amp; North America.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-100/40">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-neutral-100/80 transition-colors hover:text-accent-orange"
                    >
                      {link.label}
                      <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 border-t border-white/10 py-8 text-sm text-neutral-100/50 md:flex-row md:items-center md:justify-between">
          <p>© {year} Humanly HR Advisory. Neutral advocacy for the modern workplace.</p>
          <div className="flex flex-col gap-2 md:items-end">
            <p className="italic">Humanly provides HR guidance & coaching, not legal advice.</p>
            <p>
              Designed &amp; built by{" "}
              <a
                href="https://qognitionagency.com"
                target="_blank"
                rel="noopener"
                title="Qognition Agency — AI-driven web design & development"
                className="font-semibold text-neutral-100/80 underline decoration-accent-orange/60 underline-offset-4 transition-colors hover:text-accent-orange"
              >
                Qognition Agency
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Floating contact CTA → contact page */}
      <Link
        href="/contact"
        aria-label="Contact Humanly"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-primary-dark shadow-pop-sm transition-transform hover:scale-105"
      >
        <Mail size={24} strokeWidth={2.4} />
      </Link>
    </footer>
  );
}
