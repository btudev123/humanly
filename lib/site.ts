export const siteConfig = {
  name: "Humanly",
  legalName: "Humanly HR Advisory",
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://talkhumanly.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@talkhumanly.com",
  founder: "Karma Harb",
  tagline: "Your HR manages the workplace. We manage your career.",
  region: "Global",
  regions: ["Global", "UAE & GCC", "North America"],
  description:
    "Independent, confidential HR advisory for professionals worldwide navigating workplace issues, PIPs, burnout, exits, and employee-rights questions — with dedicated regional guides for the UAE, GCC and North America.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
