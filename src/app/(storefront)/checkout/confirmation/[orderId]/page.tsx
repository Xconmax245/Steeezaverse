import { getSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import ClearCartOnSuccess from "./ClearCartOnSuccess";
import MagicLinkPrompt from "@/components/MagicLinkPrompt";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { data: order } = await (getSupabaseAdmin() as any)
    .from("orders")
    .select(`
      *,
      order_items (
        id, quantity, unit_price, product_name_snapshot, variant_snapshot
      ),
      addresses (
        full_name, line1, line2, city, state, phone
      ),
      customers(email)
    `)
    .eq("id", params.orderId)
    .single();

  if (!order) {
    redirect("/");
  }

  const isSuccess = order.payment_status === "paid" || order.payment_status === "pending";
  const isFailed = order.payment_status === "failed";

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-[#050505] text-white flex justify-center">
      <div className="max-w-3xl w-full flex flex-col gap-10">
        
        {/* Status Header */}
        <div className="flex flex-col items-center text-center gap-6 border-b border-white/10 pb-12">
          {isFailed ? (
            <>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                <XCircle size={40} />
              </div>
              <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest text-red-500">Payment Failed</h1>
              <p className="text-white/60 max-w-md">
                We could not process your payment. Your order has been cancelled and any reserved stock has been released.
              </p>
              <Link 
                href="/cart"
                className="mt-4 bg-white text-black px-8 py-4 font-chillax font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors"
              >
                Return to Cart
              </Link>
            </>
          ) : (
            <>
              {/* Clear the cart only if successful */}
              <ClearCartOnSuccess cartId={order.cart_id} />
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest">Order Confirmed</h1>
              <p className="text-white/60 max-w-md">
                Thank you for your order. We&apos;ve received your details and are preparing your limited pieces.
                {order.payment_status === "pending" && " (Awaiting payment confirmation via webhook)."}
              </p>
            </>
          )}
        </div>

        {/* Order Details (Only show if not failed) */}
        {!isFailed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Order Number</span>
                <span className="font-mono text-lg">{order.order_number}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Order Status</span>
                <span className="uppercase tracking-widest text-sm text-[#ff2a2a]">{order.status}</span>
              </div>
              
              {order.addresses && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Shipping Address</span>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-md text-sm text-white/80 leading-relaxed">
                    <p className="font-bold text-white mb-1">{order.addresses.full_name}</p>
                    <p>{order.addresses.line1}</p>
                    {order.addresses.line2 && <p>{order.addresses.line2}</p>}
                    <p>{order.addresses.city}, {order.addresses.state}</p>
                    <p className="mt-2 text-white/50">{order.addresses.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt */}
            <div className="border border-white/10 bg-[#0a0505] p-6 sm:p-8 mt-4">
              <h3 className="font-chillax font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                <Package size={18} />
                Order Summary
              </h3>
              
              <div className="flex flex-col gap-4 mb-8">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm uppercase tracking-wider">
                        {item.product_name_snapshot}
                        <span className="text-white/40 lowercase ml-2">x{item.quantity}</span>
                      </span>
                      <span className="text-white/50 text-xs mt-1">
                        {item.variant_snapshot?.color} / {item.variant_snapshot?.size}
                      </span>
                    </div>
                    <span className="text-sm">{formatNGN(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 text-sm pt-4 border-t border-white/10">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>{formatNGN(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-[#ff2a2a]">
                    <span>Discount</span>
                    <span>-{formatNGN(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>{order.shipping_cost === 0 ? "Free" : formatNGN(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span>{formatNGN(order.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Magic Link Prompt for guests or unauthenticated users */}
            {order.customers?.email && (
              <MagicLinkPrompt email={order.customers.email} />
            )}
            <div className="flex justify-center mt-8">
              <Link 
                href="/shop"
                className="text-sm uppercase tracking-widest text-white/60 hover:text-white border-b border-transparent hover:border-white transition-all pb-1"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
