import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import MessageCustomerForm from '@/components/admin/MessageCustomerForm';

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
  addresses: { line1: string; line2: string | null; city: string; state: string; phone: string | null } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    product_name_snapshot: string;
    variant_snapshot: { sku: string | null; size: string | null; color: string | null } | null;
  }>;
}

const ORDER_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' },
  processing: { label: 'Processing', className: 'bg-blue-900/40 text-blue-300 border-blue-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-900/40 text-purple-300 border-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-green-900/40 text-green-400 border-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-800 text-gray-400 border-gray-700' },
  refunded: { label: 'Refunded', className: 'bg-red-900/40 text-red-300 border-red-800' },
};

const PAYMENT_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-green-900/40 text-green-400 border-green-800' },
  pending: { label: 'Unpaid', className: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' },
  failed: { label: 'Failed', className: 'bg-red-900/40 text-red-300 border-red-800' },
};

function formatNGN(value: number): string {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .select(
      `id, customer_id, order_number, status, payment_status, payment_reference, payment_gateway, discount_code,
       subtotal, discount_amount, shipping_cost, total, created_at, updated_at,
       customers(email, name, phone),
       addresses(line1, line2, city, state, phone),
       order_items(id, quantity, unit_price, product_name_snapshot, variant_snapshot)`
    )
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  const order = data as OrderDetail;
  const orderStyle = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending;
  const paymentStyle = PAYMENT_STATUS_STYLES[order.payment_status] ?? PAYMENT_STATUS_STYLES.pending;
  const address = order.addresses;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-white text-sm">
            ← Orders
          </Link>
          <h2 className="text-2xl font-bold">{order.order_number}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${orderStyle.className}`}>
            {orderStyle.label}
          </span>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${paymentStyle.className}`}>
            {paymentStyle.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Customer</h3>
          <p className="text-white font-medium">{order.customers?.name ?? 'Guest customer'}</p>
          <p className="text-sm text-gray-400 mt-1">{order.customers?.email ?? 'No email on file'}</p>
          {order.customers?.phone && <p className="text-sm text-gray-400">{order.customers.phone}</p>}
        </div>

        {/* Shipping address */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Shipping Address</h3>
          {address ? (
            <>
              <p className="text-sm text-gray-300">{address.line1}</p>
              {address.line2 && <p className="text-sm text-gray-300">{address.line2}</p>}
              <p className="text-sm text-gray-300">
                {address.city}, {address.state}
              </p>
              {address.phone && <p className="text-sm text-gray-400 mt-1">{address.phone}</p>}
            </>
          ) : (
            <p className="text-sm text-gray-500">No shipping address</p>
          )}
        </div>

        {/* Payment + status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Order Status</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Status</span>
            <OrderStatusSelect orderId={order.id} status={order.status} />
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Gateway</dt>
              <dd className="text-gray-300 capitalize">{order.payment_gateway ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Reference</dt>
              <dd className="text-gray-300 truncate ml-4">{order.payment_reference ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Discount code</dt>
              <dd className="text-gray-300">{order.discount_code ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit price</th>
              <th className="px-4 py-3 font-medium text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => {
              const variant = item.variant_snapshot;
              return (
                <tr key={item.id} className="border-b border-gray-800 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-white">{item.product_name_snapshot}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {[variant?.size, variant?.color].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{variant?.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-300">{formatNGN(Number(item.unit_price))}</td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {formatNGN(Number(item.unit_price) * item.quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>{formatNGN(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
              <span className="text-green-400">−{formatNGN(Number(order.discount_amount))}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Shipping</span>
            <span>{formatNGN(Number(order.shipping_cost))}</span>
          </div>
          <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-800">
            <span>Total</span>
            <span>{formatNGN(Number(order.total))}</span>
          </div>
        </div>
      </div>
      
      {/* Message Customer section */}
      <MessageCustomerForm orderId={order.id} customerId={order.customer_id || undefined} />

    </div>
  );
}