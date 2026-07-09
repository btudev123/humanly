"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/resources", label: "Resources" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Wordmark() {
  return (
    <span className="relative inline-flex items-center leading-none">
      <BrandLogo className="h-14 w-auto md:h-16" />
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isBookPage = pathname === "/booking";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "border-b border-primary-dark/10 bg-neutral-bg/90 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-max-width items-center justify-between px-margin-mobile py-2.5 md:px-margin-desktop md:py-3"
      >
        {/* Brand */}
        <Link href="/" aria-label="Humanly home" className="group/logo relative shrink-0">
          <Wordmark />
        </Link>

        {!isBookPage && (
          <>
            {/* Desktop links */}
            <div className="hidden items-center gap-1 rounded-full md:flex">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-[14px] font-semibold transition-colors duration-200 ${
                      active
                        ? "text-primary-violet"
                        : "text-neutral-500 hover:text-primary-dark"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-violet-tint"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <Link
              href="/booking"
              className="btn-pop hidden items-center gap-1.5 rounded-full border-2 border-primary-dark bg-accent-orange px-5 py-2.5 text-[14px] font-bold text-primary-dark shadow-pop-sm md:inline-flex"
            >
              Get Support
              <ArrowUpRight size={17} strokeWidth={2.5} />
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-dark bg-neutral-100 text-primary-dark md:hidden"
            >
              {mobileOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
            </button>
          </>
        )}

        {isBookPage && (
          <Link
            href="/"
            className="text-[14px] font-semibold text-neutral-500 transition-colors hover:text-primary-violet"
          >
            ← Back to Home
          </Link>
        )}
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && !isBookPage && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="mt-2 overflow-hidden rounded-3xl border border-primary-dark/10 bg-neutral-100 p-3 shadow-soft md:hidden"
            style={{ marginLeft: "var(--spacing-margin-mobile)", marginRight: "var(--spacing-margin-mobile)" }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-2xl px-4 py-3 text-[16px] font-semibold transition-colors ${
                      active ? "bg-violet-tint text-primary-violet" : "text-neutral-500"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/booking"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-primary-dark bg-accent-orange px-6 py-3.5 text-[15px] font-bold text-primary-dark shadow-pop-sm"
            >
              Get Support
              <ArrowUpRight size={18} strokeWidth={2.5} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
