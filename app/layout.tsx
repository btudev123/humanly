import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { siteConfig, absoluteUrl } from "@/lib/site";
import { getPageContent, getSiteSettings } from "@/lib/sanity/queries";

export const viewport: Viewport = {
  themeColor: "#fbf7f1",
  width: "device-width",
  initialScale: 1,
};

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

const TITLE_TEMPLATE = "%s | Humanly — HR with Dignity";
const DEFAULT_TITLE = "Humanly — Independent, Confidential HR Advisory for Professionals";
const DEFAULT_DESCRIPTION =
  "Your HR manages the workplace. We manage your career. Independent, confidential HR advice for professionals worldwide — toxic workplaces, PIPs, burnout, exits, and your rights, without your employer knowing. Regional guides for the UAE, GCC & North America.";

const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: TITLE_TEMPLATE,
    default: DEFAULT_TITLE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "independent HR advisor",
    "confidential HR consultation",
    "HR advice without telling employer",
    "performance improvement plan help",
    "toxic workplace advice",
    "exit negotiation support",
    "employee rights advisor",
    "career advisory",
    "UAE labour law rights",
    "GCC employee rights",
    "North America workplace rights",
  ],
  openGraph: {
    type: "website",
    siteName: "Humanly",
    title: "Humanly — Independent, Confidential HR Advisory for Professionals",
    description:
      "Your HR manages the workplace. We manage your career. Talk to a real expert — not your employer's HR.",
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Humanly — HR with Dignity",
    description:
      "Your HR manages the workplace. We manage your career. Independent, confidential HR advisory for professionals.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

/**
 * Home + site-wide default metadata. Sanity's `page` ("/") SEO and
 * `siteSettings.defaultSeo` overlay the in-code defaults above; anything the CMS
 * leaves blank keeps the shipped copy. The `title.template` is preserved so child
 * routes without their own metadata still get the brand suffix.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([
    getPageContent("/"),
    getSiteSettings(),
  ]);
  const seo = home?.seo;
  const title = seo?.metaTitle || settings?.defaultSeo?.metaTitle;
  const description =
    seo?.metaDescription || settings?.defaultSeo?.metaDescription;

  return {
    ...baseMetadata,
    title: { template: TITLE_TEMPLATE, default: title || DEFAULT_TITLE },
    description: description || DEFAULT_DESCRIPTION,
    openGraph: {
      ...baseMetadata.openGraph,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    ...(seo?.canonicalOverride
      ? { alternates: { ...baseMetadata.alternates, canonical: seo.canonicalOverride } }
      : {}),
  };
}

const founderSameAs = (settings: { sameAs?: string[] } | null) =>
  Array.from(new Set([siteConfig.founderLinkedIn, ...(settings?.sameAs ?? [])]));

const buildOrganizationSchema = (
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: settings?.organizationName || "Humanly HR Advisory",
  url: siteConfig.url,
  logo: absoluteUrl("/logo.svg"),
  description:
    settings?.organizationDescription ||
    "Independent, confidential HR advisory for professionals worldwide, with dedicated guidance for the UAE, GCC and North America.",
  email: "hello@talkhumanly.com",
  sameAs: settings?.sameAs?.length ? settings.sameAs : undefined,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Confidential Consultation",
    availableLanguage: ["English", "Arabic"],
  },
  founder: {
    "@type": "Person",
    name: siteConfig.founder,
    jobTitle: siteConfig.founderRole,
    description:
      "20+ years in HR across UAE, Saudi Arabia, and international environments.",
    sameAs: founderSameAs(settings),
  },
});

const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.founder,
  url: absoluteUrl("/about"),
  jobTitle: siteConfig.founderRole,
  image: absoluteUrl("/karma-harb.png"),
  sameAs: [siteConfig.founderLinkedIn],
  worksFor: {
    "@type": "Organization",
    name: "Humanly HR Advisory",
  },
  knowsAbout: [
    "Human Resources",
    "Employee relations",
    "UAE labour law",
    "GCC workplace advisory",
    "Performance improvement plans",
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Humanly HR Advisory",
  areaServed: ["Worldwide", "United Arab Emirates", "Gulf Cooperation Council", "North America"],
  serviceType: "Confidential HR advisory for employees",
  url: siteConfig.url,
  founder: founderSchema,
  priceRange: "$75-$1400",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Humanly — HR with Dignity",
  url: siteConfig.url,
  description:
    "Confidential workplace advice for UAE and GCC professionals.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/resources?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const organizationSchema = buildOrganizationSchema(settings);

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="aqes15l-sKDJFnhJO3sk6HJ0HcmDajXGKi22TK9NMsQ"
        />

        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Brand typeface: Poppins everywhere — 400 body / 500 buttons / 600 sub-head / 700 / 800 headers */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Material Symbols Outlined + Filled */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />

        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PGW9TMS8');`}
        </Script>
        {/* End Google Tag Manager */}

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VS75LYDHVC"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VS75LYDHVC');`}
        </Script>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      {/* Noise overlay texture (purely decorative, no performance hit) */}
      <body className="min-h-screen flex flex-col relative">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PGW9TMS8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Navbar, footer and noise overlay — omitted on /studio, which is a
            full-screen app rather than a page on the site. */}
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
