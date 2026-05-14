"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="px-5 md:px-[64px] max-w-4xl mx-auto pt-20 md:pt-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-dark/5 px-4 py-2 mb-6">
          <ShieldCheck className="text-primary-violet" size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dark">
            Warm, private, and handled by humans
          </span>
        </div>
        <h1 className="font-extrabold text-[32px] md:text-[48px] leading-[1.2] -tracking-[0.02em] text-primary-dark max-w-3xl mx-auto">
          Get in touch, confidentially
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-neutral-500 max-w-xl mx-auto">
          Tell us what's happening in plain language. No need to make it sound polished. If it's urgent, booking a consultation is the fastest route.
        </p>
      </header>

      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-14 grid gap-8 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg bg-white border border-neutral-300 p-8 shadow-sm">
          <form className="space-y-6">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Name
              <input
                type="text"
                className="rounded-lg border border-neutral-300 px-4 py-4 text-base text-primary-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-violet/50 focus:border-primary-violet transition"
                placeholder="Your full name"
              />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Email
              <input
                type="email"
                className="rounded-lg border border-neutral-300 px-4 py-4 text-base text-primary-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-violet/50 focus:border-primary-violet transition"
                placeholder="you@email.com"
              />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              What kind of support do you need?
              <select className="rounded-lg border border-neutral-300 px-4 py-4 text-base text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-violet/50 focus:border-primary-violet transition">
                <option>Confidential workplace question</option>
                <option>Harassment or bullying concern</option>
                <option>Contract, redundancy, or severance</option>
                <option>Organization partnership</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Message
              <textarea
                rows={5}
                className="rounded-lg border border-neutral-300 px-4 py-4 text-base text-primary-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-violet/50 focus:border-primary-violet transition"
                placeholder="Tell us what's happening..."
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-primary-violet text-white px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              Send Secure Message
            </button>
          </form>
        </div>

        {/* Right Column: CTA + Trust */}
        <div className="flex flex-col gap-6">
          {/* WhatsApp */}
          <div className="rounded-lg bg-green-50 border-2 border-green-500 p-8 text-center relative overflow-hidden">
            <Scribble variant="sparkle" className="absolute top-4 right-4 w-12 h-12 text-green-500/20" />
            <MessageCircle className="mx-auto text-green-600 mb-4" size={32} />
            <h3 className="font-extrabold text-2xl text-primary-dark mb-2">Prefer WhatsApp?</h3>
            <p className="text-neutral-500 leading-relaxed mb-6">
              GCC professionals trust WhatsApp for quick, private conversations. Scan or tap below to open a pre-filled chat.
            </p>
            <a
              href="https://wa.me/971XXXXXXXXX?text=Hi%20Karma%2C%20I%27d%20like%20confidential%20HR%20advice%20about..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>

          {/* Booking CTA */}
          <div className="rounded-lg bg-primary-violet/5 border border-primary-violet/20 p-8 text-center">
            <CalendarCheck className="mx-auto text-primary-violet mb-4" size={32} />
            <h3 className="font-extrabold text-2xl text-primary-dark mb-2">Book directly</h3>
            <p className="text-neutral-500 leading-relaxed mb-6">
              Skip the form. Book a confidential session now and Karma will review your intake before you meet.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-primary-violet text-white px-8 py-4 font-bold uppercase tracking-[0.1em] text-xs hover:bg-primary-dark transition-colors"
            >
              Book a session
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trust markers */}
          <div className="rounded-lg bg-white border border-neutral-300 p-6">
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

      {/* Micro-copy footer */}
      <section className="px-5 md:px-[64px] max-w-4xl mx-auto mt-8 mb-20 text-center">
        <p className="text-xs text-neutral-400 italic">
          Your employer will not be contacted. This is strictly confidential.
        </p>
      </section>
    </div>
  );
}