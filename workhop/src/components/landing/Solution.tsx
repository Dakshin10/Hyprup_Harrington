"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Post a job in seconds",
    desc: "Businesses fill in title, duration, pay, and location. No lengthy forms. Live in under 30 seconds.",
    color: "from-primary-500 to-orange-400",
    shadow: "shadow-primary-500/20",
  },
  {
    num: "02",
    title: "Students apply instantly",
    desc: "Nearby students on the platform see the listing and apply with one tap. No cover letters. No calls.",
    color: "from-teal-500 to-cyan-400",
    shadow: "shadow-teal-500/20",
  },
  {
    num: "03",
    title: "Hire in minutes",
    desc: "The business reviews applicants, picks the best match, and confirms. The worker shows up and gets paid.",
    color: "from-purple-500 to-violet-400",
    shadow: "shadow-purple-500/20",
  },
];

export default function Solution() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent via-bg-card/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="text-teal-400 font-bold text-sm uppercase tracking-widest">The Solution</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mt-3">
            WorkHop bridges the gap
          </h2>
          <p className="text-text-muted mt-4 text-lg max-w-xl mx-auto">
            A hyperlocal platform that connects students and businesses for short, flexible, paid work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-primary-500 via-teal-500 to-purple-500 opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative p-8 rounded-3xl bg-bg-card border border-white/10 shadow-xl ${step.shadow} hover:border-white/20 transition-colors`}
            >
              {/* Number badge */}
              <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} items-center justify-center font-extrabold text-white text-lg shadow-lg mb-6`}>
                {step.num}
              </div>

              <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>
              <p className="text-text-muted leading-relaxed">{step.desc}</p>

              <div className="mt-6 flex items-center gap-2 text-success-text text-sm font-semibold">
                <CheckCircle size={16} />
                <span>Works every time</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
