import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  customers: { email: string | null; name: string | null } | null;
  order_items: Array<{ id: string; quantity: number }>;
}

const ORDER_STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  pending:    { label: 'Pending',    dot: 'bg-yellow-400', text: 'text-yellow-300' },
  processing: { label: 'Processing', dot: 'bg-blue-400',   text: 'text-blue-300'  },
  shipped:    { label: 'Shipped',    dot: 'bg-purple-400', text: 'text-purple-300' },
  delivered:  { label: 'Delivered',  dot: 'bg-green-400',  text: 'text-green-400'  },
  cancelled:  { label: 'Cancelled',  dot: 'bg-white/20',   text: 'text-white/30'  },
  refunded:   { label: 'Refunded',   dot: 'bg-red-400',    text: 'text-red-300'   },
};

const PAYMENT_STATUS_STYLES: Record<string, { label: string; dot: string; text: string }> = {
  paid:    { label: 'Paid',   dot: 'bg-green-400', text: 'text-green-400' },
  pending: { label: 'Unpaid', dot: 'bg-yellow-400', text: 'text-yellow-300' },
  failed:  { label: 'Failed', dot: 'bg-red-400',   text: 'text-red-300'   },
};

function formatNGN(value: number): string {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export default async function AdminOrdersPage() {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .select(`id, order_number, status, payment_status, total, created_at,
             customers(email, name), order_items(id, quantity)`)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-red-400 text-sm font-mono">
        Failed to load orders: {error.message}
      </div>
    );
  }

  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1 font-chillax">Admin</p>
          <h1 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white">Orders</h1>
        </div>
        <span className="text-xs uppercase tracking-widest text-white/30 font-chillax">
          {orders.length} total
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="border border-white/5 rounded-3xl p-20 text-center flex flex-col items-center gap-4">
          <ShoppingBag className="w-10 h-10 text-white/10" />
          <p className="text-white/30 text-sm uppercase tracking-widest font-chillax">No orders yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => {
            const orderStyle = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending;
            const payStyle = PAYMENT_STATUS_STYLES[order.payment_status] ?? PAYMENT_STATUS_STYLES.pending;
            const itemCount = order.order_items.reduce((s, i) => s + (i.quantity || 0), 0);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="group flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl px-6 py-5 transition-all duration-200"
              >
                {/* Order Number */}
                <div className="flex-1 min-w-0">
                  <p className="font-chillax font-bold text-sm text-white uppercase tracking-widest truncate">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 truncate">
                    {order.customers?.email ?? 'Guest'}
                    {order.customers?.name && ` · ${order.customers.name}`}
                  </p>
                </div>

                {/* Order Status */}
                <div className="hidden sm:flex items-center gap-1.5 w-28">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${orderStyle.dot}`} />
                  <span className={`text-xs font-chillax font-bold uppercase tracking-widest ${orderStyle.text}`}>
                    {orderStyle.label}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="hidden sm:flex items-center gap-1.5 w-20">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${payStyle.dot}`} />
                  <span className={`text-xs font-chillax font-bold uppercase tracking-widest ${payStyle.text}`}>
                    {payStyle.label}
                  </span>
                </div>

                {/* Items count */}
                <div className="hidden md:block text-xs text-white/30 w-16 font-chillax">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>

                {/* Date */}
                <div className="hidden md:block text-xs text-white/30 w-24 text-right font-chillax">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short',
                  })}
                </div>

                {/* Total */}
                <div className="text-sm font-chillax font-bold text-white w-20 text-right">
                  {formatNGN(Number(order.total))}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}