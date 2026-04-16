"use client";

import { motion } from "framer-motion";
import { PlusCircle, Search, Wallet } from "lucide-react";

const steps = [
  {
    icon: <PlusCircle size={32} className="text-primary-500" />,
    title: "Business Posts a Job",
    desc: "Set the task, location, and fair hourly pay. It takes less than 60 seconds.",
    color: "bg-primary-500/10 border-primary-500/20"
  },
  {
    icon: <Search size={32} className="text-teal-400" />,
    title: "Students Discover & Apply",
    desc: "See nearby jobs on a live map. Apply with a single tap—no resumes needed.",
    color: "bg-teal-500/10 border-teal-500/20"
  },
  {
    icon: <Wallet size={32} className="text-green-400" />,
    title: "Work & Earn",
    desc: "Complete the task, get verified instantly, and track your earnings in real-time.",
    color: "bg-green-500/10 border-green-500/20"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-text-muted font-bold text-sm uppercase tracking-widest">The Process</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-3">
            Simple steps to get started
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`p-8 rounded-[2.5rem] bg-bg-card border ${step.color} shadow-xl hover:shadow-primary-500/5 transition-all`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {step.desc}
              </p>
              
              <div className="mt-8 flex items-center gap-2">
                <span className="text-sm font-black text-white/20">0{i + 1}</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
