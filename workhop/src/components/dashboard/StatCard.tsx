"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = "text-brand-text-primary",
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-bg-card p-4 sm:p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col justify-between hover:border-primary-500/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary font-bold uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-end gap-2 text-text-primary">
        <span className={`text-4xl font-extrabold ${colorClass}`}>{value}</span>
      </div>
    </motion.div>
  );
});
