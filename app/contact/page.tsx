"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const fieldClass =
  "rounded-2xl border-2 border-primary-dark bg-neutral-100 px-4 py-3.5 text-base text-primary-dark outline-none transition placeholder:text-neutral-400 focus:shadow-pop-sm";
const labelClass = "grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500";

export default function ContactPage() {
  return (
    <div className="overflow-clip bg-surface pb-24">
      <header className="relative mx-auto max-w-4xl px-margin-mobile pt-32 text-center md:px-margin-desktop md:pt-40">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <Scribble variant="star-fill" color="#ff6a1a" className="absolute left-[12%] top-28 hidden h-7 w-7 animate-float md:block" />
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary-dark shadow-pop-sm">
          <ShieldCheck size={13} className="text-primary-violet" /> Warm, private &amp; handled by humans
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          Get in touch,{" "}
          <span className="relative inline-block">
            confidentially
            <Scribble variant="underline-bold" color="#ff6a1a" strokeWidth={5} className="absolute -bottom-3 left-0 h-4 w-full" />
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body-lg text-neutral-500">
          Tell us what&apos;s happening in plain language — no need to make it sound polished. If it&apos;s urgent, booking a consultation is the fastest route.
        </p>
      </header>

      <section className="mx-auto mt-14 grid max-w-4xl gap-8 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        {/* Form */}
        <div className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop-sm">
          <form className="space-y-5">
            <label className={labelClass}>
              Name
              <input type="text" className={fieldClass} placeholder="Your full name" />
            </label>
            <label className={labelClass}>
              Email
              <input type="email" className={fieldClass} placeholder="you@email.com" />
            </label>
            <label className={labelClass}>
              What kind of support do you need?
              <select className={fieldClass}>
                <option>Confidential workplace question</option>
                <option>Harassment or bullying concern</option>
                <option>Contract, redundancy, or severance</option>
                <option>Organization partnership</option>
              </select>
            </label>
            <label className={labelClass}>
              Message
              <textarea rows={5} className={fieldClass} placeholder="Tell us what's happening..." />
            </label>
            <button
              type="submit"
              className="btn-pop flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-dark bg-accent-orange px-8 py-4 text-[15px] font-bold text-primary-dark shadow-pop-sm"
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              Send Secure Message
            </button>
          </form>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary-dark bg-[#25D366]/10 p-8 text-center">
            <MessageCircle className="mx-auto mb-4 text-[#1da851]" size={32} />
            <h3 className="font-display text-2xl font-bold text-primary-dark">Prefer WhatsApp?</h3>
            <p className="mt-2 leading-relaxed text-neutral-500">
              GCC professionals trust WhatsApp for quick, private conversations. Tap below to open a pre-filled chat.
            </p>
            <a
              href="https://wa.me/971XXXXXXXXX?text=Hi%20Karma%2C%20I%27d%20like%20confidential%20HR%20advice%20about..."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-[#25D366] px-7 py-3.5 text-[14px] font-bold text-primary-dark shadow-pop-sm"
            >
              <MessageCircle size={16} strokeWidth={2.5} />
              Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-3xl border-2 border-primary-dark bg-violet-tint p-8 text-center">
            <CalendarCheck className="mx-auto mb-4 text-primary-violet" size={32} />
            <h3 className="font-display text-2xl font-bold text-primary-dark">Book directly</h3>
            <p className="mt-2 leading-relaxed text-neutral-500">
              Skip the form. Book a confidential session now and Karma will review your intake before you meet.
            </p>
            <Link
              href="/booking"
              className="btn-pop mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary-dark bg-primary-dark px-7 py-3.5 text-[14px] font-bold text-on-primary"
            >
              Book a session
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-6">
            <div className="grid gap-3">
              {[
                { icon: ShieldCheck, label: "Confidential intake — never shared" },
                { icon: Mail, label: "hello@talkhumanly.com" },
                { icon: MapPin, label: "UAE · GCC focused" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="shrink-0 text-primary-violet" size={18} />
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-4xl px-margin-mobile text-center md:px-margin-desktop">
        <p className="text-xs italic text-neutral-400">Your employer will not be contacted. This is strictly confidential.</p>
      </section>
    </div>
  );
}
