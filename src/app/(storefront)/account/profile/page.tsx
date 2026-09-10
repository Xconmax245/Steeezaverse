import { getSupabaseServer } from "@/lib/supabase/server";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = {
  title: "Profile Settings — Steezaverse",
};

export default async function AccountProfilePage() {
  const supabase = getSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select(`
      id, email, name, phone, whatsapp_number, default_address_id,
      addresses (
        id, line1, line2, city, state, phone
      )
    `)
    .eq("id", session.user.id)
    .single();

  if (!customer) return null;

  const defaultAddress = customer.addresses?.find((a: any) => a.id === customer.default_address_id) || customer.addresses?.[0];

  async function updateProfile(formData: FormData) {
    "use server";
    const supabaseAction = getSupabaseServer();
    const { data: { session: s } } = await supabaseAction.auth.getSession();
    if (!s) return;

    const name = formData.get("name") as string;
    const whatsapp_number = formData.get("whatsapp_number") as string;
    
    await supabaseAction
      .from("customers")
      .update({ name, whatsapp_number })
      .eq("id", s.user.id);
      
    revalidatePath("/account/profile");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 className="font-chillax font-bold uppercase tracking-widest text-xl mb-6 text-white border-b border-white/10 pb-4">
          Personal Information
        </h3>
        
        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Email Address</label>
            <input
              type="email"
              disabled
              value={customer.email}
              className="w-full bg-black/50 border border-white/5 rounded px-4 py-3 text-white/50 cursor-not-allowed"
            />
            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              defaultValue={customer.name || ""}
              placeholder="Your Full Name"
              className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              name="whatsapp_number"
              defaultValue={customer.whatsapp_number || ""}
              placeholder="+234..."
              className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
            />
            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Used for exclusive drop alerts and order updates.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-white hover:bg-white/90 text-black font-bold uppercase tracking-widest px-8 py-3 rounded text-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 className="font-chillax font-bold uppercase tracking-widest text-xl mb-6 text-white border-b border-white/10 pb-4">
          Shipping Address
        </h3>
        
        {defaultAddress ? (
          <div className="space-y-2 text-sm text-white/80">
            <p>{customer.name}</p>
            <p>{defaultAddress.line1}</p>
            {defaultAddress.line2 && <p>{defaultAddress.line2}</p>}
            <p>{defaultAddress.city}, {defaultAddress.state}</p>
            {defaultAddress.phone && <p>{defaultAddress.phone}</p>}
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">
                Addresses are automatically updated when you checkout with a new address.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm uppercase tracking-widest">No default address saved yet.</p>
            <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">Addresses are saved automatically during checkout.</p>
          </div>
        )}
      </div>
    </div>
  );
}
