import Link from "next/link";
import { ArrowRight, CalendarCheck, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

export default function ContactPage() {
  return (
    <div className="overflow-clip bg-surface pb-24">
      <header className="relative mx-auto max-w-4xl px-margin-mobile pt-32 text-center md:px-margin-desktop md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#fda544" className="absolute left-[12%] top-28 hidden h-7 w-7 animate-float md:block" />
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <ShieldCheck size={13} className="text-primary-violet" /> Warm, private &amp; handled by humans
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          Get in touch,{" "}
          <span className="relative inline-block">
            confidentially
            <Scribble variant="underline-bold" color="#fda544" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
          Tell us what&apos;s happening in plain language — no need to make it sound polished. If it&apos;s
          urgent, booking a confidential consultation is the fastest route.
        </p>
      </header>

      <section className="mx-auto mt-14 grid max-w-4xl gap-6 px-margin-mobile sm:grid-cols-2 md:px-margin-desktop">
        {/* Email */}
        <div className="flex flex-col rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8 text-center shadow-pop-sm">
          <Mail className="mx-auto mb-4 text-primary-violet" size={32} />
          <h2 className="font-display text-2xl font-bold text-primary-dark">Email us directly</h2>
          <p className="mt-2 flex-1 leading-relaxed text-neutral-500">
            Write to us about your situation. Karma reads every message personally — it stays strictly
            confidential and your employer is never contacted.
          </p>
          <a
            href="mailto:hello@talkhumanly.com?subject=Confidential%20HR%20enquiry"
            className="btn-pop mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-7 py-3.5 text-[14px] font-bold text-primary-dark shadow-pop-sm"
          >
            <Mail size={16} strokeWidth={2.5} />
            hello@talkhumanly.com
          </a>
        </div>

        {/* Book */}
        <div className="flex flex-col rounded-3xl border-2 border-primary-dark bg-violet-tint p-8 text-center">
          <CalendarCheck className="mx-auto mb-4 text-primary-violet" size={32} />
          <h2 className="font-display text-2xl font-bold text-primary-dark">Book directly</h2>
          <p className="mt-2 flex-1 leading-relaxed text-neutral-500">
            Skip the back-and-forth. Book a confidential session now and Karma will review your intake
            before you meet.
          </p>
          <Link
            href="/booking"
            className="btn-pop mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-primary-dark px-7 py-3.5 text-[14px] font-bold text-on-primary"
          >
            Book a consultation
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-4xl px-margin-mobile md:px-margin-desktop">
        <div className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Confidential — never shared" },
              { icon: Mail, label: "hello@talkhumanly.com" },
              { icon: MapPin, label: "Global · UAE, GCC & North America" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="shrink-0 text-primary-violet" size={18} />
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <p className="text-xs italic text-neutral-400">Your employer will not be contacted. This is strictly confidential.</p>
      </section>
    </div>
  );
}
