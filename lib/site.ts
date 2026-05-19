export const siteConfig = {
  name: "Humanly",
  legalName: "Humanly HR Advisory",
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://talkhumanly.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "karma@talkhumanly.com",
  founder: "Karma Harb",
  region: "UAE & GCC",
  description:
    "Independent, confidential HR advisory for UAE and GCC professionals navigating workplace issues, PIPs, burnout, exits, and employee-rights questions.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
