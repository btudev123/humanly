"use client";

import { motion } from "motion/react";
import { Scribble } from "@/components/ui/Scribble";
import { Users, Heart, Shield, Sparkles, Zap, BrainCircuit } from "lucide-react";


export default function About() {
  return (
    <div className="pb-32">
      <section className="pt-24 pb-32 bg-primary-violet text-white relative overflow-hidden">
        <Scribble type="sparkle" className="absolute top-10 right-10 w-48 h-48 opacity-20" color="white" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl lg:text-8xl font-black mb-12 leading-tight"
          >
            Humanizing the <br /> <span className="text-secondary-orange italic underline decoration-secondary-pink decoration-[8px] underline-offset-8">corporate</span> machine.
          </motion.h1>
          <p className="text-2xl text-purple-100 font-medium max-w-3xl mx-auto leading-relaxed">
            Humanly started with a simple belief: no employee should ever feel alone when facing workplace challenges. We combine human empathy with AI-powered clarity.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-20 items-center">
        <div className="relative">
           <div className="rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
                alt="Our Team" 
                className="w-full h-[600px] object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
           </div>
           <Scribble type="circle" className="absolute -bottom-10 -right-10 w-48 h-48 text-secondary-orange/30" />
        </div>

        <div className="space-y-12">
           <h2 className="text-5xl text-primary-purple font-black">Our radical mission.</h2>
           <p className="text-xl text-gray-500 font-medium leading-relaxed">
              In a world where HR departments exist primarily to protect organizations, we exist to protect the human being. We provide the neutral, confidential space that the modern workplace is missing.
           </p>

           <div className="space-y-8">
              {[
                { title: "Empowerment", desc: "We give you the tools and language to advocate for yourself.", icon: Zap, color: "text-secondary-orange" },
                { title: "Neutrality", desc: "We have no stake in your company's politics.", icon: Shield, color: "text-primary-violet" },
                { title: "Innovation", desc: "We use AI to help you draft messages and understand complex laws.", icon: BrainCircuit, color: "text-secondary-pink" }
              ].map((value, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center ${value.color} group-hover:scale-110 transition-transform shadow-sm`}>
                      <value.icon size={28} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-primary-purple mb-1">{value.title}</h4>
                      <p className="text-gray-500 font-medium">{value.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <section className="bg-gray-50 py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
           <Scribble type="sparkle" className="mx-auto w-24 h-24 text-secondary-orange/30 mb-8" />
           <h2 className="text-5xl text-primary-purple font-black mb-20 text-center">The values we live by.</h2>
           
           <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all">
                 <Heart className="text-secondary-pink mb-8" size={48} fill="currentColor" opacity={0.2} />
                 <h3 className="text-2xl font-black text-primary-purple mb-4">Radical Empathy</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">We listen without judgment. Your perspective is the one that matters most.</p>
              </div>
              <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all">
                 <Users className="text-primary-violet mb-8" size={48} fill="currentColor" opacity={0.2} />
                 <h3 className="text-2xl font-black text-primary-purple mb-4">People First</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">Before roles, titles, or performance scores, there is a human being.</p>
              </div>
              <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all">
                 <Sparkles className="text-secondary-orange mb-8" size={48} fill="currentColor" opacity={0.2} />
                 <h3 className="text-2xl font-black text-primary-purple mb-4">Pure Clarity</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">We cut through the legalities and corporate double-speak to tell you the truth.</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
