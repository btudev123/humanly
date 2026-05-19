"use client";

import React, {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Section = {
  id?: string;
  background: string;
  leftLabel?: ReactNode;
  title: string | ReactNode;
  rightLabel?: ReactNode;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

type Durations = Partial<{
  change: number;
  snap: number;
}>;

export type FullScreenFXAPI = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
  refresh: () => void;
};

export type FullScreenFXProps = {
  sections: Section[];
  className?: string;
  style?: CSSProperties;
  fontFamily?: string;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number;
  gridPaddingX?: number;
  showProgress?: boolean;
  debug?: boolean;
  durations?: Durations;
  reduceMotion?: boolean;
  smoothScroll?: boolean;
  bgTransition?: "fade" | "wipe";
  parallaxAmount?: number;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  colors?: Colors;
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,
      fontFamily = "Poppins, system-ui, sans-serif",
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,
      showProgress = true,
      debug = false,
      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      currentIndex,
      onIndexChange,
      initialIndex = 0,
      colors = {
        text: "rgba(255,255,255,0.94)",
        overlay: "rgba(63,27,115,0.44)",
        pageBg: "#ffffff",
        stageBg: "#3f1b73",
      },
      apiRef,
      ariaLabel = "Full screen scroll slideshow",
    },
    ref
  ) => {
    const total = sections.length;
    const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
    const [prefersReduced, setPrefersReduced] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const bgRefs = useRef<HTMLDivElement[]>([]);
    const titleRefs = useRef<HTMLElement[]>([]);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const isControlled = typeof currentIndex === "number";
    const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;
    const motionOff = reduceMotion ?? prefersReduced;

    useEffect(() => {
      setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }, []);

    const setIndex = (nextIndex: number) => {
      const next = clamp(nextIndex, 0, Math.max(0, total - 1));
      if (!isControlled) setLocalIndex(next);
      onIndexChange?.(next);
    };

    const goTo = (nextIndex: number) => {
      setIndex(nextIndex);
      const root = rootRef.current;
      if (root) {
        const section = root.querySelector<HTMLElement>(`[data-fx-panel="${clamp(nextIndex, 0, total - 1)}"]`);
        section?.scrollIntoView({ behavior: motionOff ? "auto" : "smooth", block: "start" });
      }
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    useImperativeHandle(apiRef, () => ({
      next,
      prev,
      goTo,
      getIndex: () => index,
      refresh: () => ScrollTrigger.refresh(),
    }));

    useEffect(() => {
      if (!rootRef.current || total === 0) return;
      if (motionOff) return;

      const ctx = gsap.context(() => {
        sections.forEach((_, itemIndex) => {
          ScrollTrigger.create({
            trigger: `[data-fx-panel="${itemIndex}"]`,
            start: "top center",
            end: "bottom center",
            onEnter: () => setIndex(itemIndex),
            onEnterBack: () => setIndex(itemIndex),
          });
        });
      }, rootRef);

      return () => ctx.revert();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motionOff, total]);

    useEffect(() => {
      bgRefs.current.forEach((el, itemIndex) => {
        if (!el) return;
        if (motionOff) {
          el.style.opacity = itemIndex === index ? "1" : "0";
          return;
        }
        gsap.to(el, {
          opacity: itemIndex === index ? 1 : 0,
          scale: itemIndex === index ? 1 : 1.04,
          duration: durations.change ?? 0.7,
          ease: "power2.out",
        });
      });

      titleRefs.current.forEach((el, itemIndex) => {
        if (!el) return;
        gsap.to(el, {
          opacity: itemIndex === index ? 1 : 0.32,
          y: itemIndex === index ? 0 : 10,
          duration: motionOff ? 0 : durations.change ?? 0.7,
          ease: "power2.out",
        });
      });

      if (progressRef.current) {
        progressRef.current.style.width = `${(index / (total - 1 || 1)) * 100}%`;
      }
    }, [durations.change, index, motionOff, total]);

    const cssVars = useMemo(
      () =>
        ({
          "--fx-font": fontFamily,
          "--fx-text": colors.text ?? "rgba(255,255,255,0.94)",
          "--fx-overlay": colors.overlay ?? "rgba(63,27,115,0.44)",
          "--fx-page-bg": colors.pageBg ?? "#fff",
          "--fx-stage-bg": colors.stageBg ?? "#3f1b73",
          "--fx-gap": `${gap}rem`,
          "--fx-grid-px": `${gridPaddingX}rem`,
        }) as CSSProperties,
      [colors.overlay, colors.pageBg, colors.stageBg, colors.text, fontFamily, gap, gridPaddingX]
    );

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn("fx relative bg-[var(--fx-page-bg)]", className)}
        style={{ ...cssVars, ...style }}
        aria-label={ariaLabel}
      >
        {debug && (
          <div className="fixed bottom-3 right-3 z-[60] rounded bg-white/90 px-2 py-1 text-xs text-black">
            Section: {index + 1}
          </div>
        )}
        <div className="sticky top-0 z-10 h-screen overflow-hidden bg-[var(--fx-stage-bg)]">
          {sections.map((section, itemIndex) => (
            <div
              key={section.id ?? itemIndex}
              ref={(el) => {
                if (el) bgRefs.current[itemIndex] = el;
              }}
              className="absolute inset-0 opacity-0"
            >
              {section.renderBackground ? (
                section.renderBackground(index === itemIndex, false)
              ) : (
                <>
                  <img src={section.background} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[var(--fx-overlay)]" />
                </>
              )}
            </div>
          ))}
          <div className="relative z-10 grid h-full grid-cols-12 gap-[var(--fx-gap)] px-[var(--fx-grid-px)] text-[var(--fx-text)]">
            {header && (
              <div className="col-span-12 place-self-start pt-[8vh] text-center text-4xl font-black md:text-7xl">
                {header}
              </div>
            )}
            <div className="col-span-12 grid place-items-center text-center">
              {sections.map((section, itemIndex) => (
                <button
                  key={section.id ?? itemIndex}
                  type="button"
                  data-active={index === itemIndex}
                  onClick={() => goTo(itemIndex)}
                  ref={(el) => {
                    if (el) titleRefs.current[itemIndex] = el;
                  }}
                  className="absolute max-w-5xl cursor-pointer px-4 text-center text-4xl font-black leading-none text-current opacity-40 md:text-7xl"
                >
                  <span className="mb-4 block text-base font-bold uppercase">{section.leftLabel}</span>
                  {section.title}
                  <span className="mt-4 block text-base font-bold uppercase">{section.rightLabel}</span>
                </button>
              ))}
            </div>
            <div className="col-span-12 self-end pb-[6vh] text-center">
              {footer}
              {showProgress && (
                <div className="mx-auto mt-5 h-1 w-56 rounded-full bg-white/30">
                  <div ref={progressRef} className="h-full w-0 rounded-full bg-secondary-orange transition-[width]" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div aria-hidden="true">
          {sections.map((section, itemIndex) => (
            <section key={section.id ?? itemIndex} data-fx-panel={itemIndex} className="h-screen" />
          ))}
        </div>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";
