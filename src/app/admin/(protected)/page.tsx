import { supabaseAdmin } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  // Fetch basic stats (backend scope)
  /*
  const { count: orderCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });
  */
    
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 border-b border-white/10 pb-6">
        <h2 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white mb-2">
          System <span className="text-sz-red">Overview</span>
        </h2>
        <p className="text-white/40 text-xs uppercase tracking-wider">
          Live statistics and backend health
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Orders" value="--" />
        <StatCard title="Gross Revenue" value="$0.00" />
        <StatCard title="Low Stock Alerts" value="--" highlight />
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight = false }: { title: string, value: string, highlight?: boolean }) {
  return (
    <div className="relative group bg-white/[0.02] border border-white/5 p-8 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
      <div className="relative z-10">
        <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-4">
          {title}
        </h3>
        <p className={`font-chillax text-4xl font-bold tracking-wider ${highlight ? 'text-sz-red' : 'text-white'}`}>
          {value}
        </p>
      </div>
      
      {/* Decorative gradient blob on hover */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${highlight ? 'bg-sz-red' : 'bg-white'}`} />
    </div>
  );
}
