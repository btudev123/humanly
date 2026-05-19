import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MaybeClerkProvider } from "@/components/auth/MaybeClerkProvider";

export const viewport: Viewport = {
  themeColor: "#f8f7f4",
  width: "device-width",
  initialScale: 1,
};

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL("https://talkhumanly.com"),
  title: {
    template: "%s | Humanly — HR with Dignity",
    default: "Humanly — Independent HR Advisory | UAE & GCC Workplace Support",
  },
  description:
    "Confidential, neutral HR advice for professionals in the UAE and GCC. Navigate toxic workplaces, PIPs, burnout, and labour law — without your employer knowing.",
  keywords: [
    "HR advisor UAE",
    "independent HR consultant Dubai",
    "toxic workplace advice UAE",
    "performance improvement plan Dubai",
    "confidential HR consultation",
    "UAE labour law expat rights",
    "HR advice without telling employer",
    "wrongful termination UAE",
    "gratuity rights UAE",
    "GCC employee rights",
  ],
  openGraph: {
    type: "website",
    siteName: "Humanly",
    title: "Humanly — Independent HR Advisory | UAE & GCC Workplace Support",
    description:
      "Confidential, neutral HR advice for professionals navigating workplace challenges. Talk to a real expert — not your employer's HR.",
    url: "https://talkhumanly.com",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Humanly — HR with Dignity",
    description:
      "Confidential, neutral HR advice for UAE & GCC professionals. Your HR isn't on your side. We are.",
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
  logo: "https://talkhumanly.com/logo.png",
  description:
    "Independent, confidential HR advisory for UAE and GCC professionals.",
  email: "karma@talkhumanly.com",
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
  areaServed: ["United Arab Emirates", "Gulf Cooperation Council"],
  serviceType: "Confidential HR advisory for employees",
  url: "https://talkhumanly.com",
  founder: founderSchema,
  priceRange: "AED 550-1800",
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

          {/* Poppins: ExtraBold (800) + SemiBold (600) + Regular (400) */}
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap"
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
