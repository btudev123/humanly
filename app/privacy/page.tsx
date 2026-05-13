"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { Shield, Lock, Eye, FileText, Server, UserCheck } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      title: "Radical Confidentiality",
      icon: Shield,
      content: "Your privacy is our core value. We do not share your identity, workplace concerns, or session transcripts with your employer or any third party without your explicit, written consent."
    },
    {
      title: "Data Encryption",
      icon: Lock,
      content: "All profile data and message drafts are encrypted at rest and in transit. Our servers use bank-grade security protocols to ensure your information remains yours alone."
    },
    {
      title: "Anonymous Browsing",
      icon: Eye,
      content: "You can browse our resource library and use our AI advisor tools anonymously. We only require personal information when you decide to book a formal consultation."
    },
    {
      title: "Limited Retention",
      icon: FileText,
      content: "We only retain data for as long as necessary to provide our services. You can request a full data wipe at any time through your dashboard settings."
    }
  ];

  return (
    <div className="pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <header className="text-center mb-24 relative">
          <Scribble type="sparkle" className="absolute -top-10 left-0 w-24 h-24 text-secondary-orange/30" />
          <h1 className="text-6xl font-black text-primary-purple mb-8">Privacy Policy</h1>
          <p className="text-2xl text-gray-500 font-medium leading-relaxed">
            Because in the modern workplace, <span className="relative inline-block text-primary-violet px-2 italic">confidentiality</span> is your greatest asset.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[50px] shadow-2xl border border-gray-100 p-12 lg:p-20 space-y-16"
        >
          <div className="grid md:grid-cols-2 gap-12">
            {sections.map((section, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-primary-violet/10 rounded-2xl flex items-center justify-center text-primary-violet">
                  <section.icon size={24} />
                </div>
                <h2 className="text-2xl font-black text-primary-purple">{section.title}</h2>
                <p className="text-gray-500 font-medium leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="pt-16 border-t border-gray-100">
            <h3 className="text-xl font-black text-primary-purple mb-6">1. Information We Collect</h3>
            <p className="text-gray-600 font-medium mb-8">
              We collect minimal information necessary to facilitate consultations: full name, contact email, and billing information (processed securely through Stripe). We do not scrape your workplace data or social media profiles.
            </p>

            <h3 className="text-xl font-black text-primary-purple mb-6">2. Third-Party Services</h3>
            <div className="bg-gray-50 p-8 rounded-3xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#6772e5]">
                  <Server size={20} />
                </div>
                <span className="font-bold text-gray-700">Payment Gateway: Stripe</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-primary-violet">
                   <UserCheck size={20} />
                </div>
                <span className="font-bold text-gray-700">Authentication: Secure Token System</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 text-center">
          <Scribble type="loop" className="mx-auto w-24 h-24 text-secondary-pink/20 mb-8" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Last Updated: May 15, 2026</p>
        </div>
      </div>
    </div>
  );
}
