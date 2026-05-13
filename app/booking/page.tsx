"use client";

import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, getDay, isBefore, isSameDay, startOfMonth, startOfToday, subMonths } from "date-fns";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, ChevronLeft, ChevronRight, Clock, LockKeyhole, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const timeSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM"];

export default function Booking() {
  const router = useRouter();
  const today = startOfToday();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(addDays(today, 1));
  const [selectedTime, setSelectedTime] = useState("10:30 AM");

  const days = useMemo(() => {
    const monthDays = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
    const blanks = Array.from({ length: getDay(startOfMonth(month)) });
    return { blanks, monthDays };
  }, [month]);

  const confirm = () => {
    if (!selectedDate || !selectedTime) return;
    router.push(`/checkout?date=${selectedDate.toISOString()}&time=${encodeURIComponent(selectedTime)}&plan=clarity`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 pb-24 pt-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-violet">Book a consultation</p>
          <h1 className="mt-5 font-serif text-6xl font-black italic leading-[0.9] text-primary-purple md:text-8xl">
            Pick a private time that gives you room to think.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-primary-purple/64">
            A focused 45-minute consultation for workplace conflict, contracts, harassment concerns, PIPs, redundancy, severance, or any situation where HR does not feel neutral.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              { icon: LockKeyhole, title: "No employer notification", copy: "Your booking and intake stay private." },
              { icon: ShieldCheck, title: "Confidential preparation", copy: "Bring screenshots, contracts, notes, or just the story." },
              { icon: Clock, title: "45-minute strategy window", copy: "Leave with language, options, and next steps." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-lg bg-white p-5 ring-1 ring-primary-purple/10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-violet text-white">
                  <item.icon size={20} />
                </div>
                <div>
                  <h2 className="font-black text-primary-purple">{item.title}</h2>
                  <p className="mt-1 text-primary-purple/58">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white p-5 shadow-2xl shadow-primary-purple/10 ring-1 ring-primary-purple/10 md:p-8"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-primary-purple/10 pb-6 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary-purple/42">Available slots update live</p>
              <h2 className="mt-2 text-3xl font-black text-primary-purple">{format(month, "MMMM yyyy")}</h2>
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous month"
                onClick={() => setMonth((value) => subMonths(value, 1))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-purple/10 text-primary-purple disabled:opacity-30"
                disabled={isBefore(subMonths(month, 1), startOfMonth(today))}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label="Next month"
                onClick={() => setMonth((value) => addMonths(value, 1))}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary-purple/10 text-primary-purple"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-primary-purple/42">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.blanks.map((_, index) => (
              <div key={`blank-${index}`} />
            ))}
            {days.monthDays.map((day) => {
              const disabled = isBefore(day, today);
              const active = selectedDate && isSameDay(day, selectedDate);
              const weekend = [0, 6].includes(getDay(day));
              return (
                <button
                  key={day.toISOString()}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(day);
                    if (!selectedTime) setSelectedTime(timeSlots[1]);
                  }}
                  className={`aspect-square rounded-lg border text-sm font-black transition md:text-base ${
                    active
                      ? "border-primary-violet bg-primary-violet text-white shadow-lg shadow-primary-violet/25"
                      : disabled
                        ? "border-transparent bg-gray-50 text-gray-300"
                        : weekend
                          ? "border-secondary-orange/20 bg-secondary-orange/10 text-primary-purple hover:border-secondary-orange"
                          : "border-primary-purple/10 bg-[#FAFAFA] text-primary-purple hover:border-primary-violet"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-primary-purple">Available times</h3>
              {selectedDate && <p className="text-sm font-bold text-primary-purple/52">{format(selectedDate, "EEEE, MMMM d")}</p>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-lg border px-4 py-4 text-sm font-black uppercase tracking-[0.12em] transition ${
                    selectedTime === slot
                      ? "border-primary-purple bg-primary-purple text-white"
                      : "border-primary-purple/10 bg-white text-primary-purple hover:border-primary-violet"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-[#FAFAFA] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary-purple/42">Selected consultation</p>
                <p className="mt-2 text-xl font-black text-primary-purple">
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Choose a date"} at {selectedTime || "choose a time"}
                </p>
              </div>
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={confirm}
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-primary-purple px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-primary-violet disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Continue to payment
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary-purple/42">
              <CalendarCheck size={15} className="text-primary-violet" />
              Real-time calendar view with secure checkout next
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
