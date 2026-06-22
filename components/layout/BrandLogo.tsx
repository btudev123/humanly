import { cn } from "@/lib/utils";

/**
 * Brand logo — the full Humanly lockup (H-mark + "Humanly" wordmark) shipped as
 * a single transparent asset (`/public/logo.svg`). Sizing is driven by the
 * height utility passed in `className` (e.g. `h-12`); width scales automatically.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.svg" alt="Humanly" className={cn("w-auto", className)} />
  );
}
