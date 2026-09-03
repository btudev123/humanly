"use client";

import type { ReactNode } from "react";

/**
 * The small pill label used above section headings sitewide. Extracted from
 * `components/home/HomeContent.tsx` (previously private to that file) so `/services` and any
 * future page can use the same component instead of a third hand-copied version.
 * See `docs/design/2026-09-services-page-spec.md` §1.
 */
export function Eyebrow({
  children,
  color = "orange",
}: {
  children: ReactNode;
  color?: "orange" | "violet";
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
      <span className={`h-2 w-2 rounded-full ${color === "orange" ? "bg-accent-orange" : "bg-primary-violet"}`} />
      {children}
    </span>
  );
}
