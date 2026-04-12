"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, PlusCircle, Briefcase, ClipboardList, LogOut, Store } from "lucide-react";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  onLogout: () => void;
}

export const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, onLogout }: SidebarProps) => {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const businessLinks = [
    { name: "Dashboard",  href: "/business/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Post Job",   href: "/business/post-job",  icon: <PlusCircle size={20} /> },
    { name: "My Jobs",    href: "/business/jobs",      icon: <ClipboardList size={20} /> },
    { name: "Profile",    href: "/business/profile",   icon: <Store size={20} /> },
  ];

  return (
    <aside
      className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 bg-bg-main border-r border-white/10 w-64 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
      `}
    >
      <div className="hidden md:flex items-center gap-3 p-6 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center font-bold text-white text-xl border border-white/20">
          W
        </div>
        <span className="font-extrabold text-text-primary tracking-tight text-xl">
          WorkHop
        </span>
      </div>

      <div className="p-0">
        <p className="px-6 mt-6 text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Navigation</p>
        <nav className="space-y-1">
          {businessLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/business/dashboard');
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold transition-all ${isActive
                    ? "bg-primary-500/10 text-primary-500 border-l-[3px] border-primary-500"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover border-l-[3px] border-transparent"
                  }`}
              >
                <span className={isActive ? "text-primary-500" : ""}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/10">
        <div className="bg-white/5 p-4 rounded-xl mb-4 border border-white/10">
          <p className="text-xs uppercase font-bold text-text-muted mb-1">Logged in as {role}</p>
          <p className="text-sm font-bold text-text-primary truncate">{user?.email}</p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-white/10 text-sm font-bold text-text-secondary hover:bg-white/5 hover:text-error-text transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
