import { cn } from "@/lib/utils";

/**
 * Brand lockup: transparent SVG H-mark (`/public/logo-mark.svg`) + "Humanly"
 * wordmark rendered as live text in Poppins ExtraBold so the brand font is used
 * (an SVG referenced via <img> cannot load the page's web fonts).
 *
 * Sizing is driven by the height utility passed in `className` (e.g. `h-11`);
 * the mark fills that height and the wordmark is scaled to pair with it.
 */
export function BrandLogo({
  className = "",
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-primary-dark", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt="Humanly"
        className="h-full w-auto"
        style={{ aspectRatio: "1 / 1" }}
      />
      {wordmark && (
        <span className="font-display text-[1.55rem] font-extrabold leading-none tracking-[-0.02em]">
          Humanly
        </span>
      )}
    </span>
  );
}
