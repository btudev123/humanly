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

const DEFAULTS = {
  gated: true as const,
  pdf: "",
  updatedAt: "2026-06-01",
  author: "Humanly HR Advisory",
  reviewer: "Karma Harb",
};

export const resources: Resource[] = [
  {
    ...DEFAULTS,
    slug: "uae-labour-contract-review",
    title: "UAE Labour Contract Review Guide",
    category: "Regional Guides",
    tier: 1,
    minutes: 10,
    format: "PDF download",
    audience: "UAE-based employees & new arrivals",
    amount: 2500,
    summary:
      "A practical guide to reviewing your UAE employment contract — what to look for, what to push back on, and what every clause really means.",
    keywords: ["UAE labour contract", "employment contract", "contract review", "UAE labour law"],
  },
  {
    ...DEFAULTS,
    slug: "workplace-harassment-guide",
    title: "Workplace Harassment Response Guide",
    category: "Templates & Kits",
    tier: 1,
    minutes: 12,
    format: "PDF download",
    audience: "Global employees",
    amount: 2900,
    summary:
      "A step-by-step guide for responding to workplace harassment — how to document, escalate, and protect yourself before taking formal action.",
    keywords: ["workplace harassment", "hostile work environment", "documentation", "escalation"],
  },
  {
    ...DEFAULTS,
    slug: "pip-response-strategy",
    title: "PIP Response Strategy Guide",
    category: "Templates & Kits",
    tier: 2,
    minutes: 20,
    format: "Templates + scripts (PDF)",
    audience: "Global employees",
    amount: 6500,
    summary:
      "Templates and scripts for responding to a Performance Improvement Plan strategically — without panicking and without burning bridges.",
    keywords: ["PIP", "performance improvement plan", "response strategy", "scripts"],
  },
  {
    ...DEFAULTS,
    slug: "redundancy-severance-prep",
    title: "Redundancy & Severance Preparation Kit",
    category: "Templates & Kits",
    tier: 2,
    minutes: 22,
    format: "Templates + checklist (PDF)",
    audience: "Global employees",
    amount: 6500,
    summary:
      "Everything you need to prepare for a redundancy: entitlement checklist, severance negotiation scripts, and a timeline of actions to take.",
    keywords: ["redundancy", "severance", "layoff", "preparation", "entitlements"],
  },
  {
    ...DEFAULTS,
    slug: "manager-conflict-script",
    title: "Manager Conflict Script Pack",
    category: "Templates & Kits",
    tier: 2,
    minutes: 15,
    format: "Scripts + talking points (PDF)",
    audience: "Global employees",
    amount: 4500,
    summary:
      "Word-for-word scripts and talking points for navigating difficult conversations with a manager — from pushback to formal escalation.",
    keywords: ["manager conflict", "difficult conversation", "scripts", "talking points", "escalation"],
  },
];

export const resourceCategories = ["All", ...Array.from(new Set(resources.map((item) => item.category)))];

export function getResource(slug: string | null | undefined) {
  return resources.find((resource) => resource.slug === slug);
}

export function getResourceUrl(resource: Resource) {
  return absoluteUrl(`/resources/${resource.slug}`);
}
