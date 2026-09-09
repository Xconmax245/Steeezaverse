import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';

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

export default async function AdminOrdersPage() {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .select(
      `id, order_number, status, payment_status, total, created_at,
       customers(email, name), order_items(id, quantity)`
    )
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="text-red-400">Failed to load orders: {error.message}</p>;
  }

  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <span className="text-sm text-gray-500">{orders.length} total</span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-800 rounded p-10 text-center">
          <p className="text-gray-400">No orders yet. Orders appear here once a checkout is started.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderStyle = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending;
                const paymentStyle = PAYMENT_STATUS_STYLES[order.payment_status] ?? PAYMENT_STATUS_STYLES.pending;
                const itemCount = order.order_items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                return (
                  <tr key={order.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{order.order_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{order.customers?.email ?? 'Guest'}</div>
                      {order.customers?.name && (
                        <div className="text-xs text-gray-500">{order.customers.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${orderStyle.className}`}>
                        {orderStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${paymentStyle.className}`}>
                        {paymentStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{itemCount}</td>
                    <td className="px-4 py-3 text-gray-300">{formatNGN(Number(order.total))}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-sz-red hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}