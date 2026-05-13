import Link from "next/link";
import { Globe2, Instagram, Linkedin, LockKeyhole, Mail, MessageCircle, ShieldCheck } from "lucide-react";

const trustBadges = [
  { icon: LockKeyhole, title: "SSL encrypted", detail: "Secure session transit" },
  { icon: Globe2, title: "GDPR aligned", detail: "Privacy-first handling" },
  { icon: ShieldCheck, title: "Confidential intake", detail: "No employer disclosure" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-primary-purple/10 bg-white px-5 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-purple text-base font-black text-white">
              H
            </div>
            <span className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">Humanly</span>
          </div>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-slate-600">
            Confidential workplace guidance for people who need clarity before the next conversation.
          </p>
          <div className="mt-8 flex gap-4">
            {[Instagram, Linkedin, MessageCircle, Mail].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Humanly social channel"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-purple/10 text-primary-purple/55 transition hover:border-primary-violet hover:text-primary-violet"
              >
                <Icon size={19} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.26em] text-primary-purple/42">Explore</h4>
          <ul className="space-y-4 text-sm font-black uppercase tracking-[0.12em] text-primary-purple/70">
            <li><Link href="/services" className="hover:text-primary-violet">Services</Link></li>
            <li><Link href="/resources" className="hover:text-primary-violet">Resource Hub</Link></li>
            <li><Link href="/about" className="hover:text-primary-violet">Karma's Story</Link></li>
            <li><Link href="/faq" className="hover:text-primary-violet">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.26em] text-primary-purple/42">Trust</h4>
          <ul className="space-y-4 text-sm font-black uppercase tracking-[0.12em] text-primary-purple/70">
            <li><Link href="/privacy" className="hover:text-primary-violet">Confidentiality</Link></li>
            <li><Link href="/terms" className="hover:text-primary-violet">Terms</Link></li>
            <li><Link href="/contact" className="hover:text-primary-violet">Contact</Link></li>
            <li><Link href="/booking" className="hover:text-primary-violet">Book Consultation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.26em] text-primary-purple/42">Security</h4>
          <div className="grid gap-3">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3 rounded-lg border border-primary-purple/10 bg-[#FAFAFA] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary-violet shadow-sm">
                  <badge.icon size={19} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-primary-purple">{badge.title}</div>
                  <div className="mt-1 text-sm font-medium text-primary-purple/52">{badge.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-primary-purple/10 pt-8 text-[10px] font-black uppercase tracking-[0.22em] text-primary-purple/42 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Humanly. HR with dignity.</p>
        <p>Not a law firm. Educational and strategic HR advocacy.</p>
      </div>
    </footer>
  );
};
