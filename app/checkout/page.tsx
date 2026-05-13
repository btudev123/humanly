"use client";

import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarCheck, CreditCard, Globe2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const plan = {
  name: "Clarity Call",
  price: "$120.00",
  description: "45-minute confidential workplace strategy consultation",
};

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ date: new Date(), time: "10:30 AM" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    setDetails({
      date: dateParam ? parseISO(dateParam) : new Date(),
      time: params.get("time") || "10:30 AM",
    });
  }, []);

  const redirectToStripe = () => {
    setLoading(true);
    window.setTimeout(() => {
      router.push(`/success?date=${details.date.toISOString()}&time=${encodeURIComponent(details.time)}`);
    }, 700);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-28 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-lg bg-white p-6 shadow-2xl shadow-primary-purple/10 ring-1 ring-primary-purple/10 md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-violet">Secure checkout</p>
        <h1 className="mt-4 font-serif text-5xl font-black italic text-primary-purple md:text-7xl">Review and pay with Stripe.</h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-primary-purple/62">
          Your card details are handled by Stripe. Humanly only receives the booking confirmation needed to prepare your consultation.
        </p>

        <div className="mt-10 rounded-lg bg-[#FAFAFA] p-6">
          <h2 className="text-2xl font-black text-primary-purple">Booking summary</h2>
          <div className="mt-6 grid gap-4">
            {[
              ["Service", plan.name],
              ["Date", format(details.date, "MMMM d, yyyy")],
              ["Time", details.time],
              ["Duration", "45 minutes"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-6 border-b border-primary-purple/10 pb-4 last:border-0 last:pb-0">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-purple/42">{label}</span>
                <span className="text-right text-lg font-black text-primary-purple">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between rounded-lg bg-white p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-purple/42">Total due today</p>
              <p className="mt-1 text-primary-purple/58">{plan.description}</p>
            </div>
            <div className="font-serif text-5xl font-black italic text-primary-violet">{plan.price}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-3 rounded-lg border border-primary-purple/15 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-primary-purple"
          >
            <ArrowLeft size={18} />
            Change slot
          </button>
          <button
            onClick={redirectToStripe}
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-3 rounded-lg bg-primary-purple px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-primary-purple/20 transition hover:bg-primary-violet disabled:bg-primary-purple/60"
          >
            <CreditCard size={19} />
            {loading ? "Redirecting to Stripe..." : "Pay securely"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg bg-primary-purple p-6 text-white md:p-8">
          <ShieldCheck size={34} className="text-secondary-orange" />
          <h2 className="mt-6 text-3xl font-black">Trust at checkout</h2>
          <p className="mt-4 leading-relaxed text-white/72">
            We use a payment redirect pattern so sensitive card data never touches Humanly servers.
          </p>
        </div>
        {[
          { icon: LockKeyhole, title: "SSL encrypted", copy: "Protected checkout session with secure transport." },
          { icon: Globe2, title: "GDPR aligned", copy: "Privacy-first handling for personal workplace information." },
          { icon: CalendarCheck, title: "Success redirect", copy: "After payment, users land on a confirmation page with next steps." },
        ].map((badge) => (
          <div key={badge.title} className="flex gap-4 rounded-lg bg-white p-5 ring-1 ring-primary-purple/10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-violet/10 text-primary-violet">
              <badge.icon size={22} />
            </div>
            <div>
              <h3 className="font-black text-primary-purple">{badge.title}</h3>
              <p className="mt-1 leading-relaxed text-primary-purple/58">{badge.copy}</p>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
