"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { Gavel, AlertCircle, CheckCircle2, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-24">
          <h1 className="text-6xl font-black text-primary-purple mb-8">Terms of Service</h1>
          <p className="text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
            The formal stuff. Clear, fair, and designed to support a respectful partnership.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[60px] shadow-2xl border border-gray-100 p-12 lg:p-24 relative overflow-hidden"
        >
          <Scribble type="loop" className="absolute -top-20 -right-20 w-80 h-80 text-primary-violet/5 -z-0" />
          
          <div className="relative z-10 space-y-16 text-gray-600 font-medium">
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-primary-purple flex items-center gap-4">
                <Scale className="text-secondary-orange" size={28} />
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed text-lg">
                By accessing or using Humanly, you agree to be bound by these terms. If you represent an organization, these terms extend to any users under your account management.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-black text-primary-purple flex items-center gap-4">
                <AlertCircle className="text-secondary-pink" size={28} />
                2. Nature of Service
              </h2>
              <p className="leading-relaxed text-lg">
                Humanly provides workplace advocacy, mediation, and education. We are <span className="text-primary-violet font-black">NOT</span> a law firm, and our advice is not legal counsel. We recommend consulting a licensed attorney for specific legal litigation.
              </p>
            </section>

            <section className="space-y-8">
               <h2 className="text-3xl font-black text-primary-purple flex items-center gap-4">
                <CheckCircle2 className="text-primary-violet" size={28} />
                3. User Responsibilities
              </h2>
              <ul className="grid md:grid-cols-2 gap-6">
                 {[
                   "Provide accurate information for consultations.",
                   "Respect the professional boundaries of advisors.",
                   "Maintain confidentiality of shared templates.",
                   "Ensure timely payment for booked sessions."
                 ].map((item, i) => (
                   <li key={i} className="flex gap-3 bg-gray-50 p-6 rounded-3xl border border-gray-100 italic">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-violet mt-2 shrink-0" />
                      {item}
                   </li>
                 ))}
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-black text-primary-purple flex items-center gap-4">
                <Gavel className="text-primary-purple shrink-0" size={28} />
                4. Liability Disclaimer
              </h2>
              <p className="leading-relaxed text-lg p-8 bg-primary-violet/5 rounded-[40px] border-2 border-dashed border-primary-violet/10">
                While we strive for the best possible outcomes, workplace transitions and disputes are inherently complex. Humanly is not liable for employment outcomes, including termination, disciplinary action, or loss of income stemming from independent decisions made after a consultation.
              </p>
            </section>
          </div>
        </motion.div>

        <div className="mt-20 p-12 bg-secondary-orange/10 rounded-[50px] border-4 border-dashed border-secondary-orange/20 text-center">
           <h3 className="text-xl font-black text-primary-purple mb-4">Questions about our legal terms?</h3>
           <p className="text-gray-500 font-bold mb-8">We're happy to explain them in plain human language.</p>
           <button className="px-10 py-4 bg-primary-violet text-white font-black rounded-2xl shadow-lg">Contact Support</button>
        </div>
      </div>
    </div>
  );
}
