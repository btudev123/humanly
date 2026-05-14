import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/booking", label: "Book a Session" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="w-full py-[64px] px-[20px] md:px-[64px] flex flex-col items-center text-center bg-neutral-100 border-t border-neutral-300">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col items-center">
        {/* Brand */}
        <Link
          href="/"
          className="font-extrabold text-[32px] text-primary-dark mb-8 tracking-tight hover:text-primary-violet transition-colors"
        >
          Humanly
        </Link>

        {/* Footer Navigation */}
        <nav
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12"
          aria-label="Footer navigation"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-normal text-[16px] text-neutral-500 hover:text-primary-violet underline transition-all opacity-80 hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-full max-w-lg h-px bg-neutral-300 mb-12" />

        {/* Legal Disclaimer */}
        <p className="font-normal text-[12px] text-neutral-500 mb-6 max-w-2xl mx-auto italic">
          Humanly provides HR guidance and coaching, not legal advice.
        </p>

        {/* Copyright */}
        <p className="font-normal text-[12px] text-neutral-500 mb-8">
          © {new Date().getFullYear()} Humanly HR Advisory. All rights
          reserved. Neutral advocacy for the modern workplace.
        </p>

        {/* Bottom Stamp — hand-drawn feel */}
        <div className="relative mt-8 group cursor-default">
          <div className="absolute inset-0 border-2 border-neutral-400 rounded-[2px] rotate-[-2deg] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative font-semibold text-[14px] text-neutral-500 py-3 px-6 uppercase tracking-widest bg-neutral-100 rounded-[2px]">
            Humanly — HR with dignity. {new Date().getFullYear()}.
          </div>
        </div>

        {/* WhatsApp CTA — GCC audience expects this */}
        <Link
          href="https://wa.me/YOUR_BUSINESS_WHATSAPP?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20Humanly."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            chat
          </span>
        </Link>
      </div>
    </footer>
  );
}