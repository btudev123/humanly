import type { Metadata } from "next";
import { CheckCircle2, Mail, ShieldCheck, Video } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your Humanly consultation has been booked.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/booking/done") },
};

export default async function BookingDonePage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    startTime?: string;
    endTime?: string;
    attendeeName?: string;
    email?: string;
    uid?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-surface px-margin-mobile py-36 md:px-margin-desktop">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-dark bg-[#25D366]/15">
          <CheckCircle2 className="text-[#1da851]" size={42} />
        </div>
        <h1 className="font-display text-h1-mobile font-extrabold tracking-tight text-primary-dark md:text-h1-desktop">
          Your session is booked
        </h1>
        <p className="mt-4 text-body-lg leading-relaxed text-neutral-500">
          You will receive a confirmation email with the meeting details and next steps.
        </p>
      </div>
      <section className="mx-auto mt-12 max-w-2xl rounded-3xl border-2 border-primary-dark bg-neutral-100 p-8 shadow-pop">
        <div className="space-y-4">
          {[
            ["Booking", params.title || "Humanly consultation"],
            ["Start", params.startTime || "Confirmed in your calendar email"],
            ["End", params.endTime || "Confirmed in your calendar email"],
            ["Email", params.email || "Provided during booking"],
            ["Reference", params.uid || "Cal.com booking reference"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-6 border-b-2 border-dashed border-neutral-300 pb-4 last:border-0">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
              <span className="text-right font-bold text-primary-dark">{value}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, title: "Check inbox", copy: "Confirmation and invoice details arrive by email." },
          { icon: Video, title: "Join privately", copy: "Use a quiet space where you can speak freely." },
          { icon: ShieldCheck, title: "Stay confidential", copy: "Your employer is not contacted." },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border-2 border-primary-dark bg-neutral-100 p-5 text-center transition-transform hover:-translate-y-1">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary-dark bg-violet-tint text-primary-violet">
              <item.icon size={22} />
            </div>
            <h2 className="font-display font-bold text-primary-dark">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
