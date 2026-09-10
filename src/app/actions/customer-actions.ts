"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleCustomerBan(customerId: string, currentStatus: boolean) {
  const admin = getSupabaseAdmin();
  
  // Use the RPC we created in migration 00010
  const { error } = await (admin.rpc as any)('admin_ban_customer', {
    customer_uid: customerId,
    ban_status: !currentStatus
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/customers");
  return { success: true };
}
