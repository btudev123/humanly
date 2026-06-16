import { absoluteUrl } from "@/lib/site";

export type Resource = {
  slug: string;
  title: string;
  category: string;
  /** Pricing tier 1-4 (4 = recurring membership). */
  tier: 1 | 2 | 3 | 4;
  minutes: number;
  format: string;
  audience: string;
  summary: string;
  pdf: string;
  gated: boolean;
  /** Amount in USD cents. */
  amount?: number;
  /** Set for recurring memberships. */
  interval?: "month";
  /** Recurring access product with no single download. */
  membership?: boolean;
  updatedAt: string;
  author: string;
  reviewer: string;
  keywords: string[];
};

// Placeholder PDFs reuse the existing seeded files until real content is uploaded
// via the dashboard (Vercel Blob). Swap `pdf` to a blob URL when content is ready.
const PLACEHOLDER_PDF = "/resources/uae-labour-contract-review.pdf";

const DEFAULTS = {
  gated: true as const,
  pdf: PLACEHOLDER_PDF,
  updatedAt: "2026-06-01",
  author: "Humanly HR Advisory",
  reviewer: "Karma Harb",
};

export const resources: Resource[] = [
  // ── Tier 1 · Entry products ($15–$30) ───────────────────────────────────
  {
    ...DEFAULTS,
    slug: "am-i-being-managed-out-diagnostic",
    title: "“Am I Being Managed Out?” Diagnostic",
    category: "Diagnostics & Quizzes",
    tier: 1,
    minutes: 10,
    format: "Scored quiz + PDF results report",
    audience: "Global employees",
    amount: 1500,
    summary:
      "A scored self-assessment with a PDF results report that tells you, plainly, whether the signs point to a managed exit.",
    keywords: ["managed out", "constructive dismissal", "performance signs", "exit risk"],
  },
  {
    ...DEFAULTS,
    slug: "uae-employee-rights-cheat-sheet",
    title: "UAE Employee Rights Cheat Sheet",
    category: "Regional Guides",
    tier: 1,
    minutes: 8,
    format: "PDF download",
    audience: "UAE-based employees",
    amount: 1500,
    summary:
      "A low-friction, one-page reference to the UAE employee rights every professional should know.",
    keywords: ["UAE employee rights", "labour law", "cheat sheet"],
  },
  {
    ...DEFAULTS,
    slug: "workplace-documentation-starter-kit",
    title: "Workplace Documentation Starter Kit",
    category: "Templates & Kits",
    tier: 1,
    minutes: 12,
    format: "3-template bundle (PDF)",
    audience: "Global employees",
    amount: 2500,
    summary:
      "A three-template bundle to start documenting workplace issues properly — before you need the record.",
    keywords: ["workplace documentation", "evidence", "templates", "paper trail"],
  },

  // ── Tier 2 · Core products ($50–$100) ───────────────────────────────────
  {
    ...DEFAULTS,
    slug: "pip-survival-kit",
    title: "PIP Survival Kit",
    category: "Templates & Kits",
    tier: 2,
    minutes: 25,
    format: "Templates + scripts + recorded walkthrough",
    audience: "Global employees",
    amount: 6500,
    summary:
      "Templates, scripts, and a recorded walkthrough for responding to a Performance Improvement Plan without panicking.",
    keywords: ["PIP", "performance improvement plan", "survival kit", "scripts"],
  },
  {
    ...DEFAULTS,
    slug: "exit-negotiation-toolkit",
    title: "Exit Negotiation Toolkit",
    category: "Templates & Kits",
    tier: 2,
    minutes: 28,
    format: "Letter templates, severance script, talking points",
    audience: "Global employees",
    amount: 9000,
    summary:
      "Letter templates, a severance script, and talking points to negotiate your exit from a position of calm.",
    keywords: ["exit negotiation", "severance", "settlement", "talking points"],
  },
  {
    ...DEFAULTS,
    slug: "grievance-escalation-pack",
    title: "Grievance & Escalation Pack",
    category: "Templates & Kits",
    tier: 2,
    minutes: 22,
    format: "Formal letter templates + step-by-step guide",
    audience: "Global employees",
    amount: 7500,
    summary:
      "Formal letter templates and a step-by-step guide for raising and escalating a grievance the right way.",
    keywords: ["grievance", "escalation", "formal complaint", "HR escalation"],
  },
  {
    ...DEFAULTS,
    slug: "what-hr-wont-tell-you-mini-course",
    title: "“What HR Won’t Tell You” Mini Course",
    category: "Courses",
    tier: 2,
    minutes: 60,
    format: "4–5 recorded modules (evergreen)",
    audience: "Global employees",
    amount: 10000,
    summary:
      "Four to five recorded modules on how HR actually works — and how to protect yourself accordingly.",
    keywords: ["what HR won't tell you", "mini course", "employee protection"],
  },

  // ── Tier 3 · Premium products ($150–$275) ───────────────────────────────
  {
    ...DEFAULTS,
    slug: "uae-termination-redundancy-masterguide",
    title: "UAE Termination & Redundancy Masterguide",
    category: "Regional Guides",
    tier: 3,
    minutes: 40,
    format: "Deep-dive PDF: legal framework, scripts, checklists",
    audience: "UAE employees + expats",
    amount: 15000,
    summary:
      "A deep-dive guide to UAE termination and redundancy — the legal framework, scripts, and checklists in one place.",
    keywords: ["UAE termination", "redundancy", "end of service", "masterguide"],
  },
  {
    ...DEFAULTS,
    slug: "career-crisis-playbook",
    title: "Career Crisis Playbook",
    category: "Courses",
    tier: 3,
    minutes: 45,
    format: "End-to-end guide: first warning sign to resolution",
    audience: "Global employees",
    amount: 17500,
    summary:
      "An end-to-end playbook that takes you from the first warning sign all the way to exit or resolution.",
    keywords: ["career crisis", "playbook", "workplace strategy", "resolution"],
  },
  {
    ...DEFAULTS,
    slug: "full-toolkit-bundle",
    title: "The Full Toolkit (Bundle — all Tier 2)",
    category: "Templates & Kits",
    tier: 3,
    minutes: 90,
    format: "All Tier 2 products bundled",
    audience: "Global employees",
    amount: 20000,
    summary:
      "Every Tier 2 toolkit bundled together at a discount versus buying each one individually.",
    keywords: ["bundle", "full toolkit", "PIP", "exit", "grievance"],
  },
  {
    ...DEFAULTS,
    slug: "gcc-relocation-employment-rights-guide",
    title: "GCC Relocation & Employment Rights Guide",
    category: "Regional Guides",
    tier: 3,
    minutes: 38,
    format: "PDF guide: KSA, UAE, Qatar labour-law essentials",
    audience: "Expats relocating to the GCC",
    amount: 15000,
    summary:
      "Labour-law essentials for KSA, UAE, and Qatar in one guide — the relocation resource no competitor covers well.",
    keywords: ["GCC relocation", "KSA", "Qatar", "UAE", "employment rights"],
  },

  // ── Tier 4 · Recurring memberships ──────────────────────────────────────
  {
    ...DEFAULTS,
    slug: "humanly-insider-member-access",
    title: "Humanly Insider Member Access",
    category: "Memberships",
    tier: 4,
    minutes: 0,
    format: "Monthly: 1 template, 1 legal update, 1 situational script",
    audience: "Global employees",
    amount: 1900,
    interval: "month",
    membership: true,
    pdf: "",
    summary:
      "Every month: one new template, one legal update, and one situational script delivered to members.",
    keywords: ["membership", "insider", "monthly templates", "legal updates"],
  },
  {
    ...DEFAULTS,
    slug: "private-community-access",
    title: "Private Community Access",
    category: "Memberships",
    tier: 4,
    minutes: 0,
    format: "WhatsApp / forum peer-support group",
    audience: "UAE + GCC focus",
    amount: 2900,
    interval: "month",
    membership: true,
    pdf: "",
    summary:
      "A private WhatsApp and forum peer-support group for UAE and GCC professionals navigating workplace challenges.",
    keywords: ["community", "peer support", "WhatsApp group", "membership"],
  },
];

export const resourceCategories = ["All", ...Array.from(new Set(resources.map((item) => item.category)))];

export function getResource(slug: string | null | undefined) {
  return resources.find((resource) => resource.slug === slug);
}

export function getResourceUrl(resource: Resource) {
  return absoluteUrl(`/resources/${resource.slug}`);
}
