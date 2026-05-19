"use client";

import {
  type ReactNode,
  type TouchEvent,
  type WheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

export default function ScrollExpandMedia({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setScrollProgress(1);
      setShowContent(true);
      setMediaFullyExpanded(true);
    }
  }, [reduceMotion]);

  const updateProgress = (delta: number) => {
    const next = Math.min(Math.max(scrollProgress + delta, 0), 1);
    setScrollProgress(next);
    setShowContent(next >= 0.75);
    setMediaFullyExpanded(next >= 1);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const bounds = sectionRef.current?.getBoundingClientRect();
    if (!bounds || bounds.top > 0 || bounds.bottom < window.innerHeight * 0.4) return;
    if (!mediaFullyExpanded || (mediaFullyExpanded && event.deltaY < 0 && window.scrollY <= 5)) {
      event.preventDefault();
      updateProgress(event.deltaY * 0.0009);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (reduceMotion || !touchStartY) return;
    const touchY = event.touches[0].clientY;
    const deltaY = touchStartY - touchY;
    if (!mediaFullyExpanded || (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5)) {
      event.preventDefault();
      updateProgress(deltaY * (deltaY < 0 ? 0.008 : 0.005));
      setTouchStartY(touchY);
    }
  };

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 120 : 150);
  const [firstWord = "", ...rest] = title ? title.split(" ") : [];
  const restOfTitle = rest.join(" ");

  return (
    <div
      ref={sectionRef}
      className="overflow-x-hidden transition-colors duration-700 ease-in-out"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setTouchStartY(0)}
    >
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start">
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center">
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt=""
              width={1920}
              height={1080}
              className="h-screen w-screen object-cover"
              priority
            />
            <div className="absolute inset-0 bg-primary-dark/25" />
          </motion.div>
          <div className="container relative z-10 mx-auto flex flex-col items-center justify-start">
            <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center">
              <div
                className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0 28px 80px rgba(63, 27, 115, 0.28)",
                }}
              >
                {mediaType === "video" ? (
                  <div className="pointer-events-none relative h-full w-full">
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full rounded-xl object-cover"
                      controls={false}
                      disablePictureInPicture
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-primary-dark/35"
                      animate={{ opacity: 0.55 - scrollProgress * 0.3 }}
                    />
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={mediaSrc}
                      alt={title || "Humanly advisory visual"}
                      width={1280}
                      height={720}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-primary-dark/40"
                      animate={{ opacity: 0.68 - scrollProgress * 0.35 }}
                    />
                  </div>
                )}
                <div className="relative z-10 mt-4 flex flex-col items-center text-center">
                  {date && (
                    <p className="text-2xl font-bold text-white" style={{ transform: `translateX(-${textTranslateX}vw)` }}>
                      {date}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p className="text-center font-medium text-white" style={{ transform: `translateX(${textTranslateX}vw)` }}>
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`relative z-10 flex w-full flex-col items-center justify-center gap-4 text-center ${
                  textBlend ? "mix-blend-difference" : "mix-blend-normal"
                }`}
              >
                <motion.h2
                  className="text-4xl font-extrabold text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-center text-4xl font-extrabold text-white md:text-5xl lg:text-6xl"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>
            <motion.section
              className="flex w-full flex-col px-8 py-10 md:px-16 lg:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
}
