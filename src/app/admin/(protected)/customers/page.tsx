import { getSupabaseAdmin } from "@/lib/supabase/server";
import CustomerRow from "@/components/admin/CustomerRow";

export const metadata = {
  title: "Admin - Customers",
};

export default async function AdminCustomersPage() {
  // Query our new customer_spend_summary view
  const { data: customers } = await (getSupabaseAdmin() as any)
    .from("customer_spend_summary")
    .select("*")
    .order("lifetime_value", { ascending: false });

  return (
    <div className="p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest text-white mb-2">Customers</h1>
            <p className="text-sm text-white/50 uppercase tracking-widest font-medium">Manage accounts, view lifetime value, and moderate access.</p>
          </div>
        </header>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs text-white/40 uppercase tracking-widest">
                  <th className="font-medium p-4 whitespace-nowrap">Customer</th>
                  <th className="font-medium p-4 whitespace-nowrap">Contact Info</th>
                  <th className="font-medium p-4 whitespace-nowrap">Spend & Volume</th>
                  <th className="font-medium p-4 whitespace-nowrap">Visits</th>
                  <th className="font-medium p-4 whitespace-nowrap">Last Active</th>
                  <th className="font-medium p-4 whitespace-nowrap text-center">Status</th>
                  <th className="font-medium p-4 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!customers || customers.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-white/40 uppercase tracking-widest text-sm">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: any) => (
                    <CustomerRow key={customer.customer_id} customer={customer} />
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
