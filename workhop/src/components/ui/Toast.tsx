"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { ToastState } from "@/hooks/useToast";

const icons = {
  success: <CheckCircle size={18} className="text-success-text shrink-0" />,
  error: <XCircle size={18} className="text-error-text shrink-0" />,
  info: <Info size={18} className="text-info-text shrink-0" />,
};

const styles = {
  success: "border-success-text/30 bg-[#0a1f17]",
  error: "border-error-text/30 bg-[#1a0a0a]",
  info: "border-info-text/30 bg-[#0a1128]",
};

interface ToastContainerProps {
  toasts: ToastState[];
  dismiss: (id: number) => void;
}

export const ToastContainer = ({ toasts, dismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
              border shadow-2xl backdrop-blur-md min-w-[260px] max-w-[340px]
              ${styles[t.type]}
            `}
          >
            {icons[t.type]}
            <span className="text-sm font-semibold text-text-primary flex-1">
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-muted hover:text-text-primary transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
