"use client";

import { motion } from "framer-motion";
import { GraduationCap, Building2 } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const problems = [
  {
    side: "Students",
    icon: <GraduationCap size={28} />,
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
    iconColor: "text-primary-500 bg-primary-500/10",
    points: [
      "No flexible short-duration jobs",
      "Campus jobs are limited & competitive",
      "Hard to earn between classes",
      "Long applications & hiring delays",
    ],
  },
  {
    side: "Businesses",
    icon: <Building2 size={28} />,
    color: "from-teal-500/20 to-teal-500/5 border-teal-500/20",
    iconColor: "text-teal-400 bg-teal-500/10",
    points: [
      "Can't find reliable help for short tasks",
      "Full-time hiring is too expensive",
      "Emergency staff shortage during peak times",
      "Slow traditional recruitment process",
    ],
  },
];

export default function Problem() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="text-primary-500 font-bold text-sm uppercase tracking-widest">The Problem</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mt-3">
            A gap that hurts everyone
          </h2>
          <p className="text-text-muted mt-4 text-lg max-w-xl mx-auto">
            Students need flexible income. Businesses need flexible help. They're 2km apart — but can't find each other.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {problems.map((p, i) => (
            <motion.div
              key={p.side}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border bg-gradient-to-br ${p.color} backdrop-blur-sm`}
            >
              <div className={`inline-flex p-3 rounded-2xl ${p.iconColor} mb-5`}>
                {p.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">{p.side}</h3>
              <ul className="space-y-3">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-text-secondary">
                    <span className="mt-1 w-5 h-5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
                      ✕
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Gap visual */}
        <motion.div
          {...fadeUp}
          className="mt-12 text-center p-6 bg-bg-card border border-white/10 rounded-2xl"
        >
          <p className="text-text-muted text-sm mb-2">The painful reality</p>
          <p className="text-2xl font-extrabold text-text-primary">
            Businesses waste <span className="text-error-text">₹40,000+</span> per month on understaffing
          </p>
          <p className="text-text-muted text-sm mt-2">
            while students earn <span className="text-error-text">₹0</span> in their free afternoon hours.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
