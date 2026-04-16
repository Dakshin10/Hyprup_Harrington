"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, X } from "lucide-react";

type Role = "student" | "business";

const menu = {
  student: [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Jobs", path: "/student/jobs" },
    { name: "Profile", path: "/student/profile" },
  ],
  business: [
    { name: "Dashboard", path: "/business/dashboard" },
    { name: "Post Job", path: "/business/post-job" },
    { name: "My Jobs", path: "/business/jobs" },
    { name: "Profile", path: "/business/profile" },
  ],
};

export default function Sidebar({ role, onClose }: { role: Role; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#020617] border-r border-gray-800 p-6 flex flex-col h-screen overflow-y-auto shrink-0 shadow-2xl lg:shadow-none relative">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-500/20">W</div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">WorkHop</h1>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="space-y-2 flex-1">
        {menu[role].map((item) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== `/${role}/dashboard`);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`block px-4 py-3.5 rounded-xl transition-all font-semibold text-sm sm:text-base ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center sm:justify-start gap-3 px-4 py-3.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-semibold"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
        
        <Link href="/" className="block text-center text-sm text-gray-500 hover:text-white transition py-2">
          ← Back to Landing Page
        </Link>
      </div>
    </aside>
  );
}
