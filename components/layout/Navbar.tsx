"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-primary-purple/10 bg-white/86 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-purple text-base font-black text-white shadow-lg shadow-primary-purple/20">
            H
          </div>
          <div className="leading-none">
            <span className="block text-2xl font-semibold tracking-[-0.03em] text-slate-950">Humanly</span>
            <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.28em] text-slate-500">HR with dignity</span>
          </div>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-xs font-black uppercase tracking-[0.18em] transition-colors ${
                pathname === item.href ? "text-primary-violet" : "text-primary-purple/62 hover:text-primary-purple"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.span layoutId="nav-pill" className="absolute -bottom-3 left-0 h-0.5 w-full bg-secondary-orange" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="hidden items-center gap-2 rounded-lg bg-primary-purple px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-primary-purple/20 transition hover:bg-primary-violet md:flex"
          >
            <CalendarCheck size={16} />
            Book Consultation
          </Link>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-purple/10 text-primary-purple lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary-purple/10 bg-white lg:hidden"
          >
            <div className="space-y-2 px-5 py-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-4 py-4 text-sm font-black uppercase tracking-[0.16em] ${
                    pathname === item.href ? "bg-primary-violet/10 text-primary-violet" : "text-primary-purple"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center justify-between rounded-lg bg-primary-purple px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-white"
              >
                Book Consultation
                <ShieldCheck size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
