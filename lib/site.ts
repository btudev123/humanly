export const siteConfig = {
  name: "Humanly",
  legalName: "Humanly HR Advisory",
  /**
   * Canonical host is the bare apex `https://talkhumanly.com`. `www` 308-redirects to it.
   *
   * Everything outward-facing derives from this one value — canonicals, sitemap, robots,
   * JSON-LD, llms.txt, Stripe success/cancel URLs and Cal.com links — so the site can never
   * advertise two hosts for the same page. Never hard-code the `www` host anywhere: a
   * canonical or webhook URL that lands on a redirect is either ignored (Google) or fails
   * outright (Stripe and Cal.com do not follow 308s).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://talkhumanly.com",
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
