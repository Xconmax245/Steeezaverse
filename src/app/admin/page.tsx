import { supabaseAdmin } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  // Fetch basic stats (backend scope)
  /*
  const { count: orderCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });
  */
    
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview Dashboard (Backend Scope)</h2>
      <p className="mb-4 text-gray-400">This is the scaffolding for the admin dashboard. UI/charts to be built by frontend.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 mb-2">Revenue</h3>
          <p className="text-3xl font-bold">₦0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 mb-2">Low Stock Variants</h3>
          <p className="text-3xl font-bold text-brand-red">--</p>
        </div>
      </div>
    </div>
  );
}
