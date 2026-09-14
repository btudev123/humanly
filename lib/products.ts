export type ProductKind = "consultation" | "resource";

/**
 * Three strips on `/services`:
 * - `core`       the Goldilocks advisory ladder (The Session → Session + Plan → Full Support)
 * - `specialist` single-purpose sessions bought on their own
 * - `retainer`   monthly subscriptions
 *
 * The `corporate` category was retired in the Sept 2026 restructure: Humanly sells
 * employee-side advisory only, and listing employer-side services alongside it put the
 * practice on both sides of the same employment dispute.
 */
export type ServiceCategory = "core" | "specialist" | "retainer";

/** Position on the core ladder. Only `core` products carry one. */
export type CoreTier = "good" | "better" | "best";

/**
 * The dirham is pegged to the dollar at 3.6725, so this rate is fixed rather than fetched.
 * Used only to derive the USD *reference* figure shown next to a price — never to charge.
 */
export const AED_PER_USD = 3.6725;

/** Whole dirhams → USD cents, for the reference figure only. */
export function usdCentsFromAed(amountAed: number) {
  return Math.round((amountAed / AED_PER_USD) * 100);
}

/** Convert USD cents to a display AED amount, rounded to the nearest 5 dirhams. */
export function aedFromUsdCents(amountUsdCents: number) {
  const aed = (amountUsdCents / 100) * AED_PER_USD;
  return Math.round(aed / 5) * 5;
}

export type ServiceProduct = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  /**
   * Reference amount in USD cents, derived from `amountAed` at module load — never authored
   * by hand, so the two figures cannot drift. Display and reporting only.
   */
  amount: number;
  /** Price in whole dirhams. The primary price AND the currency actually charged. */
  amountAed: number;
  duration: string;
  /** Optional price suffix, e.g. "/mo". */
  priceNote?: string;
  category: ServiceCategory;
  /** Rung on the core ladder. `core` products only. */
  tier?: CoreTier;
  features: string[];
  forWho: string;
  /** Whether a Cal.com scheduling step follows payment. Async products deliver by email instead. */
  needsScheduling: boolean;
  stripePriceEnv: string;
  mode: "payment" | "subscription";
  interval?: "month";
  calLinkEnv: string;
  /** Carries the "Recommended" badge and the highlighted card. */
  featured?: boolean;
  /** Hidden from public listings. No live product currently sets it; list filters still honour it. */
  hidden?: boolean;
};

/** A product as authored — `amount` is derived, so it is never written by hand. */
type ServiceProductSeed = Omit<ServiceProduct, "amount">;

const seeds: ServiceProductSeed[] = [
  // ── Core advisory ladder ────────────────────────────────────────────────
  {
    slug: "the-session",
    name: "The Session",
    subtitle: "Quick orientation on one issue",
    description:
      "A focused 30-minute conversation about one specific problem, with a short written summary of the next steps you should take.",
    amountAed: 400,
    duration: "30 minutes",
    category: "core",
    tier: "good",
    features: [
      "Confidential 30-minute session",
      "Orientation on one specific issue",
      "Short written summary of key next steps",
    ],
    forWho:
      "Anyone who wants an expert read on one issue before deciding what to do about it.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_THE_SESSION",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_THE_SESSION",
  },
  {
    slug: "session-plus-plan",
    name: "Session + Plan",
    subtitle: "The plan you act on",
    description:
      "A full hour on your situation, followed by a written action plan — the scripts, the questions to ask, the documents to prepare, and the order to do them in.",
    amountAed: 950,
    duration: "60 minutes",
    category: "core",
    tier: "better",
    features: [
      "Confidential 60-minute session",
      "Written summary of key next steps",
      "Full written action plan — scripts, questions to ask, documents to prepare, sequenced moves",
      "Async follow-up within 7 days",
    ],
    forWho:
      "People who know the situation is serious and want a plan they can act on, not just advice.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_SESSION_PLUS_PLAN",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_SESSION_PLUS_PLAN",
  },
  {
    slug: "full-support",
    name: "Full Support",
    subtitle: "Everything handled for you",
    description:
      "Everything in Session + Plan, plus the writing done for you — the emails to your manager or HR, the formal response to a PIP or warning letter, a grievance if it comes to that, and resignation or exit documents — with two weeks of async WhatsApp access while the situation plays out.",
    amountAed: 1200,
    duration: "60 minutes",
    category: "core",
    tier: "best",
    features: [
      "Confidential 60-minute session",
      "Written summary of key next steps",
      "Full written action plan — scripts, questions to ask, documents to prepare, sequenced moves",
      "Async follow-up within 7 days",
      "Done-for-you emails to your manager or HR",
      "Formal responses to a PIP, warning, or investigation",
      "Grievance and complaint letters",
      "Resignation and exit documents",
      "14 days async WhatsApp access",
    ],
    forWho:
      "People in a live, high-stakes situation who want the words written for them and someone on hand while it unfolds.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_FULL_SUPPORT",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_FULL_SUPPORT",
    featured: true,
  },

  // ── Specialist sessions ─────────────────────────────────────────────────
  {
    slug: "interview-prep",
    name: "Interview Prep Session",
    subtitle: "JD analysis + mock interview",
    description:
      "An insider-informed analysis of the job description, followed by a mock interview with real-time pointers to sharpen your delivery and your confidence.",
    amountAed: 950,
    duration: "60 minutes",
    category: "specialist",
    features: [
      "JD / job posting analysis",
      "Insider-informed mock interview",
      "Real-time coaching on delivery and confidence",
      "Pointers to carry into the real interview",
    ],
    forWho:
      "Candidates preparing for a specific interview who want an insider read on the likely questions and honest feedback.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_INTERVIEW_PREP",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_INTERVIEW_PREP",
  },
  {
    slug: "dubai-job-search",
    name: "Dubai Job Search Advisory Call",
    subtitle: "30-minute job-market orientation",
    description:
      "UAE job-market orientation, CV positioning, and outreach strategy — the entry point for career movers.",
    amountAed: 300,
    duration: "30 minutes",
    category: "specialist",
    features: [
      "UAE job-market orientation",
      "CV positioning review",
      "Outreach strategy",
    ],
    forWho: "Career movers getting oriented to the UAE job market.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_DUBAI_JOB_SEARCH",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_DUBAI_JOB_SEARCH",
  },
  {
    slug: "document-review",
    name: "Document Review (Async)",
    subtitle: "Written review — no call needed",
    description:
      "A written review of one document: a letter, a contract, or a termination notice. Delivered by email, no call required.",
    amountAed: 275,
    duration: "Async — emailed back",
    category: "specialist",
    features: [
      "Written review of one document",
      "Letter, contract, or notice",
      "No call required",
    ],
    forWho: "Anyone who needs a fast expert read on a single document.",
    needsScheduling: false,
    stripePriceEnv: "STRIPE_PRICE_DOCUMENT_REVIEW",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_DOCUMENT_REVIEW",
  },
  {
    slug: "interview-prep-package",
    name: "Interview Prep Package (3 Sessions)",
    subtitle: "For multiple interview processes",
    description:
      "Three interview-prep sessions — JD analysis and a mock interview each time — for candidates running more than one process at once. Saves AED 450 against booking them separately.",
    amountAed: 2400,
    duration: "3 × 60-minute sessions",
    category: "specialist",
    features: [
      "3 JD analyses + mock interviews",
      "Insider-informed prep tailored to each role",
      "Pointers after every session",
      "Saves AED 450 against three separate sessions",
    ],
    forWho:
      "Candidates running several interview processes at once who want repeated, insider-informed reps.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_INTERVIEW_PREP_PACKAGE",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_INTERVIEW_PREP_PACKAGE",
  },

  // ── Monthly retainers ───────────────────────────────────────────────────
  {
    slug: "essential-retainer",
    name: "Essential Retainer",
    subtitle: "Ongoing monthly support",
    description:
      "Two 60-minute sessions a month plus async WhatsApp support, for clients navigating one or two active situations.",
    amountAed: 2200,
    duration: "Monthly",
    priceNote: "/mo",
    category: "retainer",
    features: [
      "2 × 60-minute sessions per month",
      "Async WhatsApp support",
      "Ongoing situation monitoring",
    ],
    forWho: "Clients navigating one or two active workplace situations.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_ESSENTIAL_RETAINER",
    mode: "subscription",
    interval: "month",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_ESSENTIAL_RETAINER",
  },
  {
    slug: "career-transition-retainer",
    name: "Career Transition Retainer",
    subtitle: "Exits, PIPs & job searches",
    description:
      "Three 60-minute sessions a month, async WhatsApp support, and document reviews — the most common retainer profile.",
    amountAed: 3300,
    duration: "Monthly",
    priceNote: "/mo",
    category: "retainer",
    features: [
      "3 × 60-minute sessions per month",
      "Async WhatsApp support",
      "Document reviews included",
    ],
    forWho: "Exits, PIPs, and job searches — the most common retainer.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_CAREER_TRANSITION_RETAINER",
    mode: "subscription",
    interval: "month",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_CAREER_TRANSITION_RETAINER",
  },
  {
    slug: "executive-retainer",
    name: "Executive Retainer",
    subtitle: "Highest-touch advisory",
    description:
      "Four 60-minute sessions a month, priority async access, and full document reviews for senior, high-complexity situations.",
    amountAed: 5140,
    duration: "Monthly",
    priceNote: "/mo",
    category: "retainer",
    features: [
      "4 × 60-minute sessions per month",
      "Priority async access",
      "Full document reviews",
    ],
    forWho: "Senior professionals in high-complexity situations.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_EXECUTIVE_RETAINER",
    mode: "subscription",
    interval: "month",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_EXECUTIVE_RETAINER",
  },
];

const withUsdReference = (seed: ServiceProductSeed): ServiceProduct => ({
  ...seed,
  amount: usdCentsFromAed(seed.amountAed),
});

/**
 * Everything currently for sale — exactly the 10 services on `/services`. This is the list the
 * public UI maps over (home page strips, `/services` and its JSON-LD, `llms.txt`, internal links,
 * the Sanity seed), so nothing internal or unlisted belongs here. There is no live test product:
 * the owner does not want one in production (2026-09-14).
 */
export const serviceProducts: ServiceProduct[] = seeds.map(withUsdReference);

/**
 * Products withdrawn in the Sept 2026 restructure.
 *
 * NEVER delete these. `orders.product_slug` stores the slug as it was at purchase time, and
 * `getServiceProduct()` is called on historical orders by `app/booking/schedule/page.tsx`,
 * `app/api/webhooks/stripe/route.ts` and `app/api/webhooks/cal/route.ts`. Dropping an entry
 * would leave every past order of it with no name, no price and no scheduling link.
 *
 * They are excluded from `serviceProducts`, so nothing renders them for sale.
 */
export const retiredServiceProducts: ServiceProduct[] = [
  {
    slug: "individual-advisory",
    name: "Individual Advisory Session",
    subtitle: "60-minute expert HR advisory",
    description: "Superseded by Full Support.",
    amount: usdCentsFromAed(1200),
    amountAed: 1200,
    duration: "60 minutes",
    category: "core",
    features: [],
    forWho: "",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_INDIVIDUAL_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_FULL_SUPPORT",
  },
  {
    slug: "extended-advisory",
    name: "Extended Advisory Session",
    subtitle: "90-minute deep dive",
    description: "Discontinued.",
    amount: usdCentsFromAed(1800),
    amountAed: 1800,
    duration: "90 minutes",
    category: "core",
    features: [],
    forWho: "",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_EXTENDED_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_FULL_SUPPORT",
  },
  {
    slug: "uae-relocation-qa",
    name: "UAE Relocation & Employment Rights Q&A",
    subtitle: "30-minute rights overview",
    description: "Withdrawn.",
    amount: usdCentsFromAed(300),
    amountAed: 300,
    duration: "30 minutes",
    category: "specialist",
    features: [],
    forWho: "",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_UAE_RELOCATION_QA",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_DUBAI_JOB_SEARCH",
  },
  {
    slug: "lunch-and-learn",
    name: "Lunch & Learn / Workshop (SME)",
    subtitle: "90-minute team workshop",
    description: "Withdrawn.",
    amount: usdCentsFromAed(2750),
    amountAed: 2750,
    duration: "90 minutes · up to 20 pax",
    category: "specialist",
    features: [],
    forWho: "",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_LUNCH_AND_LEARN",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_FULL_SUPPORT",
  },
  {
    slug: "hr-compliance-advisory",
    name: "HR Compliance Advisory (ad hoc)",
    subtitle: "Employer-side guidance",
    description: "Withdrawn.",
    amount: usdCentsFromAed(1100),
    amountAed: 1100,
    duration: "Per hour",
    priceNote: "/hr",
    category: "specialist",
    features: [],
    forWho: "",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_HR_COMPLIANCE_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_FULL_SUPPORT",
  },
  {
    // Internal pipeline-test product, withdrawn from production 2026-09-14 at the owner's request.
    // Archived rather than deleted because live `orders` rows store this slug (earlier test
    // purchases). Not sellable, never listed, no scheduling; its Cal.com event type is deleted.
    slug: "test-service",
    name: "Test Service (internal, withdrawn)",
    subtitle: "Internal pipeline test",
    description: "Withdrawn internal test product.",
    amount: usdCentsFromAed(5),
    amountAed: 5,
    duration: "15 minutes",
    category: "specialist",
    features: [],
    forWho: "",
    needsScheduling: false,
    stripePriceEnv: "STRIPE_PRICE_TEST_SERVICE",
    mode: "payment",
    // Its own (unset) env, NOT a live product's: this must never resolve to a real, bookable
    // calendar. `/booking/schedule` also refuses products that don't need scheduling.
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_TEST_SERVICE",
  },
];

/**
 * Retired slug → the live product that replaced it.
 *
 * Used for inbound links that still carry an old `?service=` value: a slug listed here
 * resolves to its replacement for *selling* (`getSellableServiceProduct`).
 *
 * `getServiceProduct` checks `retiredServiceProducts` BEFORE this map, so every key below —
 * all of which are also archive entries — reads back as the product that was actually sold.
 * See the note on `getServiceProduct` and ADR-0001 Decision A.
 */
export const LEGACY_SLUG_ALIASES: Record<string, string> = {
  "individual-advisory": "full-support",
  "extended-advisory": "full-support",
  "uae-relocation-qa": "dubai-job-search",
};

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  core: "Core advisory",
  specialist: "Specialist sessions",
  retainer: "Monthly retainers",
};

/** Order the core ladder is displayed in, cheapest first. */
export const coreTierOrder: CoreTier[] = ["good", "better", "best"];

/**
 * The comparison matrix for the core ladder. Kept here rather than in the component so the
 * table and the per-product `features` lists cannot disagree.
 *
 * `true` renders a tick, `false` a dash, a string renders verbatim.
 */
export type CoreComparisonRow = {
  label: string;
  values: Record<CoreTier, string | boolean>;
};

export const coreComparison: CoreComparisonRow[] = [
  {
    label: "Call length",
    values: { good: "30 min", better: "60 min", best: "60 min" },
  },
  {
    label: "Written summary of key next steps",
    values: { good: "Short", better: true, best: true },
  },
  {
    label:
      "Full written action plan — scripts, questions to ask, documents to prepare, sequenced moves",
    values: { good: false, better: true, best: true },
  },
  {
    label: "Async follow-up within 7 days",
    values: { good: false, better: true, best: true },
  },
  {
    label: "Done-for-you documents and email drafts",
    values: { good: false, better: false, best: true },
  },
  {
    label: "14 days async WhatsApp access",
    values: { good: false, better: false, best: true },
  },
];

/** Format a whole-dirham amount, e.g. 1200 -> "AED 1,200". */
export function formatAed(amountAed: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amountAed);
}

/** Format USD *cents*, e.g. 32700 -> "$327". Note the unit differs from `formatAed`. */
export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

/**
 * Resolve a slug to a product: live catalogue → retired archive → legacy alias.
 *
 * ADR-0001 Decision A: the archive is checked *before* the alias map, and the order is
 * load-bearing. All three `LEGACY_SLUG_ALIASES` keys are also `retiredServiceProducts`
 * entries, so consulting the alias first would make every historical order for a retired
 * slug report as its live replacement — an `extended-advisory` order (1800 AED / 90 min)
 * reading back as `full-support` (1200 AED / 60 min) in receipts, on the schedule page and
 * in the review-request email. That is rewriting money-adjacent history, which the ADR
 * rejected. Archive-first keeps a slug that was actually charged reading exactly as it was
 * sold; the alias remains reachable only for slugs with no archive entry.
 *
 * This is a *read* resolver. Never use it to price or start a purchase — a retired product
 * resolves here but must not be sellable. Use `getSellableServiceProduct()` for that.
 */
export function getServiceProduct(slug: string | null | undefined) {
  if (!slug) return undefined;
  const live = serviceProducts.find((product) => product.slug === slug);
  if (live) return live;

  const retired = retiredServiceProducts.find((product) => product.slug === slug);
  if (retired) return retired;

  const aliased = LEGACY_SLUG_ALIASES[slug];
  if (aliased) {
    return serviceProducts.find((product) => product.slug === aliased);
  }

  return undefined;
}

/** Resolve a slug for *selling*: live catalogue or its replacement, never a retired product. */
export function getSellableServiceProduct(slug: string | null | undefined) {
  if (!slug) return undefined;
  const resolved = LEGACY_SLUG_ALIASES[slug] ?? slug;
  return serviceProducts.find((product) => product.slug === resolved);
}

export function getServicesByCategory(category: ServiceCategory) {
  return serviceProducts.filter((product) => product.category === category);
}

/** The core ladder in display order. */
export function getCoreLadder() {
  return coreTierOrder
    .map((tier) => serviceProducts.find((p) => p.category === "core" && p.tier === tier))
    .filter((p): p is ServiceProduct => Boolean(p));
}

export function getStripePriceId(product: ServiceProduct) {
  return process.env[product.stripePriceEnv];
}

/**
 * The Cal.com account every event type hangs off.
 *
 * `talk-humanly` (hyphenated) is the real account username — verified against Cal.com's v2 API
 * with the account's own key; `talkhumanly` returns `User with username talkhumanly not found`.
 */
export const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME || "talk-humanly";

/** Warn once per env var, not once per render — this is called on every paid schedule page. */
const warnedMissingCalLinks = new Set<string>();

/**
 * Cal.com link for a product, as `username/event-slug`.
 *
 * Falls back to `<username>/<product slug>` rather than to a single hard-coded event, so a
 * missing env var degrades to the right event type instead of silently booking everyone
 * into one calendar — *provided that event type actually exists in Cal.com*.
 *
 * ⚠️ The fallback is a guess, not a guarantee. ADR-0001's post-implementation verification
 * checked the live Cal.com API with this account's own key: under `talk-humanly`,
 * `the-session`, `session-plus-plan` and `full-support` do **not** exist as event types. For
 * those three the fallback resolves to a 404 link — the availability preview is permanently
 * empty, and a customer who has ALREADY PAID lands on an embed that cannot be booked. So the
 * fallback firing is a production defect, not a benign default, and it says so in the logs.
 * Creating the missing event types and setting the four `NEXT_PUBLIC_CAL_LINK_*` vars is the
 * owner's action; this warning is how anyone finds out it is still outstanding.
 *
 * Server-side only: both call sites (`app/booking/schedule/page.tsx`, `lib/cal.ts`) are server
 * code, and `process.env[product.calLinkEnv]` is a *dynamic* key that Next cannot statically
 * inline into a client bundle anyway — so a client-side call would always take the fallback.
 * The `typeof window` guard keeps the warning out of a visitor's console if that ever changes.
 */
export function getCalLink(product: ServiceProduct) {
  const configured = process.env[product.calLinkEnv];
  if (configured) return configured;

  if (typeof window === "undefined" && !warnedMissingCalLinks.has(product.calLinkEnv)) {
    warnedMissingCalLinks.add(product.calLinkEnv);
    console.warn(
      `[products] ${product.calLinkEnv} is unset — falling back to "${CAL_USERNAME}/${product.slug}" ` +
        `for "${product.name}". Verify that Cal.com event type exists; an unset link on a scheduled ` +
        `service sends paying customers to a booking page that may 404.`,
    );
  }

  return `${CAL_USERNAME}/${product.slug}`;
}
