import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const LOW_STOCK_THRESHOLD = 5;

const ORDER_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-900/40 text-yellow-300 border-yellow-800' },
  processing: { label: 'Processing', className: 'bg-blue-900/40 text-blue-300 border-blue-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-900/40 text-purple-300 border-purple-800' },
  delivered: { label: 'Delivered', className: 'bg-green-900/40 text-green-400 border-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-800 text-gray-400 border-gray-700' },
  refunded: { label: 'Refunded', className: 'bg-red-900/40 text-red-300 border-red-800' },
};

function formatNGN(value: number): string {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-NG');
}

/** Runs a supabase query and returns `[]` instead of throwing on failure. */
async function safeFetch<T>(query: Promise<{ data: T | null; error: any }>): Promise<T> {
  try {
    const { data } = await query;
    return (data ?? []) as T;
  } catch {
    return [] as unknown as T;
  }
}

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdmin() as any;

  const [
    allOrders,
    paidOrders,
    totalCustomers,
    products,
    waitlistCount,
    views,
    discounts,
    recentOrders,
    lowStock,
    topItems,
  ] = await Promise.all([
    safeFetch<Array<{ status: string; payment_status: string }>>(
      supabase.from('orders').select('status, payment_status')
    ),
    safeFetch<Array<{ total: number; customer_id: string | null }>>(
      supabase.from('orders').select('total, customer_id, status').eq('payment_status', 'paid')
    ),
    safeFetch<unknown[]>(supabase.from('customers').select('id')),
    safeFetch<Array<{ status: string }>>(supabase.from('products').select('id, status')),
    safeFetch<unknown[]>(supabase.from('waitlist_signups').select('id')),
    safeFetch<Array<{ visitor_id: string | null; viewed_at: string }>>(
      supabase.from('page_views').select('visitor_id, viewed_at')
    ),
    safeFetch<Array<{ active: boolean; times_used: number }>>(
      supabase.from('discounts').select('active, times_used')
    ),
    safeFetch<
      Array<{
        id: string;
        order_number: string;
        status: string;
        payment_status: string;
        total: number;
        created_at: string;
        customers: { email: string | null } | null;
      }>
    >(
      supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total, created_at, customers(email)')
        .order('created_at', { ascending: false })
        .limit(6)
    ),
    safeFetch<
      Array<{
        id: string;
        size: string | null;
        color: string | null;
        stock_quantity: number;
        products: { name: string } | null;
      }>
    >(
      supabase
        .from('product_variants')
        .select('id, size, color, stock_quantity, products(name)')
        .lte('stock_quantity', LOW_STOCK_THRESHOLD)
        .order('stock_quantity', { ascending: true })
        .limit(10)
    ),
    safeFetch<
      Array<{
        product_name_snapshot: string;
        quantity: number;
        unit_price: number;
        orders: { payment_status: string } | null;
      }>
    >(
      supabase
        .from('order_items')
        .select('product_name_snapshot, quantity, unit_price, orders!inner(payment_status)')
        .limit(500)
    ),
  ]);

  // ── Compute KPIs ──────────────────────────────────────────────
  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

  const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const buyers = new Set(paidOrders.map((o) => o.customer_id).filter(Boolean)).size;
  const avgOrderValue = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;

  const pageViews = views.length;
  const visitors = new Set(views.map((v) => v.visitor_id).filter(Boolean)).size;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayViews = views.filter((v) => new Date(v.viewed_at) >= todayStart).length;

  const activeDiscounts = discounts.filter((d) => d.active).length;
  const discountUses = discounts.reduce((sum, d) => sum + (d.times_used || 0), 0);

  // Top products by revenue (paid orders only).
  const productMap = new Map<string, { revenue: number; units: number }>();
  for (const item of topItems) {
    if (item.orders?.payment_status !== 'paid') continue;
    const revenue = Number(item.unit_price) * item.quantity;
    const entry = productMap.get(item.product_name_snapshot) ?? { revenue: 0, units: 0 };
    entry.revenue += revenue;
    entry.units += item.quantity;
    productMap.set(item.product_name_snapshot, entry);
  }
  const topProducts = Array.from(productMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 border-b border-white/10 pb-6">
        <h2 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white mb-2">
          System <span className="text-sz-red">Overview</span>
        </h2>
        <p className="text-white/40 text-xs uppercase tracking-wider">
          Live statistics and backend health
        </p>
      </header>

      {/* ── Key metrics ── */}
      <h3 className="font-chillax text-lg font-bold uppercase tracking-widest text-white mb-4">
        Key <span className="text-sz-red">Metrics</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Orders" value={formatNumber(totalOrders)} hint="All time" />
        <StatCard title="Gross Revenue" value={formatNGN(revenue)} hint="Paid orders only" />
        <StatCard title="Buyers" value={formatNumber(buyers)} hint="Customers with a paid order" />
        <StatCard title="Visitors" value={formatNumber(visitors)} hint="Distinct browsers tracked" />
        <StatCard title="Page Views" value={formatNumber(pageViews)} hint="Public storefront hits" />
        <StatCard title="Low Stock Alerts" value={formatNumber(lowStock.length)} hint={`Variants at ${LOW_STOCK_THRESHOLD} or below`} highlight />
      </div>

      {/* ── Secondary stats ── */}
      <h3 className="font-chillax text-lg font-bold uppercase tracking-widest text-white mb-4">
        More <span className="text-sz-red">Stats</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <MiniStat title="Pending Orders" value={formatNumber(pendingOrders)} />
        <MiniStat title="Avg Order Value" value={formatNGN(avgOrderValue)} />
        <MiniStat title="Products" value={`${formatNumber(publishedProducts)} / ${formatNumber(totalProducts)}`} />
        <MiniStat title="Total Customers" value={formatNumber(totalCustomers.length)} />
        <MiniStat title="Waitlist Signups" value={formatNumber(waitlistCount.length)} />
        <MiniStat title="Views Today" value={formatNumber(todayViews)} />
        <MiniStat title="Active Discounts" value={formatNumber(activeDiscounts)} />
        <MiniStat title="Discount Uses" value={formatNumber(discountUses)} />
      </div>

      {/* ── Recent orders + low stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-chillax text-lg font-bold uppercase tracking-widest text-white">
              Recent <span className="text-sz-red">Orders</span>
            </h3>
            <Link href="/admin/orders" className="text-sz-red hover:underline text-sm">
              View all
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const style = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending;
                    return (
                      <tr key={order.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/40">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${order.id}`} className="font-medium text-white hover:text-sz-red">
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{order.customers?.email ?? 'Guest'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium border ${style.className}`}>
                            {style.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">{formatNGN(Number(order.total))}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-chillax text-lg font-bold uppercase tracking-widest text-white">
              Low <span className="text-sz-red">Stock</span>
            </h3>
            <Link href="/admin/products" className="text-sz-red hover:underline text-sm">
              Manage products
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No low-stock variants — inventory is healthy
                    </td>
                  </tr>
                ) : (
                  lowStock.map((variant) => (
                    <tr key={variant.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-medium text-white">{variant.products?.name ?? 'Unknown product'}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {[variant.size, variant.color].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${variant.stock_quantity === 0 ? 'text-sz-red' : 'text-yellow-400'}`}>
                        {variant.stock_quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Top products ── */}
      <section>
        <h3 className="font-chillax text-lg font-bold uppercase tracking-widest text-white mb-4">
          Top <span className="text-sz-red">Products</span>
        </h3>
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium text-right">Units sold</th>
                <th className="px-4 py-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No paid orders yet — revenue will appear here once orders come in
                  </td>
                </tr>
              ) : (
                topProducts.map((product) => (
                  <tr key={product.name} className="border-b border-gray-800 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{formatNumber(product.units)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{formatNGN(product.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  highlight = false,
}: {
  title: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className="relative group bg-white/[0.02] border border-white/5 p-8 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
      <div className="relative z-10">
        <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-4">
          {title}
        </h3>
        <p className={`font-chillax text-4xl font-bold tracking-wider ${highlight ? 'text-sz-red' : 'text-white'}`}>
          {value}
        </p>
        {hint && <p className="text-white/30 text-[10px] uppercase tracking-wider mt-2">{hint}</p>}
      </div>

      {/* Decorative gradient blob on hover */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${highlight ? 'bg-sz-red' : 'bg-white'}`} />
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
      <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-3">{title}</h3>
      <p className="font-chillax text-xl font-bold tracking-wider text-white">{value}</p>
    </div>
  );
}