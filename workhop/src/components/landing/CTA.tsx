"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden p-12 md:p-16 rounded-[2.5rem] border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-bg-card to-orange-500/5 text-center shadow-2xl"
        >
          {/* Glowing orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-6"
            >
              🚀
            </motion.div>

            <h2 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-text-primary mb-6 leading-tight">
              Start earning or hiring
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-yellow-400 bg-clip-text text-transparent">
                in minutes.
              </span>
            </h2>

            <p className="text-text-secondary text-xl mb-10 max-w-xl mx-auto">
              Join 500+ students and 120+ businesses already using WorkHop to get things done — fast.
            </p>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xl font-extrabold rounded-2xl shadow-2xl shadow-primary-500/40 hover:shadow-primary-500/60 transition-shadow"
              >
                Get Started Free →
              </Link>
            </motion.div>

            <p className="text-text-muted text-sm mt-6">
              No credit card required • Free to sign up • Takes 30 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
