"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-tr from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 border border-orange-500/50",
  secondary:
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white",
  danger:
    "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20",
  success:
    "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:bg-emerald-600 border border-emerald-500/50",
  outline:
    "bg-transparent border border-brand-border text-brand-text-secondary hover:border-secondary hover:text-secondary",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const defaultScale = disabled || isLoading ? 1 : 0.98;
    const defaultHover = disabled || isLoading ? 1 : 1.02;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: defaultHover }}
        whileTap={{ scale: defaultScale }}
        disabled={disabled || isLoading}
        className={cn(
          "relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:ring-orange-500",
          variantStyles[variant],
          fullWidth && "w-full",
          (disabled || isLoading) && "opacity-60 cursor-not-allowed shadow-none",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && (children as React.ReactNode)}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
