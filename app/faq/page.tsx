"use client";

import { motion, AnimatePresence } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { useState } from "react";
import { Plus, Minus, Search, Sparkles, MessageCircle, ShieldCheck, Calendar } from "lucide-react";

const faqData = [
  {
    category: "Confidentiality",
    icon: ShieldCheck,
    items: [
      {
        q: "Is my employer notified when I book a call?",
        a: "Absolutely not. Humanly is a third-party platform. We have no direct connection to your company's systems, HR departments, or management. Your identity and the contents of your session are strictly between you and your advisor."
      },
      {
        q: "How secure is my data?",
        a: "We use AES-256 encryption for all data at rest and TLS for all data in transit. We are fully GDPR and CCPA compliant, treating your personal story with the same security we treat bank data."
      }
    ]
  },
  {
    category: "Services & Support",
    icon: Sparkles,
    items: [
      {
        q: "What kind of expertise do your advisors have?",
        a: "All Humanly advisors have at least 10+ years of senior-level HR experience, employment law education, or professional mediation certification. They have worked inside major corporate structures and know exactly how the system operates."
      },
      {
        q: "Can you help me with a legal case?",
        a: "We provide strategic advocacy and education to help you avoid legal battles or prepare for them. However, we are not a law firm. If your situation requires formal litigation, we can help you understand what to ask an attorney."
      }
    ]
  },
  {
    category: "Booking & Payments",
    icon: Calendar,
    items: [
      {
        q: "What if I need to reschedule?",
        a: "We understand that workplace crises aren't always predictable. You can reschedule any consultation up to 4 hours before the session start time via your dashboard with no penalty."
      },
      {
        q: "Are there any hidden fees?",
        a: "No. The price you see on the service page is the total price. This includes your consultation, a written follow-up summary, and any templates provided by your advisor."
      }
    ]
  }
];

const AccordionItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className={`text-xl font-black transition-colors ${isOpen ? 'text-primary-violet' : 'text-primary-purple group-hover:text-primary-violet'}`}>
          {q}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-primary-violet text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary-violet/10 group-hover:text-primary-violet'}`}>
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-lg text-gray-500 font-medium leading-relaxed pt-6 pb-2">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const [query, setQuery] = useState("");
  const filtered = faqData
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="pt-24 pb-48">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-24 relative">
          <Scribble type="loop" className="absolute -top-10 left-10 w-32 h-32 text-secondary-pink/10" />
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-violet/10 text-primary-violet font-black text-sm mb-10 shadow-sm border border-primary-violet/10">
            <MessageCircle size={16} className="fill-current" />
            <span>WE HAVE ANSWERS</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-primary-purple mb-8">FAQs</h1>
          <p className="text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
            Everything you need to know about navigating your workplace journey with Humanly.
          </p>
          <div className="relative mx-auto mt-10 max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-violet" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search confidentiality, booking, payment, harassment..."
              className="w-full rounded-lg border border-primary-purple/10 bg-white py-5 pl-14 pr-5 text-primary-purple shadow-xl shadow-primary-purple/5 outline-none placeholder:text-primary-purple/35"
            />
          </div>
        </div>

        <div className="space-y-16">
          {filtered.map((section, si) => (
            <motion.section 
              key={si}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
              className="bg-white p-10 lg:p-16 rounded-[60px] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-50">
                 <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-violet">
                    <section.icon size={32} />
                 </div>
                 <h2 className="text-3xl font-black text-primary-purple uppercase tracking-tight">{section.category}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map((item, ii) => (
                  <AccordionItem key={ii} {...item} />
                ))}
              </div>
            </motion.section>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-lg bg-white p-10 text-center ring-1 ring-primary-purple/10">
              <p className="text-xl font-black text-primary-purple">No FAQ matches that search.</p>
              <p className="mt-2 text-primary-purple/58">Try a broader term or book a private consultation.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-32 bg-primary-purple p-16 rounded-[70px] text-white text-center relative overflow-hidden">
           <Scribble type="sparkle" className="absolute top-10 right-10 w-24 h-24 opacity-20" color="white" />
           <h3 className="text-3xl lg:text-4xl font-black mb-6">Still have a unique question?</h3>
           <p className="text-xl text-purple-200 mb-12 font-medium max-w-xl mx-auto">Our support team is here to help you discreetly.</p>
           <div className="flex flex-wrap gap-6 justify-center">
              <button className="px-12 py-5 bg-secondary-orange text-white font-black rounded-3xl text-lg shadow-xl hover:bg-orange-600 transition-colors">
                Message Support
              </button>
              <button className="px-12 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-3xl text-lg transition-colors border border-white/20">
                Email Us
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
