import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://humanly.example"),
  title: {
    default: "Humanly - HR with Dignity",
    template: "%s | Humanly",
  },
  description: "Confidential HR advocacy, workplace rights education, and private consultation booking for employees navigating difficult work situations.",
  keywords: [
    "confidential HR support",
    "UAE labour law guidance",
    "workplace harassment help",
    "PIP response strategy",
    "severance negotiation support",
    "employee advocacy",
  ],
  openGraph: {
    title: "Humanly - HR with Dignity",
    description: "Private, neutral workplace guidance before the next high-stakes conversation.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Humanly",
    description: "Confidential HR advocacy and workplace rights education for employees.",
    areaServed: "United Arab Emirates",
    serviceType: "Confidential workplace consultation",
    sameAs: [],
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-[#140b2b] bg-[#FAFAFA]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <div className="noise-overlay" />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
