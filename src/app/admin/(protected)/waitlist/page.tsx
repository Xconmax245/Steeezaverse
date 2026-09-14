import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Mail, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface WaitlistRow {
  id: string;
  email: string;
  created_at: string;
  notified: boolean;
  products: { name: string; slug: string } | null;
  product_variants: { size: string | null; color: string | null } | null;
}

export default async function AdminWaitlistPage() {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('waitlist_signups')
    .select(`
      id, email, created_at, notified,
      products:product_id (name, slug),
      product_variants:variant_id (size, color)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-red-400 text-sm font-mono">
        Failed to load waitlist: {error.message}
      </div>
    );
  }

  const signups = (data ?? []) as WaitlistRow[];

  // Group by product
  const grouped = signups.reduce<Record<string, WaitlistRow[]>>((acc, row) => {
    const key = row.products?.name ?? 'Unknown Product';
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1 font-chillax">Admin</p>
          <h1 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white">Waitlist</h1>
        </div>
        <div className="flex items-center gap-2 text-white/30">
          <Mail className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-chillax">{signups.length} signups</span>
        </div>
      </div>

      {signups.length === 0 ? (
        <div className="border border-white/5 rounded-3xl p-20 text-center flex flex-col items-center gap-4">
          <Mail className="w-10 h-10 text-white/10" />
          <p className="text-white/30 text-sm uppercase tracking-widest font-chillax">No waitlist signups yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([productName, rows]) => (
            <div key={productName} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              {/* Product header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="font-chillax font-bold text-sm uppercase tracking-widest text-white">
                  {productName}
                </h2>
                <span className="text-xs font-chillax uppercase tracking-widest text-white/30">
                  {rows.length} {rows.length === 1 ? 'signup' : 'signups'}
                </span>
              </div>

              {/* Signup rows */}
              <div className="divide-y divide-white/[0.04]">
                {rows.map((row) => {
                  const variant = row.product_variants;
                  const variantText = variant
                    ? [variant.color, variant.size].filter(Boolean).join(' / ')
                    : null;
                  const date = new Date(row.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });
                  return (
                    <div key={row.id} className="flex items-center justify-between px-6 py-4 gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3 h-3 text-white/30" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate font-mono">{row.email}</p>
                          {variantText && (
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5 font-chillax">
                              {variantText}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {row.notified && (
                          <span className="text-[10px] uppercase tracking-widest text-green-400 font-chillax border border-green-400/20 bg-green-400/10 px-2.5 py-1 rounded-full">
                            Notified
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-white/20">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-chillax uppercase tracking-widest">{date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
