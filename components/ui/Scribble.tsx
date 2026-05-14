/**
 * Scribble — reusable hand-drawn decorative SVG elements.
 *
 * Variants:
 * - underline: wavy underline for headings
 * - squiggle: a playful stroke
 * - circle: dashed decorative circle
 * - arrow: hand-drawn arrow
 * - star: starburst sparkle
 * - sparkle: alias for star
 * - loop: loop-de-loop decorative
 */

type ScribbleVariant =
  | "underline"
  | "squiggle"
  | "circle"
  | "arrow"
  | "star"
  | "sparkle"
  | "loop";

export interface ScribbleProps {
  variant: ScribbleVariant;
  className?: string;
  color?: string;
}

export function Scribble({
  variant,
  className = "",
  color = "#FDA544",
}: ScribbleProps) {
  const commonProps = {
    fill: "none" as const,
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 3,
  };

  switch (variant) {
    case "underline":
      return (
        <svg
          className={`absolute -bottom-3 left-0 w-full h-4 pointer-events-none -z-10 ${className}`}
          preserveAspectRatio="none"
          viewBox="0 0 200 20"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
        >
          <path d="M5 15C45 5 120 2 195 10" />
        </svg>
      );

    case "squiggle":
      return (
        <svg
          className={`pointer-events-none ${className}`}
          viewBox="0 0 100 30"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
        >
          <path d="M5 15C25 2 45 28 65 15T95 15" />
        </svg>
      );

    case "circle":
      return (
        <svg
          className={`pointer-events-none ${className}`}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
          strokeDasharray="8 6"
        >
          <circle cx="50" cy="50" r="40" />
        </svg>
      );

    case "arrow":
      return (
        <svg
          className={`pointer-events-none ${className}`}
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
        >
          <path d="M10 40L40 10M40 10L20 10M40 10L40 30" />
        </svg>
      );

    case "star":
    case "sparkle":
      return (
        <svg
          className={`pointer-events-none ${className}`}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
          strokeWidth={2}
        >
          <path d="M32 4V12M32 52V60M4 32H12M52 32H60M12 12L18 18M46 46L52 52M12 52L18 46M46 18L52 12" />
          <path d="M30 6V14M8 30H16" strokeWidth={1} />
        </svg>
      );

    case "loop":
      return (
        <svg
          className={`pointer-events-none ${className}`}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          {...commonProps}
        >
          <path d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 60 15" />
        </svg>
      );

    default:
      return null;
  }
}