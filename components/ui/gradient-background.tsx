"use client";

import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type GradientBackgroundProps = React.ComponentProps<"div"> & {
  gradients?: string[];
  animationDuration?: number;
  animationDelay?: number;
  enableCenterContent?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
};

const defaultGradients = [
  "linear-gradient(135deg, #3f1b73 0%, #fda544 48%, #ffffff 100%)",
  "linear-gradient(135deg, #7c35e3 0%, #f982db 42%, #fda544 100%)",
  "linear-gradient(135deg, #3f1b73 0%, #7c35e3 46%, #fda544 100%)",
  "linear-gradient(135deg, #ffffff 0%, #fda544 38%, #3f1b73 100%)",
  "linear-gradient(135deg, #3f1b73 0%, #fda544 48%, #ffffff 100%)",
];

export function GradientBackground({
  children,
  className = "",
  gradients = defaultGradients,
  animationDuration = 10,
  animationDelay = 0.5,
  enableCenterContent = true,
  overlay = false,
  overlayOpacity = 0.24,
  ...props
}: GradientBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden", className)} {...props}>
      <motion.div
        className="absolute inset-0"
        style={{ background: gradients[0] }}
        animate={reduceMotion ? undefined : { background: gradients }}
        transition={{
          delay: animationDelay,
          duration: animationDuration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(255,255,255,0.42),transparent_32%)]" />
      {overlay && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}
      {children && (
        <div
          className={cn(
            "relative z-10 min-h-screen",
            enableCenterContent && "flex items-center justify-center"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
