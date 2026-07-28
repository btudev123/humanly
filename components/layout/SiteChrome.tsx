"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * The marketing chrome — navbar, footer, and the decorative noise overlay.
 *
 * The Sanity Studio is mounted at `/studio` under this same root layout, but it is a
 * full-screen application rather than a page on the site. Rendering the navbar and
 * footer around it pushes the Studio into a short scrolling strip between them, which
 * makes it unusable. Studio routes therefore opt out of the chrome and are handed the
 * whole viewport.
 *
 * This is a client component purely so it can read the pathname; `usePathname()` is
 * resolved during server rendering too, so the chrome is absent from the Studio's
 * initial HTML rather than being hidden after hydration.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
