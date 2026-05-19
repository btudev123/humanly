import { absoluteUrl } from "@/lib/site";

export type Resource = {
  slug: string;
  title: string;
  category: string;
  minutes: number;
  summary: string;
  pdf: string;
  gated: boolean;
  amount?: number;
  updatedAt: string;
  author: string;
  reviewer: string;
  keywords: string[];
};

export const resources: Resource[] = [
  {
    slug: "uae-labour-contract-review-checklist",
    title: "UAE Labour Contract Review Checklist",
    category: "Know Your Rights",
    minutes: 8,
    summary:
      "A plain-English checklist for reviewing clauses, probation terms, notice periods, and end-of-service questions.",
    pdf: "/resources/uae-labour-contract-review.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["UAE labour contract", "probation", "notice period", "gratuity"],
  },
  {
    slug: "workplace-harassment-guide",
    title: "What Counts as Workplace Harassment?",
    category: "Toxic Workplaces",
    minutes: 10,
    summary:
      "How to document patterns, preserve evidence, and decide whether to escalate internally or externally.",
    pdf: "/resources/workplace-harassment-guide.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["workplace harassment", "toxic manager", "documentation"],
  },
  {
    slug: "pip-response-strategy",
    title: "PIP Response Strategy",
    category: "Performance Issues",
    minutes: 12,
    summary:
      "A practical guide to responding to performance plans without sounding defensive or conceding too much.",
    pdf: "/resources/pip-response-strategy.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["PIP response", "performance improvement plan", "employee rights"],
  },
  {
    slug: "redundancy-severance-preparation",
    title: "Redundancy and Severance Preparation",
    category: "Resignations",
    minutes: 9,
    summary:
      "What to ask, what to avoid signing too quickly, and how to negotiate from a calm factual record.",
    pdf: "/resources/redundancy-severance-prep.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["redundancy", "severance", "termination", "UAE"],
  },
  {
    slug: "manager-conflict-conversation-script",
    title: "Manager Conflict Conversation Script",
    category: "Toxic Workplaces",
    minutes: 6,
    summary:
      "A structured script for raising concerns while keeping the conversation professional and documented.",
    pdf: "/resources/manager-conflict-script.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["manager conflict", "workplace script", "HR escalation"],
  },
  {
    slug: "confidentiality-before-booking",
    title: "Confidentiality Before You Book",
    category: "Know Your Rights",
    minutes: 5,
    summary:
      "What Humanly collects, what it does not collect, and how your information is handled during intake.",
    pdf: "/resources/confidentiality-before-booking.pdf",
    gated: false,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["confidential HR advice", "privacy", "booking"],
  },
  {
    slug: "expat-rights-checklist-gcc-labor-law",
    title: "Expat Rights Checklist — GCC Labor Law",
    category: "Expat Labor Law",
    minutes: 14,
    summary:
      "Key labour law protections every expat professional should know across UAE, Saudi Arabia, and Qatar.",
    pdf: "/resources/uae-labour-contract-review.pdf",
    gated: true,
    amount: 7900,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["GCC labour law", "expat employee rights", "UAE employee guide"],
  },
  {
    slug: "what-to-do-when-you-receive-a-pip-in-the-uae",
    title: "What to Do When You Receive a PIP in the UAE",
    category: "Performance Issues",
    minutes: 11,
    summary:
      "Step-by-step framework: what a PIP means practically, how to respond, and when to seek help.",
    pdf: "/resources/pip-response-strategy.pdf",
    gated: true,
    amount: 7900,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["PIP UAE", "performance warning", "employee response"],
  },
  {
    slug: "resign-or-stay-decision-framework",
    title: "Resign or Stay? A Decision Framework",
    category: "Resignations",
    minutes: 10,
    summary:
      "A practical decision tool to weigh your options when you are unsure whether to leave or fight.",
    pdf: "/resources/redundancy-severance-prep.pdf",
    gated: true,
    amount: 7900,
    updatedAt: "2026-05-01",
    author: "Humanly HR Advisory",
    reviewer: "Karma Harb",
    keywords: ["resignation decision", "stay or leave job", "workplace conflict"],
  },
];

export const resourceCategories = ["All", ...Array.from(new Set(resources.map((item) => item.category)))];

export function getResource(slug: string | null | undefined) {
  return resources.find((resource) => resource.slug === slug);
}

export function getResourceUrl(resource: Resource) {
  return absoluteUrl(`/resources/${resource.slug}`);
}
