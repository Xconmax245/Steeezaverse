import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import MessageCustomerForm from '@/components/admin/MessageCustomerForm';
import { ArrowLeft, Package, MapPin, CreditCard, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface OrderDetail {
  id: string;
  customer_id: string | null;
  order_number: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  payment_gateway: string | null;
  discount_code: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  updated_at: string;
  customers: { email: string | null; name: string | null; phone: string | null } | null;
  addresses: { full_name?: string; line1: string; line2: string | null; city: string; state: string; phone: string | null } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    product_name_snapshot: string;
    variant_snapshot: { sku: string | null; size: string | null; color: string | null } | null;
  }>;
}

const PAYMENT_STATUS: Record<string, { label: string; dot: string; text: string }> = {
  paid:    { label: 'Paid',   dot: 'bg-green-400', text: 'text-green-400' },
  pending: { label: 'Unpaid', dot: 'bg-yellow-400', text: 'text-yellow-300' },
  failed:  { label: 'Failed', dot: 'bg-red-400',   text: 'text-red-300'   },
};

function formatNGN(value: number): string {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-white/30">{icon}</span>
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-chillax font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .select(
      `id, customer_id, order_number, status, payment_status, payment_reference, payment_gateway, discount_code,
       subtotal, discount_amount, shipping_cost, total, created_at, updated_at,
       customers(email, name, phone),
       addresses(full_name, line1, line2, city, state, phone),
       order_items(id, quantity, unit_price, product_name_snapshot, variant_snapshot)`
    )
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  const order = data as OrderDetail;
  const payStyle = PAYMENT_STATUS[order.payment_status] ?? PAYMENT_STATUS.pending;
  const address = order.addresses;
  const createdDate = new Date(order.created_at).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors font-chillax mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1 font-chillax">Order</p>
            <h1 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white">
              {order.order_number}
            </h1>
            <p className="text-xs text-white/30 mt-2 font-chillax">{createdDate}</p>
          </div>

          {/* Payment & Status badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-4 py-2`}>
              <span className={`w-1.5 h-1.5 rounded-full ${payStyle.dot}`} />
              <span className={`text-xs font-chillax font-bold uppercase tracking-widest ${payStyle.text}`}>
                {payStyle.label}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-2">
              <span className="text-xs text-white/40 font-chillax uppercase tracking-widest">Status:</span>
              <OrderStatusSelect orderId={order.id} status={order.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer */}
        <InfoCard icon={<User className="w-4 h-4" />} title="Customer">
          <div>
            <p className="font-chillax font-bold text-white text-sm">
              {order.customers?.name ?? 'Guest Customer'}
            </p>
            <p className="text-xs text-white/40 mt-1">{order.customers?.email ?? '—'}</p>
            {order.customers?.phone && (
              <p className="text-xs text-white/40 mt-0.5">{order.customers.phone}</p>
            )}
          </div>
        </InfoCard>

        {/* Shipping Address */}
        <InfoCard icon={<MapPin className="w-4 h-4" />} title="Shipping Address">
          {address ? (
            <div className="text-xs text-white/50 leading-relaxed">
              {address.full_name && <p className="font-bold text-white/70 mb-1">{address.full_name}</p>}
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>{address.city}, {address.state}</p>
              {address.phone && <p className="mt-1 text-white/30">{address.phone}</p>}
            </div>
          ) : (
            <p className="text-xs text-white/30">No address on file</p>
          )}
        </InfoCard>

        {/* Payment */}
        <InfoCard icon={<CreditCard className="w-4 h-4" />} title="Payment">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/30 font-chillax uppercase tracking-widest">Gateway</span>
              <span className="text-white/70 capitalize">{order.payment_gateway ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30 font-chillax uppercase tracking-widest">Reference</span>
              <span className="text-white/50 font-mono text-[10px] truncate ml-4 max-w-[120px]">
                {order.payment_reference ?? '—'}
              </span>
            </div>
            {order.discount_code && (
              <div className="flex justify-between text-xs">
                <span className="text-white/30 font-chillax uppercase tracking-widest">Discount</span>
                <span className="text-[#ff2a2a] font-mono">{order.discount_code}</span>
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {/* Order Items */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <Package className="w-4 h-4 text-white/30" />
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-chillax font-bold">Items</h3>
        </div>

        <div className="divide-y divide-white/5">
          {order.order_items.map((item) => {
            const v = item.variant_snapshot;
            const variant = [v?.color, v?.size].filter(Boolean).join(' / ') || '—';
            return (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-chillax font-bold text-sm text-white uppercase tracking-wider truncate">
                    {item.product_name_snapshot}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{variant}</p>
                  {v?.sku && <p className="text-[10px] text-white/20 font-mono mt-0.5">{v.sku}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white/40">×{item.quantity}</p>
                  <p className="font-chillax font-bold text-sm text-white mt-0.5">
                    {formatNGN(Number(item.unit_price) * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-white/5 px-6 py-5 flex flex-col gap-2 items-end">
          <div className="flex justify-between w-full max-w-xs text-xs text-white/40">
            <span className="font-chillax uppercase tracking-widest">Subtotal</span>
            <span>{formatNGN(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between w-full max-w-xs text-xs text-[#ff2a2a]">
              <span className="font-chillax uppercase tracking-widest">
                Discount{order.discount_code ? ` (${order.discount_code})` : ''}
              </span>
              <span>−{formatNGN(Number(order.discount_amount))}</span>
            </div>
          )}
          <div className="flex justify-between w-full max-w-xs text-xs text-white/40">
            <span className="font-chillax uppercase tracking-widest">Shipping</span>
            <span>{formatNGN(Number(order.shipping_cost))}</span>
          </div>
          <div className="flex justify-between w-full max-w-xs text-sm font-bold text-white pt-3 border-t border-white/10 mt-1">
            <span className="font-chillax uppercase tracking-widest">Total</span>
            <span>{formatNGN(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Message Customer */}
      <MessageCustomerForm orderId={order.id} customerId={order.customer_id || undefined} />
    </div>
  );
}