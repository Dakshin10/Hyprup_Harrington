"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Use Cases", href: "#use-cases" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            W
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">WorkHop</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Auth Entry */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login"
            className="text-sm font-bold text-text-secondary hover:text-white transition-colors px-4"
          >
            Login
          </Link>
          <Link 
            href="/login"
            className="text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 group"
          >
            Get Started
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-bg-main z-[100] border-l border-white/10 shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="font-extrabold text-xl tracking-tight text-white">Menu</span>
                <button 
                  className="text-text-secondary hover:text-white transition-colors p-2 -mr-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col p-6 gap-6 overflow-y-auto flex-1 h-full">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-medium text-text-secondary hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                
                <hr className="border-white/5 my-2" />
                
                <div className="flex flex-col gap-4 mt-auto mb-8">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center text-lg font-medium text-white transition-colors w-full border border-white/20 rounded-xl hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 w-full"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
