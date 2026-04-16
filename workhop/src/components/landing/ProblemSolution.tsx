"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const ProblemSolution = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* PROBLEM SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <AlertCircle size={14} />
              The Pain Points
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">
              Traditional hiring is <br />
              <span className="text-red-500 font-black">broken</span> for short tasks.
            </h2>
            
            <div className="space-y-6">
              {[
                "Businesses struggle to find quick workers",
                "Students want flexible income but can't find it",
                "Hiring is slow, unreliable, and paperwork-heavy"
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 text-xs font-bold">
                    ✕
                  </div>
                  <p className="text-text-secondary text-lg">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SOLUTION SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-primary-500/15 via-primary-500/5 to-transparent border border-primary-500/30 relative"
          >
            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 blur-[80px] rounded-full" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <CheckCircle2 size={14} />
              The WorkHop Solution
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8 leading-tight">
              Hyperlocal matching built for <br />
              <span className="bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent font-black">instant speed.</span>
            </h2>
            
            <div className="space-y-6">
              {[
                "Post a job in seconds from your phone",
                "Find verified workers nearby instantly",
                "Zero resumes, zero delays, zero stress"
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold border border-primary-500/30">
                    ✓
                  </div>
                  <p className="text-text-primary text-lg font-medium">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
