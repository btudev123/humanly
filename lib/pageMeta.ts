/**
 * Per-route title + description fallbacks for the fixed marketing pages.
 *
 * This is the single source shared by two consumers:
 *   1. Each page's `generateMetadata()` passes these into `buildMetadata()` as the
 *      in-code fallback used when Sanity has no `metaTitle`/`metaDescription`.
 *   2. `scripts/seed-sanity.ts` seeds the same strings into each `page` document's
 *      SEO block, so Studio opens pre-populated with the copy that is already live.
 *
 * Keeping both in one place means the CMS and the build can never silently disagree
 * about what a page's default SEO is. The route keys match `ROUTES` in
 * `sanity/schemaTypes/page.ts`.
 */
export type PageMeta = { title: string; description: string };

export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Humanly — Independent, Confidential HR Advisory for Professionals",
    description:
      "Your HR manages the workplace. We manage your career. Independent, confidential HR advice for professionals worldwide — toxic workplaces, PIPs, burnout, exits, and your rights, without your employer knowing. Regional guides for the UAE, GCC & North America.",
  },
  "/services": {
    title: "HR Advisory Services & Pricing | Humanly",
    description:
      "Confidential HR advisory sessions, specialist sessions, and monthly retainers — from a single 30-minute call to ongoing monthly support. Independent advice on PIPs, exits, contracts, and your rights, priced transparently in AED.",
  },
  "/about": {
    title: "About Karma Harb & Humanly",
    description:
      "Karma Harb founded Humanly after ~20 years in HR across regulated industries, government, media and investment management — to give every professional honest, confidential, expert HR guidance.",
  },
  "/resources": {
    title: "HR Resource Hub | Guides, Kits & Courses | Humanly",
    description:
      "Practical HR guides, toolkits, scripts, and courses for professionals worldwide — covering PIPs, exits, harassment, UAE/GCC rights, and more. Pay once, own it forever.",
  },
  "/blog": {
    title: "Blog | Humanly",
    description:
      "Honest, practical writing on managers, exits, workplace rights, and getting a second opinion before you decide — from Karma Harb and the Humanly advisory team.",
  },
  "/tools": {
    title: "Free HR Tools | Humanly",
    description:
      "Free interactive tools for professionals — diagnose if you're being managed out, decide whether to resign or stay, and more. No sign-up required.",
  },
  "/booking": {
    title: "Book a Confidential HR Consultation",
    description:
      "Book a private Humanly consultation. See real availability, then pay securely through Stripe to confirm your confidential session time.",
  },
  "/contact": {
    title: "Contact Humanly | Confidential HR Advisory",
    description:
      "Get in touch with Humanly for independent, confidential HR advice. No employer loop-in, no judgment — just a real expert on your side of the table.",
  },
  "/faq": {
    title: "FAQ | Confidential HR Advice UAE & GCC",
    description:
      "Answers about Humanly confidentiality, Stripe payments, booking, refunds, HR advisory scope, and UAE workplace support.",
  },
  "/privacy": {
    title: "Privacy Policy | Humanly",
    description:
      "Humanly privacy policy covering confidential intake, booking, payment, resource download, and advisory data handling.",
  },
  "/terms": {
    title: "Terms of Service | Humanly",
    description:
      "Humanly terms for confidential HR advisory, paid resources, Stripe payments, bookings, refunds, and service scope.",
  },
};
