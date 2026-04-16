"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-16 px-6 border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                W
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">WorkHop</span>
            </Link>
            <p className="text-text-muted text-sm max-w-sm leading-relaxed">
              The intelligent hyperlocal micro-job platform empowering students to build skills while helping local businesses thrive.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><a href="#how-it-works" className="hover:text-primary-500 transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-primary-500 transition-colors">Features</a></li>
              <li><a href="#use-cases" className="hover:text-primary-500 transition-colors">Use Cases</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li><Link href="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} WorkHop. Built for hackathon demo.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
