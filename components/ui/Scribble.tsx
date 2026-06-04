/**
 * Scribble — reusable hand-drawn decorative SVG elements.
 *
 * Variants:
 * - underline      wavy underline for headings
 * - underline-bold thicker double-stroke underline
 * - squiggle       a playful wave stroke
 * - wave           long flowing wave (dividers)
 * - zigzag         sharp zigzag accent
 * - circle         dashed decorative circle
 * - circle-rough   hand-drawn circle (for circling words)
 * - arrow          straight hand-drawn arrow
 * - arrow-curved   curved pointing arrow
 * - star / sparkle starburst sparkle
 * - star-fill      4-point filled twinkle
 * - loop           loop-de-loop decorative
 * - spiral         spiral doodle
 * - heart          hand-drawn heart
 * - bolt           lightning bolt
 * - dots           three dots / motion marks
 */

type ScribbleVariant =
  | "underline"
  | "underline-bold"
  | "squiggle"
  | "wave"
  | "zigzag"
  | "circle"
  | "circle-rough"
  | "arrow"
  | "arrow-curved"
  | "star"
  | "sparkle"
  | "star-fill"
  | "loop"
  | "spiral"
  | "heart"
  | "bolt"
  | "dots";

export interface ScribbleProps {
  variant: ScribbleVariant;
  className?: string;
  color?: string;
  strokeWidth?: number;
  /** animate the stroke drawing on mount */
  animate?: boolean;
}

export function Scribble({
  variant,
  className = "",
  color = "#ff6a1a",
  strokeWidth = 3,
  animate = false,
}: ScribbleProps) {
  const common = {
    fill: "none" as const,
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
  };
  const drawClass = animate ? "[stroke-dasharray:400] animate-draw" : "";

  switch (variant) {
    case "underline":
      return (
        <svg className={`pointer-events-none ${className}`} preserveAspectRatio="none" viewBox="0 0 200 20" {...common}>
          <path className={drawClass} d="M5 14C45 5 120 3 195 11" />
        </svg>
      );

    case "underline-bold":
      return (
        <svg className={`pointer-events-none ${className}`} preserveAspectRatio="none" viewBox="0 0 200 24" {...common} strokeWidth={strokeWidth}>
          <path className={drawClass} d="M4 11C50 4 130 3 196 9" />
          <path d="M10 19C60 13 140 12 190 17" opacity={0.55} />
        </svg>
      );

    case "squiggle":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 30" {...common}>
          <path className={drawClass} d="M5 15C25 2 45 28 65 15T95 15" />
        </svg>
      );

    case "wave":
      return (
        <svg className={`pointer-events-none ${className}`} preserveAspectRatio="none" viewBox="0 0 300 24" {...common}>
          <path className={drawClass} d="M2 12C40 2 60 22 100 12S160 2 200 12 260 22 298 12" />
        </svg>
      );

    case "zigzag":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 120 24" {...common}>
          <path className={drawClass} d="M4 18L24 6L44 18L64 6L84 18L104 6L116 14" />
        </svg>
      );

    case "circle":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 100" {...common} strokeDasharray="8 6">
          <circle cx="50" cy="50" r="40" />
        </svg>
      );

    case "circle-rough":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 200 100" {...common}>
          <path
            className={drawClass}
            d="M100 8C150 6 192 24 192 50c0 28-46 44-96 42C46 90 8 72 8 48 8 24 50 10 104 10"
          />
        </svg>
      );

    case "arrow":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 50 50" {...common}>
          <path className={drawClass} d="M10 40L40 10M40 10L20 10M40 10L40 30" />
        </svg>
      );

    case "arrow-curved":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 80 60" {...common}>
          <path className={drawClass} d="M6 12C24 4 54 6 66 34" />
          <path d="M56 30L67 36L72 24" />
        </svg>
      );

    case "star":
    case "sparkle":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 64 64" {...common} strokeWidth={2}>
          <path d="M32 4V12M32 52V60M4 32H12M52 32H60M12 12L18 18M46 46L52 52M12 52L18 46M46 18L52 12" />
          <path d="M30 6V14M8 30H16" strokeWidth={1} />
        </svg>
      );

    case "star-fill":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 64 64" fill={color} stroke="none">
          <path d="M32 0c2 18 14 30 32 32-18 2-30 14-32 32-2-18-14-30-32-32 18-2 30-14 32-32Z" />
        </svg>
      );

    case "loop":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 100" {...common}>
          <path className={drawClass} d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 60 15" />
        </svg>
      );

    case "spiral":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 100" {...common}>
          <path className={drawClass} d="M50 50c0-6 8-6 8 0s-10 10-16 4-6-22 8-26 30 6 30 24-16 34-38 30" />
        </svg>
      );

    case "heart":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 64 60" {...common}>
          <path className={drawClass} d="M32 54C12 40 4 28 4 18 4 9 11 4 18 4c6 0 11 4 14 9 3-5 8-9 14-9 7 0 14 5 14 14 0 10-8 22-28 36Z" />
        </svg>
      );

    case "bolt":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 40 64" {...common}>
          <path className={drawClass} d="M24 4L8 36h12l-6 24 22-34H22l6-22Z" />
        </svg>
      );

    case "dots":
      return (
        <svg className={`pointer-events-none ${className}`} viewBox="0 0 64 20" fill={color} stroke="none">
          <circle cx="10" cy="10" r="5" />
          <circle cx="32" cy="10" r="5" opacity={0.7} />
          <circle cx="54" cy="10" r="5" opacity={0.45} />
        </svg>
      );

    default:
      return null;
  }
}
