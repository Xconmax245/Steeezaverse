import { getServerSessionClient } from "@/lib/supabase/server-session";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Order History — Steezaverse",
};

export default async function AccountOrdersPage() {
  const supabase = getServerSessionClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id, quantity, unit_price, product_name_snapshot, variant_snapshot
      )
    `)
    .eq("customer_id", session.user.id)
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
        <h3 className="font-chillax font-bold uppercase tracking-widest text-xl mb-4 text-white">No Orders Yet</h3>
        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
          When you secure pieces from Steezaverse, your order history and tracking information will appear here.
        </p>
        <Link 
          href="/shop"
          className="inline-block bg-white text-black font-bold uppercase tracking-widest px-8 py-3 rounded text-sm hover:bg-white/90 transition-colors"
        >
          Explore Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order: any) => {
        const isPaid = order.payment_status === "paid";
        
        let statusBadge = null;
        if (order.status === "pending") statusBadge = <span className="bg-white/10 text-white/60 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Pending</span>;
        else if (order.status === "processing") statusBadge = <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Processing</span>;
        else if (order.status === "shipped") statusBadge = <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Shipped</span>;
        else if (order.status === "delivered") statusBadge = <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Delivered</span>;
        else if (order.status === "cancelled") statusBadge = <span className="bg-sz-red/20 text-sz-red px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Cancelled</span>;

        return (
          <div key={order.id} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-white/[0.02] border-b border-white/5 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white uppercase tracking-widest text-sm">
                    Order {order.order_number}
                  </h3>
                  {statusBadge}
                </div>
                <div className="text-white/40 text-xs uppercase tracking-widest">
                  {new Date(order.created_at).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-chillax font-bold text-white tracking-widest">
                  ₦{order.total.toLocaleString("en-NG")}
                </div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
                  {order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0} items
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 divide-y divide-white/5">
              {order.order_items?.map((item: any) => {
                const variant = item.variant_snapshot;
                const img = variant?.image_urls?.[0];
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="w-16 h-20 bg-black/50 rounded overflow-hidden relative border border-white/5 flex-shrink-0">
                      {img && <Image src={img} alt={item.product_name_snapshot} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white uppercase tracking-widest truncate">
                        {item.product_name_snapshot}
                      </h4>
                      <div className="text-white/50 text-xs mt-1 uppercase tracking-widest">
                        {variant?.color} / {variant?.size} &times; {item.quantity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!isPaid && order.status !== "cancelled" && (
              <div className="bg-sz-red/10 border-t border-sz-red/20 p-4 flex items-center justify-between">
                <span className="text-sz-red text-xs uppercase tracking-widest font-bold">Payment Failed or Pending</span>
                <Link 
                  href={`/checkout/confirmation/${order.id}`}
                  className="bg-sz-red text-white px-4 py-2 rounded text-[10px] uppercase tracking-widest font-bold hover:bg-sz-red-dim transition-colors"
                >
                  Retry Payment
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
