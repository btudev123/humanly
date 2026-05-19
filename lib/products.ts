export type ProductKind = "consultation" | "resource";

export type ServiceProduct = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  amount: number;
  currency: "aed";
  duration: string;
  stripePriceEnv: string;
  mode: "payment" | "subscription";
  interval?: "month";
  calLinkEnv: string;
  featured?: boolean;
};

export const serviceProducts: ServiceProduct[] = [
  {
    slug: "triage",
    name: "The Triage",
    subtitle: "60-minute advisory session",
    description: "A private consultation for verbal guidance and clarity on immediate next steps.",
    amount: 55000,
    currency: "aed",
    duration: "60 minutes",
    stripePriceEnv: "STRIPE_PRICE_TRIAGE",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_TRIAGE",
  },
  {
    slug: "strategy",
    name: "The Strategy",
    subtitle: "Triage + written follow-up report",
    description:
      "A structured document with situation summary, risk assessment, recommended actions, and suggested scripts.",
    amount: 95000,
    currency: "aed",
    duration: "60 minutes + written report",
    stripePriceEnv: "STRIPE_PRICE_STRATEGY",
    mode: "payment",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_STRATEGY",
    featured: true,
  },
  {
    slug: "retainer",
    name: "The Retainer",
    subtitle: "Ongoing monthly support",
    description:
      "Two strategy sessions per month, message review, priority access, and ongoing situation monitoring.",
    amount: 180000,
    currency: "aed",
    duration: "Monthly support",
    stripePriceEnv: "STRIPE_PRICE_RETAINER",
    mode: "subscription",
    interval: "month",
    calLinkEnv: "NEXT_PUBLIC_CAL_LINK_RETAINER",
  },
];

export function formatAed(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function getServiceProduct(slug: string | null | undefined) {
  return serviceProducts.find((product) => product.slug === slug);
}

export function getStripePriceId(product: ServiceProduct) {
  return process.env[product.stripePriceEnv];
}

export function getCalLink(product: ServiceProduct) {
  return process.env[product.calLinkEnv] || process.env.NEXT_PUBLIC_CAL_LINK_TRIAGE || "talkhumanly/triage";
}
