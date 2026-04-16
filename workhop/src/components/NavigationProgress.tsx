"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Each pathname change = navigation complete
    setLoading(false);
    setProgress(100);
    const t = setTimeout(() => setProgress(0), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // Fake "in-progress" advance when link is clicked
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setProgress(20);
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 85) return p;
          return p + Math.random() * 12;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <AnimatePresence>
      {progress > 0 && progress < 100 && (
        <motion.div
          key="nav-bar"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: Math.min(progress / 100, 0.98) }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ originX: 0 }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 z-[200] shadow-[0_0_8px_#F97316]"
        />
      )}
      {progress === 100 && (
        <motion.div
          key="nav-complete"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 z-[200]"
        />
      )}
    </AnimatePresence>
  );
}
