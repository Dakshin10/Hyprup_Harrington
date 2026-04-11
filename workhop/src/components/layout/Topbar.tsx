"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, CheckCircle, UserPlus, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Topbar = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulated notifications array
  const notifications = [
    { id: 1, type: "applicant", text: "New applicant for 'Moving boxes'", time: "2m ago", read: false },
    { id: 2, type: "completion", text: "Alex finished 'Grocery Delivery'", time: "1h ago", read: false },
    { id: 3, type: "urgent", text: "Worker unconfirmed for 'Event Setup'", time: "3h ago", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="hidden md:flex h-20 items-center justify-between px-10 bg-bg-main/80 backdrop-blur-md border-b border-white/10 z-10 sticky top-0">
      <h2 className="text-xl font-bold text-text-primary hidden lg:block">
        Business Portal
      </h2>

      <div className="flex items-center gap-6 ml-auto">
        
        {/* Notification System */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          >
            <Bell size={22} className="" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-error-text border-2 border-bg-main animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-brand-border rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-bg-main">
                  <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                  <button className="text-[10px] uppercase font-bold text-primary-500 hover:text-primary-400 transition-colors">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto bg-bg-card">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-4 border-b border-white/10 last:border-0 hover:bg-bg-hover cursor-pointer transition-colors flex gap-3 ${!n.read ? "bg-primary-500/10" : ""}`}>
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'applicant' ? 'bg-info-bg text-info-text' :
                          n.type === 'completion' ? 'bg-success-bg text-success-text' :
                          'bg-warning-bg text-warning-text'
                        }`}>
                          {n.type === 'applicant' && <UserPlus size={14} />}
                          {n.type === 'completion' && <CheckCircle size={14} />}
                          {n.type === 'urgent' && <Clock size={14} />}
                        </div>
                        <div>
                          <p className={`text-sm ${!n.read ? "font-bold text-text-primary" : "text-text-secondary"}`}>{n.text}</p>
                          <p className="text-xs text-text-muted mt-1">{n.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="p-3 text-center border-t border-white/10 bg-bg-main">
                   <button className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">View all activity</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border border-white/10 bg-white/5 pl-4 pr-1.5 py-1.5 rounded-full shadow-sm">
          <span className="text-sm font-medium text-text-secondary max-w-[150px] truncate">
            {user?.email}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-text-primary font-bold shadow-inner">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
