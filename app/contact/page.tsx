"use client";

import Link from "next/link";
import { CalendarCheck, Mail, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 pb-24 pt-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-violet">Contact</p>
          <h1 className="mt-5 font-serif text-6xl font-black italic leading-[0.9] text-primary-purple md:text-8xl">
            Warm, private, and handled by humans.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-primary-purple/64">
            Tell us what is happening in plain language. You do not need to make it sound polished. If it is urgent, booking a consultation is the fastest route.
          </p>
          <Link href="/booking" className="mt-10 inline-flex items-center gap-3 rounded-lg bg-primary-purple px-7 py-5 text-sm font-black uppercase tracking-[0.16em] text-white">
            <CalendarCheck size={18} />
            Book Consultation
          </Link>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-2xl shadow-primary-purple/10 ring-1 ring-primary-purple/10 md:p-8">
          <form className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-purple/58">
                Name
                <input className="rounded-lg border border-primary-purple/10 px-4 py-4 text-base font-medium normal-case tracking-normal text-primary-purple" />
              </label>
              <label className="grid gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-purple/58">
                Email
                <input type="email" className="rounded-lg border border-primary-purple/10 px-4 py-4 text-base font-medium normal-case tracking-normal text-primary-purple" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-purple/58">
              What kind of support do you need?
              <select className="rounded-lg border border-primary-purple/10 px-4 py-4 text-base font-medium normal-case tracking-normal text-primary-purple">
                <option>Confidential workplace question</option>
                <option>Harassment or bullying concern</option>
                <option>Contract, redundancy, or severance</option>
                <option>Organization partnership</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-purple/58">
              Message
              <textarea rows={7} className="rounded-lg border border-primary-purple/10 px-4 py-4 text-base font-medium normal-case tracking-normal text-primary-purple" />
            </label>
            <button className="rounded-lg bg-primary-purple px-6 py-5 text-sm font-black uppercase tracking-[0.16em] text-white">
              Send Secure Message
            </button>
          </form>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Confidential intake" },
              { icon: Mail, label: "hello@humanly.example" },
              { icon: MapPin, label: "UAE focused" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[#FAFAFA] p-4 text-center">
                <item.icon className="mx-auto text-primary-violet" size={22} />
                <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-primary-purple/58">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
