"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

  const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On /booking page, no navigation links — dedicated conversion page
  const isBookPage = pathname === "/booking";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-neutral-bg/90 backdrop-blur-md border-b border-primary-dark/10 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav
        className="max-w-[1200px] mx-auto flex items-center justify-between px-[20px] md:px-[64px]"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          href="/"
          className="font-extrabold text-[24px] md:text-[32px] text-primary-dark hover:text-primary-violet transition-colors tracking-tight"
          aria-label="Humanly home"
        >
          Humanly
        </Link>

        {/* Desktop nav — hide on /book */}
        {!isBookPage && (
          <>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-semibold text-[14px] transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-primary-violet border-b-2 border-primary-violet"
                      : "text-neutral-500 hover:text-primary-violet"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA button — desktop */}
            <div className="hidden md:block">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-primary-violet text-white font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-primary-dark transition-colors duration-200"
              >
                <span>Get Support</span>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center p-2 text-neutral-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[28px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </>
        )}

        {/* /book page — just back to home */}
        {isBookPage && (
          <Link
            href="/"
            className="text-[14px] font-semibold text-neutral-500 hover:text-primary-violet transition-colors"
          >
            ← Back to Home
          </Link>
        )}
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && !isBookPage && (
        <div className="md:hidden bg-neutral-bg/95 backdrop-blur-md border-b border-primary-dark/10 shadow-lg animate-fade-in">
          <div className="max-w-[1200px] mx-auto px-[20px] py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-semibold text-[16px] py-2 ${
                  pathname === link.href
                    ? "text-primary-violet"
                    : "text-neutral-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 bg-primary-violet text-white font-semibold text-[14px] px-6 py-3 rounded-full mt-2"
            >
              Get Support
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}