"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Menu, X } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import NavigationProgress from "@/components/layout/NavigationProgress";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center" />;
  }

  return (
    <>
      <NavigationProgress />
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans selection:bg-orange-500/30">

      {/* Mobile Topbar for Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-lg shadow-md flex items-center justify-center font-bold text-white text-lg">W</div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">WorkHop</span>
        </div>
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 md:p-10 relative">
          <div className="max-w-6xl mx-auto space-y-6 flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      </div>
    </>
  );
};
