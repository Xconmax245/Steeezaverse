import { getSupabaseAdmin } from "@/lib/supabase/server";
import CreateDiscountForm from "@/components/admin/CreateDiscountForm";
import DiscountRow from "@/components/admin/DiscountRow";

export const metadata = {
  title: "Admin - Discounts",
};

export default async function AdminDiscountsPage() {
  const { data: discounts } = await (getSupabaseAdmin() as any)
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest text-white mb-2">Discount Codes</h1>
            <p className="text-sm text-white/50 uppercase tracking-widest font-medium">Manage promotional codes, limits, and active status.</p>
          </div>
          <CreateDiscountForm />
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs text-white/40 uppercase tracking-widest">
                  <th className="font-medium p-4 whitespace-nowrap">Code</th>
                  <th className="font-medium p-4 whitespace-nowrap">Value</th>
                  <th className="font-medium p-4 whitespace-nowrap">Usage</th>
                  <th className="font-medium p-4 whitespace-nowrap">Expires At</th>
                  <th className="font-medium p-4 whitespace-nowrap text-center">Status</th>
                  <th className="font-medium p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!discounts || discounts.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-white/40 uppercase tracking-widest text-sm">
                      No discount codes found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount: any) => (
                    <DiscountRow key={discount.id} discount={discount} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
