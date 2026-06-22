import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MaybeClerkProvider } from "@/components/auth/MaybeClerkProvider";

export const viewport: Viewport = {
  themeColor: "#fbf7f1",
  width: "device-width",
  initialScale: 1,
};

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://talkhumanly.com"),
  title: {
    template: "%s | Humanly — HR with Dignity",
    default: "Humanly — Independent, Confidential HR Advisory for Professionals",
  },
  description:
    "Your HR manages the workplace. We manage your career. Independent, confidential HR advice for professionals worldwide — toxic workplaces, PIPs, burnout, exits, and your rights, without your employer knowing. Regional guides for the UAE, GCC & North America.",
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
    url: "https://talkhumanly.com",
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
    canonical: "https://talkhumanly.com",
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Humanly HR Advisory",
  url: "https://talkhumanly.com",
  logo: "https://talkhumanly.com/logo.svg",
  description:
    "Independent, confidential HR advisory for professionals worldwide, with dedicated guidance for the UAE, GCC and North America.",
  email: "hello@talkhumanly.com",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Confidential Consultation",
    availableLanguage: ["English", "Arabic"],
  },
  founder: {
    "@type": "Person",
    name: "Karma Harb",
    jobTitle: "Founder & Principal HR Advisor",
    description:
      "20+ years in HR across UAE, Saudi Arabia, and international environments.",
  },
};

const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Karma Harb",
  jobTitle: "Founder & Principal HR Advisor",
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
  url: "https://talkhumanly.com",
  founder: founderSchema,
  priceRange: "$75-$1400",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Humanly — HR with Dignity",
  url: "https://talkhumanly.com",
  description:
    "Confidential workplace advice for UAE and GCC professionals.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://talkhumanly.com/resources?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MaybeClerkProvider>
      <html lang="en">
        <head>
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
          <div className="noise-overlay" aria-hidden="true" />

          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </body>
      </html>
    </MaybeClerkProvider>
  );
}
