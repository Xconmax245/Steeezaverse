import { redirect } from "next/navigation";
import { getServerSessionClient } from "@/lib/supabase/server-session";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { LogOut, Package, User, Bell } from "lucide-react";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = getServerSessionClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Check if they are banned
  const { data: customer } = await supabase
    .from("customers")
    .select("*") // Use * to avoid TypeScript inference issues on missing columns
    .eq("id", session.user.id)
    .single();

  if ((customer as any)?.is_banned) {
    await supabase.auth.signOut();
    redirect("/login?error=banned");
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-32 pb-24 max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-32">
            <h2 className="font-chillax font-bold text-xl uppercase tracking-widest text-white mb-6">
              My Account
            </h2>
            
            <nav className="flex flex-col gap-2">
              <Link 
                href="/account/orders"
                className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors uppercase tracking-widest text-xs font-bold"
              >
                <Package size={16} /> Order History
              </Link>
              <Link 
                href="/account/profile"
                className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors uppercase tracking-widest text-xs font-bold"
              >
                <User size={16} /> Profile Settings
              </Link>
              <Link 
                href="/account/notifications"
                className="flex items-center gap-3 text-white/60 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-colors uppercase tracking-widest text-xs font-bold"
              >
                <Bell size={16} /> Notifications
              </Link>
            </nav>

            <div className="mt-8 pt-8 border-t border-white/10">
              <form action="/api/auth/signout" method="POST">
                <button 
                  type="submit"
                  className="flex items-center gap-3 text-sz-red/60 hover:text-sz-red px-4 py-3 rounded-xl hover:bg-sz-red/5 transition-colors uppercase tracking-widest text-xs font-bold w-full"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}
