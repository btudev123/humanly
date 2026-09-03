"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-triggered fade/rise wrapper used sitewide. Extracted from
 * `components/home/HomeContent.tsx` (previously private to that file) per
 * `docs/design/2026-09-services-page-spec.md` §1, and fixed for the accessibility gap flagged in
 * §7 of the same doc: `globals.css`'s `@media (prefers-reduced-motion: reduce)` block only zeroes
 * CSS `transition`/`animation` durations — it cannot reach framer-motion's `whileInView` prop,
 * which is JS-driven. Without this hook, every `Reveal` instance still slides up 24px on scroll
 * for a visitor who has reduced motion turned on for vestibular reasons. `useReducedMotion()`
 * collapses the motion to a plain opacity fade (no vertical travel) when the OS setting is on.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: prefersReducedMotion ? 0.01 : 0.5,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
