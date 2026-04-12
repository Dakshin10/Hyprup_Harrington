"use client";

import { motion } from "framer-motion";

const steps = [
  { label: "Business", action: "Posts job", detail: "Patel Store needs 2 helpers for Diwali rush • ₹450 • 3 hrs", side: "biz", color: "bg-primary-500" },
  { label: "Students", action: "Apply instantly", detail: "3 nearby students apply within 5 minutes", side: "student", color: "bg-teal-500" },
  { label: "Business", action: "Selects best fit", detail: "Raj (98% reliability, 4.9⭐) is selected — gets notified", side: "biz", color: "bg-primary-500" },
  { label: "Raj", action: "Checks in via QR", detail: "Scans QR code at store — work begins at 11 AM", side: "student", color: "bg-teal-500" },
  { label: "Job done", action: "Payment released", detail: "Raj earns ₹450 in 3 hours. Business saves ₹2000 vs agency.", side: "biz", color: "bg-success-text" },
];

export default function DemoFlow() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent via-bg-card/20 to-transparent">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="text-teal-400 font-bold text-sm uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mt-3">
            From post to payment in hours
          </h2>
        </motion.div>

        {/* Real-world scenario banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-12 p-6 bg-gradient-to-r from-primary-500/10 via-orange-500/5 to-primary-500/10 border border-primary-500/20 rounded-2xl text-center"
        >
          <p className="text-text-muted text-sm mb-1">Real-world scenario</p>
          <p className="text-xl font-bold text-text-primary">
            🪔 Diwali Rush — Patel Grocery Store, Andheri
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Sudden customer surge. Need 2 extra helpers. Right now.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500 via-teal-500 to-success-text opacity-30" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative flex gap-6 pb-8 last:pb-0"
            >
              {/* Dot */}
              <div className={`relative z-10 w-16 h-16 shrink-0 rounded-2xl ${step.color} flex items-center justify-center text-white font-extrabold text-sm shadow-lg`}>
                {i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 bg-bg-card border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{step.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">step {i + 1}</span>
                </div>
                <h4 className="font-bold text-text-primary text-lg">{step.action}</h4>
                <p className="text-text-muted text-sm mt-1">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: "Time to hire", value: "< 15 min" },
            { label: "Student earned", value: "₹450" },
            { label: "Business saved", value: "₹1,550" },
          ].map((s) => (
            <div key={s.label} className="p-5 bg-bg-card border border-white/10 rounded-2xl">
              <p className="text-2xl font-extrabold text-primary-500">{s.value}</p>
              <p className="text-text-muted text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
