"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Bell, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/shop"); // Or a login page if we had one
      return;
    }

    const { data, error } = await supabase
      .from("customer_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await (supabase as any).rpc('mark_notification_read', { notification_id: id });
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    for (const id of unreadIds) {
       await (supabase as any).rpc('mark_notification_read', { notification_id: id });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-[#050505] text-white flex justify-center">
      <div className="max-w-3xl w-full flex flex-col gap-10">
        <div className="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-sz-red" />
              Notifications
            </h1>
            <p className="text-white/50 text-sm uppercase tracking-widest">Your updates and order tracking</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/50 font-chillax uppercase tracking-widest">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-white/5">
            <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="font-chillax text-xl font-bold uppercase tracking-widest mb-2">All Caught Up</h3>
            <p className="text-white/50">You don&apos;t have any notifications yet.</p>
            <Link 
              href="/shop"
              className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-full font-chillax font-bold uppercase tracking-widest text-xs hover:bg-white/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  !n.is_read 
                    ? "bg-white/[0.05] border-white/20" 
                    : "bg-transparent border-white/5 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-chillax uppercase tracking-widest ${!n.is_read ? 'font-bold text-white' : 'text-white/80'}`}>
                    {n.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                    {!n.is_read && <span className="w-2.5 h-2.5 bg-sz-red rounded-full flex-shrink-0"></span>}
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-white/90' : 'text-white/50'}`}>
                  {n.message}
                </p>
                {n.order_id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Link 
                      href="/account/orders" // Or individual order tracking page if built
                      className="text-xs text-white hover:text-sz-red transition-colors uppercase tracking-widest underline decoration-white/20 underline-offset-4"
                    >
                      View Order Details
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
