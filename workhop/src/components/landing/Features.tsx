"use client";

import { motion } from "framer-motion";
import { MapPin, Zap, Circle, ShieldCheck, CreditCard, FastForward } from "lucide-react";

const features = [
  {
    icon: <MapPin size={22} />,
    title: "Location-based Matching",
    desc: "Jobs and students are matched using high-precision geospatial coordinates for perfect convenience.",
    color: "text-primary-500 bg-primary-500/10",
  },
  {
    icon: <Zap size={22} />,
    title: "One-Tap Application",
    desc: "Apply with a single tap. No resumes or long forms needed—speed is our first priority.",
    color: "text-yellow-400 bg-yellow-400/10",
  },
  {
    icon: <Circle size={22} className="fill-green-400" />,
    title: '"Available Now" System',
    desc: "Real-time status tracking shows exactly who is ready to work right now in your immediate area.",
    color: "text-green-400 bg-green-400/10",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Reliable Worker Tracking",
    desc: "Secure check-ins and performance ratings ensure high-quality help every single time.",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    icon: <CreditCard size={22} />,
    title: "Instant Earnings Tracking",
    desc: "Watch your earnings grow in real-time as you complete micro-jobs across the neighborhood.",
    color: "text-emerald-400 bg-emerald-400/10",
  },
  {
    icon: <FastForward size={22} />,
    title: "Instant Hiring",
    desc: "Businesses find help in minutes, not days. Built for the speed of modern hyperlocal labor.",
    color: "text-purple-400 bg-purple-400/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="text-purple-400 font-bold text-sm uppercase tracking-widest">Features</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mt-3">
            Built for speed & trust
          </h2>
          <p className="text-text-muted mt-4 text-lg max-w-xl mx-auto">
            Every feature is designed to make hiring and earning as frictionless as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.18 } }}
              className="group p-7 rounded-3xl bg-bg-card border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl transition-all cursor-default"
            >
              <div className={`inline-flex p-3 rounded-2xl ${f.color} mb-5 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
