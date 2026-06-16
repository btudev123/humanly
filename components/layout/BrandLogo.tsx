import Image from "next/image";

/**
 * Brand logo. Replace /public/humanly-logo.png with updated artwork to change
 * the logo everywhere it is used. (A transparent-background SVG/PNG is ideal —
 * the current file has a solid cream background, so it is shown on matching
 * light/cream surfaces.)
 */
export function BrandLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/humanly-logo.png"
      alt="Humanly"
      width={268}
      height={158}
      priority
      className={className}
    />
  );
}
