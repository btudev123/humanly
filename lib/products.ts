export type ProductKind = "consultation" | "resource";

export type ServiceCategory = "session" | "retainer" | "corporate";

export type ServiceProduct = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  /** Amount in minor units (USD cents) — this is what Stripe charges. */
  amount: number;
  currency: "usd";
  /** Display price in AED (whole dirhams). Shown as the primary price; USD remains the charge currency. */
  amountAed: number;
  duration: string;
  /** Optional price suffix, e.g. "/mo" or "/hr". */
  priceNote?: string;
  category: ServiceCategory;
  features: string[];
  forWho: string;
  /** Whether a Cal.com scheduling step follows payment. Async products (e.g. document review) deliver by email instead. */
  needsScheduling: boolean;
  stripePriceEnv: string;
  mode: "payment" | "subscription";
  interval?: "month";
  calLinkEnv: string;
  featured?: boolean;
};

export const serviceProducts: ServiceProduct[] = [
  // ── One-off advisory sessions ───────────────────────────────────────────
  {
    slug: "individual-advisory",
    name: "Individual Advisory Session",
    subtitle: "60-minute expert HR advisory",
    description:
      "A full advisory session on your specific situation — workplace issues, PIPs, exits, or rights — plus a written follow-up summary.",
    amount: 32700,
    currency: "usd",
    amountAed: 1200,
    duration: "60 minutes",
    category: "session",
    features: [
      "Confidential 60-minute session",
      "Advice on your exact situation",
      "Written follow-up summary",
      "Recommended next steps",
    ],
    forWho:
      "Professionals facing a specific situation who need expert clarity and a documented plan fast.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_INDIVIDUAL_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_INDIVIDUAL_ADVISORY",
    featured: true,
  },
  {
    slug: "dubai-job-search",
    name: "Dubai Job Search Advisory Call",
    subtitle: "30-minute job-market orientation",
    description:
      "UAE job-market orientation, CV positioning, and outreach strategy — the entry point for career movers.",
    amount: 8200,
    currency: "usd",
    amountAed: 300,
    duration: "30 minutes",
    category: "session",
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
    slug: "uae-relocation-qa",
    name: "UAE Relocation & Employment Rights Q&A",
    subtitle: "30-minute rights overview",
    description:
      "A rights overview plus your top five questions answered for new arrivals to the UAE.",
    amount: 8200,
    currency: "usd",
    amountAed: 300,
    duration: "30 minutes",
    category: "session",
    features: [
      "Employment rights overview",
      "Your top 5 questions answered",
      "Tailored for new UAE arrivals",
    ],
    forWho: "Expats new to the UAE who want fast answers on their rights.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_UAE_RELOCATION_QA",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_UAE_RELOCATION_QA",
  },
  {
    slug: "extended-advisory",
    name: "Extended Advisory Session",
    subtitle: "90-minute deep dive",
    description:
      "An extended session for complex or multi-issue situations, with a written action-plan document.",
    amount: 49000,
    currency: "usd",
    amountAed: 1800,
    duration: "90 minutes",
    category: "session",
    features: [
      "Confidential 90-minute session",
      "Multi-issue situation mapping",
      "Written action-plan document",
    ],
    forWho: "Situations too layered for a standard session.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_EXTENDED_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_EXTENDED_ADVISORY",
  },
  {
    slug: "document-review",
    name: "Document Review (Async)",
    subtitle: "Written review — no call needed",
    description:
      "A written review of one document: a letter, contract, termination notice, or similar. Delivered by email.",
    amount: 7500,
    currency: "usd",
    amountAed: 275,
    duration: "Async — emailed back",
    category: "session",
    features: [
      "Written review of one document",
      "Letter, contract, or notice",
      "No call required",
    ],
    forWho: "Anyone who needs a fast expert read on a single document.",
    needsScheduling: false,
    stripePriceEnv: "STRIPE_PRICE_DOCUMENT_REVIEW",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_INDIVIDUAL_ADVISORY",
  },

  // ── Retainers (monthly) ─────────────────────────────────────────────────
  {
    slug: "essential-retainer",
    name: "Essential Retainer",
    subtitle: "Ongoing monthly support",
    description:
      "Two 60-minute sessions per month plus async WhatsApp support, for clients navigating one or two active situations.",
    amount: 60000,
    currency: "usd",
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
      "Three 60-minute sessions per month, async WhatsApp support, and document reviews — the most common retainer profile.",
    amount: 90000,
    currency: "usd",
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
      "Four 60-minute sessions per month, priority async access, and full document reviews for senior, high-complexity situations.",
    amount: 140000,
    currency: "usd",
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

  // ── Corporate & SME add-ons ─────────────────────────────────────────────
  {
    slug: "lunch-and-learn",
    name: "Lunch & Learn / Workshop (SME)",
    subtitle: "90-minute team workshop",
    description:
      "UAE labour-law essentials for SME teams of up to 20 people, delivered as a practical 90-minute workshop.",
    amount: 75000,
    currency: "usd",
    amountAed: 2750,
    duration: "90 minutes · up to 20 pax",
    category: "corporate",
    features: [
      "UAE labour-law essentials",
      "Up to 20 participants",
      "Practical, team-focused session",
    ],
    forWho: "SME teams who want their people informed on UAE labour law.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_LUNCH_AND_LEARN",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_LUNCH_AND_LEARN",
  },
  {
    slug: "hr-compliance-advisory",
    name: "HR Compliance Advisory (ad hoc)",
    subtitle: "Employer-side guidance",
    description:
      "Per-hour employer-side guidance across freezone and mainland UAE — kept distinct from employee advisory.",
    amount: 30000,
    currency: "usd",
    amountAed: 1100,
    duration: "Per hour",
    priceNote: "/hr",
    category: "corporate",
    features: [
      "Employer-side compliance guidance",
      "Freezone and mainland UAE",
      "Billed per hour",
    ],
    forWho: "Employers needing ad-hoc HR compliance guidance.",
    needsScheduling: true,
    stripePriceEnv: "STRIPE_PRICE_HR_COMPLIANCE_ADVISORY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_HR_COMPLIANCE_ADVISORY",
  },
];

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  session: "One-off advisory sessions",
  retainer: "Monthly retainers",
  corporate: "Corporate & SME",
};

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

/** Format a whole-dirham amount, e.g. 1200 -> "AED 1,200". */
export function formatAed(amountAed: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amountAed);
}

/** Reference rate used to show an AED display price for USD-charged items (e.g. resources). */
export const AED_PER_USD = 3.6725;

/** Convert USD cents to a display AED amount, rounded to the nearest 5 dirhams. */
export function aedFromUsdCents(amountUsdCents: number) {
  const aed = (amountUsdCents / 100) * AED_PER_USD;
  return Math.round(aed / 5) * 5;
}

export function getServiceProduct(slug: string | null | undefined) {
  return serviceProducts.find((product) => product.slug === slug);
}

export function getServicesByCategory(category: ServiceCategory) {
  return serviceProducts.filter((product) => product.category === category);
}

export function getStripePriceId(product: ServiceProduct) {
  return process.env[product.stripePriceEnv];
}

export function getCalLink(product: ServiceProduct) {
  return (
    process.env[product.calLinkEnv] ||
    process.env.NEXT_PUBLIC_CAL_LINK_INDIVIDUAL_ADVISORY ||
    "talk-humanly/individual-advisory"
  );
}
