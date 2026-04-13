"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const floatingCards = [
  { title: "Store Helper", pay: "₹450", time: "2 hrs", tag: "Urgent 🔥", color: "from-orange-500/20 to-orange-600/5" },
  { title: "Event Staff", pay: "₹600", time: "3 hrs", tag: "High Pay 💰", color: "from-teal-500/20 to-teal-600/5" },
  { title: "Delivery Run", pay: "₹300", time: "1 hr", tag: "Short ⏱", color: "from-purple-500/20 to-purple-600/5" },
];

const cardVariants = {
  initial: { opacity: 0, y: 40 },
  animate: (i: number) => ({
    opacity: 1,
    y: [0, -10, 0],
    transition: {
      opacity: { duration: 0.5, delay: i * 0.15 },
      y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 },
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">

      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-primary-500/20 via-primary-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-teal-500/15 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-gradient-radial from-purple-500/10 to-transparent blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT — Copy */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            🚀 Hiring in minutes, not days
          </motion.div>

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-text-primary leading-[1.1] tracking-tight">
            Find Work.{" "}
            <span className="bg-gradient-to-r from-primary-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Hire Fast.
            </span>
            <br />
            WorkHop.
          </h1>

          <p className="text-xl text-text-secondary max-w-lg leading-relaxed">
            Connect college students with nearby businesses for quick, flexible jobs.{" "}
            <span className="text-text-primary font-semibold">1–3 hours. Right now.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-shadow text-lg"
              >
                Get Started →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 text-text-secondary hover:text-text-primary hover:border-white/30 font-semibold rounded-2xl transition text-lg backdrop-blur-sm"
              >
                Explore Jobs ↓
              </a>
            </motion.div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 text-sm text-text-muted pt-2">
            <div className="flex items-center gap-2">
              <span className="text-success-text font-bold text-base">500+</span>
              <span>Students</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-primary-500 font-bold text-base">120+</span>
              <span>Businesses</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-warning-text font-bold text-base">2h</span>
              <span>Avg. hire time</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Floating job cards */}
        <div className="relative h-[420px] hidden lg:flex items-center justify-center">
          {floatingCards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              style={{
                position: "absolute",
                top: `${15 + i * 28}%`,
                left: `${i % 2 === 0 ? 5 : 35}%`,
                zIndex: floatingCards.length - i,
              }}
              className={`w-56 p-4 rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} backdrop-blur-md shadow-xl`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                  {card.tag}
                </span>
                <span className="text-xs text-text-muted">Live</span>
              </div>
              <p className="font-bold text-text-primary">{card.title}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-success-text font-bold">{card.pay}</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">{card.time}</span>
              </div>
              <button className="mt-3 w-full py-1.5 bg-primary-500/90 text-white text-xs font-bold rounded-lg">
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
