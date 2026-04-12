"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const studentLinks = [
    { 
      name: "Dashboard", 
      href: "/student/dashboard", 
      icon: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> 
    },
    { 
      name: "Available Jobs", 
      href: "/student/jobs", 
      icon: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> 
    }
  ];

  const businessLinks = [
    { 
      name: "Dashboard", 
      href: "/business/dashboard", 
      icon: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg> 
    },
    { 
      name: "Post Job", 
      href: "/business/post-job", 
      icon: <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
    }
  ];

  const links = role === "business" ? businessLinks : studentLinks;

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center" />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 font-sans selection:bg-orange-500/30">
      
      {/* Mobile Topbar for Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-lg shadow-md flex items-center justify-center font-bold text-white text-lg">W</div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">WorkHop</span>
        </div>
        <button className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
           </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
      `}>
         <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800/50">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center font-bold text-white text-xl border border-white/20">W</div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-xl">WorkHop</span>
         </div>
         
         <div className="p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Navigation</p>
            <nav className="space-y-2">
              {links.map((link) => {
                 const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/student/dashboard' && link.href !== '/business/dashboard');
                 return (
                   <Link 
                     key={link.name} 
                     href={link.href}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                     }`}
                   >
                      <span className={isActive ? "text-orange-500 drop-shadow-sm" : ""}>{link.icon}</span>
                      {link.name}
                   </Link>
                 )
              })}
            </nav>
         </div>

         <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Logged in as {role}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
           </div>
           
           <button 
             onClick={handleLogout}
             className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
           >
             <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             Sign Out
           </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 items-center justify-between px-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden lg:block">
            {role === "business" ? "Business Portal" : "Student Hub"}
          </h2>
          
          <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm ml-auto">
             <span className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
               {user?.email}
             </span>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-inner">
               {user?.email?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 md:p-10 relative">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
