"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RoleSwitch from "@/components/RoleSwitch";
import { Menu } from "lucide-react";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar role="business" onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <header className="p-4 lg:p-6 border-b border-gray-800 flex justify-between items-center bg-[#020617] relative z-10 w-full">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Business Portal</h2>
          </div>
          <RoleSwitch />
        </header>
        
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:p-6 md:p-10 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
