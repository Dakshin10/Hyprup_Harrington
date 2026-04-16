"use client";

import Sidebar from "@/components/Sidebar";
import RoleSwitch from "@/components/RoleSwitch";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("Business Layout Rendering");
  return (
    <div className="flex h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <Sidebar role="business" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Portal</h2>
          <RoleSwitch />
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
