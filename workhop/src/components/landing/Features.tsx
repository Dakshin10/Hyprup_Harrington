"use client";

import { motion } from "framer-motion";
import { MapPin, Zap, Calendar, Star, CreditCard, ToggleRight } from "lucide-react";

const features = [
  {
    icon: <MapPin size={22} />,
    title: "Hyperlocal Matching",
    desc: "Jobs and students are matched within 2–5km radius for maximum convenience and reliability.",
    color: "text-primary-500 bg-primary-500/10",
  },
  {
    icon: <Zap size={22} />,
    title: "Instant Apply",
    desc: "Students apply with one tap. No forms, no cover letters. Faster than ordering food.",
    color: "text-yellow-400 bg-yellow-400/10",
  },
  {
    icon: <Calendar size={22} />,
    title: "Scheduled Jobs",
    desc: "Plan ahead or post last-minute. WorkHop handles both instant and future hiring seamlessly.",
    color: "text-teal-400 bg-teal-400/10",
  },
  {
    icon: <Star size={22} />,
    title: "Ratings & Trust",
    desc: "Both parties rate each other after every job. Reliability scores ensure only the best show up.",
    color: "text-amber-400 bg-amber-400/10",
  },
  {
    icon: <CreditCard size={22} />,
    title: "Quick Payments",
    desc: "Track payment status in real-time. Businesses mark paid, students see it instantly.",
    color: "text-green-400 bg-green-400/10",
  },
  {
    icon: <ToggleRight size={22} />,
    title: "Availability Toggle",
    desc: "Students can flip their availability on/off to get matched faster when they want extra income.",
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
