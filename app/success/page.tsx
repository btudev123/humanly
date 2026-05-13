"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { CheckCircle2, Calendar as CalendarIcon, Mail, ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Success() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pt-20 pb-32 px-6 flex flex-col items-center justify-center min-h-[80vh] relative overflow-hidden">
      {/* Background celebration */}
      <Scribble type="sparkle" className="absolute top-20 left-20 w-40 h-40 text-secondary-orange/20" delay={0.2} />
      <Scribble type="star" className="absolute bottom-40 right-20 w-32 h-32 text-secondary-pink/20" delay={0.4} />
      <Scribble type="loop" className="absolute top-1/2 left-10 w-24 h-24 text-primary-violet/10" delay={0.6} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="max-w-3xl w-full bg-white p-16 lg:p-24 rounded-[70px] shadow-2xl border border-gray-100 text-center relative z-10"
      >
        <div className="w-24 h-24 bg-green-500 rounded-[30px] flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-green-500/30">
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>

        <h1 className="text-5xl lg:text-7xl font-black text-primary-purple mb-8 leading-tight">
          You're all <span className="relative inline-block text-secondary-orange italic">
            set!
            <Scribble type="underline" className="absolute -bottom-2 left-0 w-full h-3 text-secondary-pink" color="#f982db" />
          </span>
        </h1>
        
        <p className="text-2xl text-gray-500 font-medium mb-12 leading-relaxed">
          Your booking is confirmed. We've sent a calendar invite and a preparation guide to your email.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gray-50 p-8 rounded-[40px] flex flex-col items-center border border-gray-100">
             <div className="w-12 h-12 bg-primary-violet/10 rounded-2xl flex items-center justify-center text-primary-violet mb-4">
                <CalendarIcon size={24} />
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Check Calendar</p>
             <h4 className="text-primary-purple font-black">Invite Sent</h4>
          </div>
          <div className="bg-gray-50 p-8 rounded-[40px] flex flex-col items-center border border-gray-100">
             <div className="w-12 h-12 bg-secondary-pink/10 rounded-2xl flex items-center justify-center text-secondary-pink mb-4">
                <Mail size={24} />
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Check Email</p>
             <h4 className="text-primary-purple font-black">Preparation Guide</h4>
          </div>
        </div>

        <div className="space-y-6">
          <Link href="/resources">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-6 bg-primary-violet text-white font-black rounded-3xl text-xl shadow-2xl shadow-primary-violet/20 flex items-center justify-center gap-3 transition-colors hover:bg-primary-purple"
            >
              <Sparkles size={24} />
              Read Pre-Consultation Guide
            </motion.button>
          </Link>
          <Link href="/">
             <button className="text-primary-violet font-black underline underline-offset-8 transition-all hover:text-primary-purple">
               Return to Home
             </button>
          </Link>
        </div>

        {/* Fun doodle at the bottom */}
        <Scribble type="sparkle" className="mx-auto w-16 h-16 text-secondary-orange/40 mt-12" />
      </motion.div>

      {/* Floating party elements if showConfetti */}
      {showConfetti && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: "110%", 
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: "-10%", 
                rotate: 360,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 3 + 2, 
                delay: Math.random() * 2,
                repeat: Infinity 
              }}
              className="absolute"
            >
              <PartyPopper size={24} className={i % 2 === 0 ? "text-secondary-orange" : "text-secondary-pink"} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
