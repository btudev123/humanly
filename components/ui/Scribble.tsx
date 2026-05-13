"use client";

import { motion } from "motion/react";

type ScribbleType = "circle" | "underline" | "star" | "arrow" | "sparkle" | "loop" | "wave";

export const Scribble = ({ 
  type = "circle", 
  className = "", 
  color = "currentColor",
  delay = 0 
}: { 
  type?: ScribbleType, 
  className?: string,
  color?: string,
  delay?: number
}) => {
  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        delay, 
        ease: "easeInOut" as any
      } 
    }
  };

  if (type === "underline") {
    return (
      <svg viewBox="0 0 100 10" className={className} preserveAspectRatio="none">
        <motion.path
          d="M2 8 Q 25 2, 50 8 T 98 8"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
      </svg>
    );
  }

  if (type === "loop") {
    return (
      <svg viewBox="0 0 40 40" className={className}>
        <motion.path
          d="M20 5 C 10 5, 5 15, 20 20 S 30 35, 20 35"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
      </svg>
    );
  }

  if (type === "wave") {
    return (
      <svg viewBox="0 0 100 20" className={className} preserveAspectRatio="none">
        <motion.path
          d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <motion.path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />
      </svg>
    );
  }

  if (type === "sparkle") {
      return (
          <svg viewBox="0 0 24 24" className={className} fill="none">
              <motion.path
                  d="M12 3v3m0 12v3M3 12h3m12 0h3m-15.5-6.5l2 2m10.5 10.5l2 2m-14.5 0l2-2m10.5-10.5l2-2"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  variants={variants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
              />
          </svg>
      );
  }

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,5"
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      />
    </svg>
  );
};
