"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const PageWrapper = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const MotionCard = ({ children, className = "", onClick }: { children: ReactNode, className?: string, onClick?: () => void }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`${className} hover:shadow-2xl transition-shadow duration-300`}
    >
      {children}
    </motion.div>
  );
};

export const MotionButton = ({ 
  children, 
  onClick, 
  disabled, 
  className = "", 
  type = "button" 
}: { 
  children: ReactNode, 
  onClick?: () => void, 
  disabled?: boolean, 
  className?: string,
  type?: "button" | "submit" | "reset"
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={className}
    >
      {children}
    </motion.button>
  );
};
