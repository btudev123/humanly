"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, Quote, Instagram, Video, ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------------------------------------------------------- */
/*  Types                                                            */
/* ---------------------------------------------------------------- */

export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  company?: string;
  quote: string;
  /** Lightweight thumbnail URL – loaded lazily */
  thumbnail?: string;
  /** Full video or Instagram embed URL – loaded on demand */
  mediaUrl?: string;
  mediaType?: "video" | "instagram";
  /** Pre-rendered transcript for SEO + accessibility */
  transcript?: string;
  rating?: number; // 1-5
  date: string; // ISO date
  verified?: boolean;
}

/* ---------------------------------------------------------------- */
/*  Sub-components                                                    */
/* ---------------------------------------------------------------- */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-amber-400" : "text-neutral-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function MediaThumbnail({
  testimonial,
  onOpen,
}: {
  testimonial: Testimonial;
  onOpen: () => void;
}) {
  if (!testimonial.thumbnail) return null;

  return (
    <button
      onClick={onOpen}
      className="group relative mt-4 block w-full overflow-hidden rounded-xl bg-neutral-900"
      aria-label={`Play testimonial from ${testimonial.author}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={testimonial.thumbnail}
        alt={`${testimonial.author} testimonial thumbnail`}
        loading="lazy"
        className="aspect-video w-full object-cover opacity-70 transition-opacity group-hover:opacity-90"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-dark bg-accent-orange text-primary-dark shadow-lg transition-transform group-hover:scale-110">
          {testimonial.mediaType === "instagram" ? (
            <Instagram size={22} />
          ) : (
            <Play size={22} className="ml-1" />
          )}
        </div>
      </div>
    </button>
  );
}

function MediaModal({
  testimonial,
  onClose,
}: {
  testimonial: Testimonial;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isInstagram = testimonial.mediaType === "instagram";

  return (
    <motion.div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label="Close media"
        >
          ✕
        </button>

        {isInstagram ? (
          <div className="aspect-[9/16] w-full">
            <iframe
              src={testimonial.mediaUrl}
              className="h-full w-full"
              title={`Instagram testimonial from ${testimonial.author}`}
              loading="lazy"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={testimonial.mediaUrl}
            className="aspect-video w-full"
            controls
            autoPlay
            playsInline
            poster={testimonial.thumbnail}
          >
            <track kind="captions" src="" label="English" />
          </video>
        )}

        {/* Transcript for SEO + a11y */}
        {testimonial.transcript && (
          <details className="border-t border-neutral-700 px-6 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-neutral-400">
              Transcript
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              {testimonial.transcript}
            </p>
          </details>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/*  Carousel Container                                               */
/* ---------------------------------------------------------------- */

export function TestimonialsCarousel({
  testimonials,
  title = "What people are saying",
  subtitle,
}: {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
}) {
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState<Testimonial | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const len = testimonials.length || 1;

  const next = useCallback(
    () => setActive((v) => (v + 1) % len),
    [len],
  );
  const prev = useCallback(
    () => setActive((v) => (v - 1 + len) % len),
    [len],
  );

  // Auto-advance every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next, isPaused]);

  if (!testimonials.length) {
    return (
      <section className="px-6 py-24 text-center">
        <p className="text-neutral-500 italic">
          Verified testimonials coming soon. We don't publish reviews until they are consented and verified.
        </p>
      </section>
    );
  }

  const current = testimonials[active];

  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl">

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop md:p-12"
            >
              <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                {/* Text */}
                <div className="flex-1">
                  <Quote className="mb-4 text-accent-orange/50" size={36} />
                  <blockquote className="text-lg leading-relaxed text-neutral-700 md:text-xl">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>

                  <div className="mt-6 flex items-center gap-3">
                    <div>
                      <p className="font-extrabold text-neutral-900">
                        {current.author}
                      </p>
                      {(current.role || current.company) && (
                        <p className="text-sm text-neutral-500">
                          {[current.role, current.company]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    {current.rating && <StarRating rating={current.rating} />}
                  </div>

                  {current.verified && (
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                      ✓ Verified
                    </p>
                  )}
                </div>

                {/* Media thumbnail */}
                {current.thumbnail && (
                  <div className="md:w-64">
                    <MediaThumbnail
                      testimonial={current}
                      onOpen={() => setModal(current)}
                    />
                  </div>
                )}
              </div>

              {/* Transcript snippet for SEO */}
              {current.transcript && !current.thumbnail && (
                <details className="mt-6 border-t border-neutral-100 pt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-neutral-400">
                    Read transcript
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {current.transcript}
                  </p>
                </details>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              aria-label="Previous testimonial"
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-dark bg-neutral-100 text-primary-dark transition-colors hover:bg-violet-tint"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    active === i
                      ? "w-8 bg-accent-orange"
                      : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            <button
              aria-label="Next testimonial"
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-dark bg-neutral-100 text-primary-dark transition-colors hover:bg-violet-tint"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pause/Play */}
            <button
              aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
              onClick={() => setIsPaused(!isPaused)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Media modal */}
      <AnimatePresence>
        {modal && (
          <MediaModal testimonial={modal} onClose={() => setModal(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/*  Static grid (no carousel – for SEO + print)                      */
/* ---------------------------------------------------------------- */

export function TestimonialsGrid({
  testimonials,
  title = "Verified testimonials",
}: {
  testimonials: Testimonial[];
  title?: string;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="bg-white px-5 py-24 md:px-[64px]">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-h2 font-extrabold text-neutral-900">
          {title}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-6"
            >
              {t.rating && <StarRating rating={t.rating} />}
              <blockquote className="mt-3 leading-relaxed text-neutral-700">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="mt-4 border-t border-neutral-200 pt-4">
                <p className="font-extrabold text-neutral-900">{t.author}</p>
                {(t.role || t.company) && (
                  <p className="text-sm text-neutral-500">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                )}
                {t.verified && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    ✓ Verified
                  </p>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}