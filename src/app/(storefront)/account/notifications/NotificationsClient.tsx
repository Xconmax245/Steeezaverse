"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Bell, CheckCircle2, Package, ArrowRight, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  customer_id?: string;
  order_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await (supabase as any).rpc("mark_notification_read", { notification_id: id });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    for (const id of unreadIds) {
      try {
        await (supabase as any).rpc("mark_notification_read", { notification_id: id });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-chillax text-3xl sm:text-4xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
              <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-sz-red" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-sz-red/20 text-sz-red border border-sz-red/40 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-white/50 text-xs sm:text-sm uppercase tracking-widest mt-2">
            Your orders, status updates, and drop announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sz-red" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/50 font-chillax uppercase tracking-widest text-sm">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col gap-6">
          <div className="text-center py-16 px-6 bg-white/[0.02] rounded-2xl border border-white/5">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Bell className="w-7 h-7 text-white/40" />
            </div>
            <h3 className="font-chillax text-xl font-bold uppercase tracking-widest text-white mb-2">
              All Caught Up
            </h3>
            <p className="text-white/50 text-sm max-w-md mx-auto">
              You don&apos;t have any active notifications right now. Order updates, drop alerts, and exclusive announcements will appear here.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/shop"
                className="bg-white text-black px-6 py-3 rounded-full font-chillax font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors"
              >
                Explore Shop
              </Link>
              <Link
                href="/drops"
                className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full font-chillax font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-sz-red" /> Latest Drops
              </Link>
            </div>
          </div>

          {/* Quick Order Tracking Card */}
          <div className="bg-[#110505]/60 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sz-red/10 border border-sz-red/30 flex items-center justify-center text-sz-red shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-chillax font-bold uppercase tracking-wider text-sm text-white">
                  Looking for an order?
                </h4>
                <p className="text-white/50 text-xs mt-0.5">
                  Track the real-time shipping status and updates for any recent order.
                </p>
              </div>
            </div>
            <Link
              href="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sz-red text-white px-5 py-2.5 rounded-xl font-chillax font-bold uppercase tracking-widest text-xs hover:bg-sz-red/90 transition-colors shrink-0"
            >
              Track Order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                !n.is_read
                  ? "bg-white/[0.05] border-white/20 shadow-lg shadow-black/40"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-4">
                <h3
                  className={`font-chillax uppercase tracking-widest text-base ${
                    !n.is_read ? "font-bold text-white" : "text-white/80"
                  }`}
                >
                  {n.title}
                </h3>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </span>
                  {!n.is_read && <span className="w-2.5 h-2.5 bg-sz-red rounded-full"></span>}
                </div>
              </div>
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  !n.is_read ? "text-white/90" : "text-white/50"
                }`}
              >
                {n.message}
              </p>
              {n.order_id && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href="/track"
                    className="inline-flex items-center gap-2 text-xs text-sz-red hover:text-white transition-colors uppercase tracking-widest font-chillax font-bold"
                  >
                    <Package className="w-3.5 h-3.5" /> Track Order Status
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
