"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import {
  formatUsd,
  formatAed,
  serviceCategoryLabels,
  type ServiceCategory,
} from "@/lib/products";
import type { MergedService } from "@/lib/sanity/queries";

const categoryOrder: { key: ServiceCategory; blurb: string; accent: string }[] = [
  {
    key: "session",
    blurb: "One-off, pay-as-you-go advisory — book exactly what your situation needs. No commitment required.",
    accent: "bg-violet-tint border-primary-violet/20",
  },
  {
    key: "retainer",
    blurb: "Ongoing monthly support for live, evolving situations — the most comprehensive way to work with Humanly.",
    accent: "bg-accent-orange/8 border-accent-orange/20",
  },
  {
    key: "corporate",
    blurb: "Employer-side guidance and team workshops for SMEs.",
    accent: "bg-neutral-200/60 border-neutral-300",
  },
];

/**
 * The animated service grid. Split out of `app/services/page.tsx` so that page can
 * be a server component that fetches Sanity-merged copy via `getServices()` — the
 * only client-only concern here is framer-motion.
 */
export function ServicesCatalog({ services }: { services: MergedService[] }) {
  return (
    <>
      {categoryOrder.map(({ key, blurb, accent }) => {
        const items = services.filter((product) => product.category === key);
        if (items.length === 0) return null;

        return (
          <section key={key} className="mx-auto mt-20 max-w-max-width px-margin-mobile md:px-margin-desktop">
            <div className={`mb-8 rounded-2xl border-2 border-primary-dark p-6 ${accent}`}>
              <h2 className="text-h2 font-display font-extrabold tracking-tight text-primary-dark">
                {serviceCategoryLabels[key]}
              </h2>
              <p className="mt-2 text-body-lg text-neutral-500">{blurb}</p>
            </div>

            <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((service, index) => (
                <motion.article
                  key={service.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex flex-col gap-5 rounded-3xl border-2 border-primary-dark p-8 ${
                    service.featured
                      ? "bg-primary-dark text-on-primary shadow-pop-orange"
                      : "bg-neutral-100 transition-transform hover:-translate-y-1"
                  }`}
                >
                  {service.featured && (
                    <span className="absolute -top-3.5 left-8 rounded-full border-2 border-primary-dark bg-accent-orange px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                      Most Popular
                    </span>
                  )}

                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${service.featured ? "border-accent-orange bg-accent-orange text-primary-dark" : "border-primary-dark bg-violet-tint text-primary-violet"}`}>
                    <Sparkles size={22} />
                  </div>

                  <div>
                    <h3 className={`font-display text-h3 font-bold ${service.featured ? "text-on-primary" : "text-primary-dark"}`}>{service.name}</h3>
                    <p className={`mt-1 text-sm font-bold uppercase tracking-wider ${service.featured ? "text-orange-light" : "text-primary-violet"}`}>{service.subtitle}</p>
                  </div>

                  <p className={`leading-relaxed ${service.featured ? "text-on-primary/70" : "text-neutral-500"}`}>{service.description}</p>

                  <div className={`border-t-2 border-dashed pt-5 ${service.featured ? "border-white/15" : "border-neutral-300"}`}>
                    <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.16em] ${service.featured ? "text-orange-light" : "text-accent-orange"}`}>What you get</p>
                    <ul className="space-y-2.5">
                      {service.features.map((item) => (
                        <li key={item} className={`flex gap-2.5 text-sm ${service.featured ? "text-on-primary/80" : "text-neutral-500"}`}>
                          <CheckCircle2 className={service.featured ? "mt-0.5 shrink-0 text-accent-orange" : "mt-0.5 shrink-0 text-primary-violet"} size={16} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`mt-auto border-t-2 border-dashed pt-5 ${service.featured ? "border-white/15" : "border-neutral-300"}`}>
                    <p className={`text-xs font-bold uppercase tracking-[0.14em] ${service.featured ? "text-on-primary/60" : "text-neutral-400"}`}>{service.duration}</p>
                    <p className={`mt-1 font-display text-4xl font-extrabold ${service.featured ? "text-on-primary" : "text-primary-dark"}`}>
                      {formatAed(service.amountAed)}
                      {service.priceNote && (
                        <span className={`text-xl font-bold ${service.featured ? "text-on-primary/60" : "text-neutral-400"}`}>{service.priceNote}</span>
                      )}
                    </p>
                    <p className={`mt-1 text-xs font-semibold ${service.featured ? "text-on-primary/55" : "text-neutral-400"}`}>
                      ≈ {formatUsd(service.amount)}{service.priceNote ?? ""} · charged in USD
                    </p>
                    <Link
                      href="/booking"
                      className={`btn-pop mt-4 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark px-6 py-3.5 text-[15px] font-bold ${
                        service.featured ? "bg-accent-orange text-primary-dark shadow-pop-sm" : "bg-primary-dark text-on-primary"
                      }`}
                    >
                      {service.needsScheduling ? "Book Now" : "Get Started"}
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
