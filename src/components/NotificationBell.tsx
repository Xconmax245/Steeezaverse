"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Poll every 60s
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white/80 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-sz-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-20 left-0 w-full sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-4 sm:w-80 bg-black/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top sm:origin-top-right transition-all">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-chillax font-bold uppercase tracking-widest text-sm text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] text-sz-red font-bold uppercase tracking-widest bg-sz-red/10 px-2 py-1 rounded-full">{unreadCount} new</span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="p-8 text-center text-white/50 text-xs uppercase tracking-widest">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-white/50 text-xs uppercase tracking-widest">No notifications yet</div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((n) => (
                  <Link 
                    href="/account/notifications" 
                    key={n.id}
                    onClick={() => setIsOpen(false)}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors block ${!n.is_read ? 'bg-white/[0.03]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-chillax uppercase tracking-widest ${!n.is_read ? 'font-bold text-white' : 'text-white/70'}`}>{n.title}</h4>
                      {!n.is_read && <span className="w-2 h-2 bg-sz-red rounded-full mt-1 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mt-1">{n.message}</p>
                    <span className="text-[10px] text-white/30 mt-3 block uppercase tracking-widest font-medium">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white/[0.02] border-t border-white/10 text-center hover:bg-white/[0.04] transition-colors">
            <Link 
              href="/account/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-chillax font-bold text-white/70 hover:text-white uppercase tracking-widest"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
