export const siteConfig = {
  name: "Humanly",
  legalName: "Humanly HR Advisory",
  // Canonical host is `www` — the apex 308-redirects to it. Never emit the apex in
  // canonicals, sitemaps, JSON-LD or webhook URLs (redirects aren't followed by Stripe/Cal).
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://www.talkhumanly.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@talkhumanly.com",
  founder: "Karma Harb",
  founderRole: "Founder & Principal HR Advisor",
  /**
   * Canonical public profile for the founder. Tracking params from the mobile share
   * sheet are deliberately stripped — `sameAs` and author links must be the clean,
   * canonical profile URL for entity resolution to work.
   */
  founderLinkedIn: "https://www.linkedin.com/in/karma-harb-m-hrer-9865332a",
  tagline: "Your HR manages the workplace. We manage your career.",
  region: "Global",
  regions: ["Global", "UAE & GCC", "North America"],
  description:
    "Independent, confidential HR advisory for professionals worldwide navigating workplace issues, PIPs, burnout, exits, and employee-rights questions — with dedicated regional guides for the UAE, GCC and North America.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
