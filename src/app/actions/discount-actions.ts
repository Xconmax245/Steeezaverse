"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string };

export async function createDiscount(data: {
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value?: number | null;
  usage_limit?: number | null;
  expires_at?: string | null;
}): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  
  const code = data.code.trim().toUpperCase();
  if (!code) return { success: false, error: "Code is required" };

  if (data.discount_type === "percentage" && (data.discount_value <= 0 || data.discount_value > 100)) {
    return { success: false, error: "Percentage discount must be between 1 and 100" };
  }
  
  if (data.discount_type === "fixed_amount" && data.discount_value <= 0) {
    return { success: false, error: "Fixed amount discount must be greater than 0" };
  }

  const { error } = await (admin as any).from("discounts").insert({
    code,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order_value: data.min_order_value || null,
    usage_limit: data.usage_limit || null,
    expires_at: data.expires_at || null,
    active: true,
    times_used: 0
  });

  if (error) {
    // Handle unique constraint violation (23505 in Postgres)
    if (error.code === '23505') {
      return { success: false, error: "This discount code already exists." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function toggleDiscountActive(id: string, currentStatus: boolean): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  
  const { error } = await (admin as any)
    .from("discounts")
    .update({ active: !currentStatus })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function deleteDiscount(id: string): Promise<ActionResult> {
  const admin = getSupabaseAdmin();
  
  // 1. Guard check: Ensure times_used is exactly 0 before hard deleting.
  const { data: existing, error: fetchErr } = await (admin as any)
    .from("discounts")
    .select("times_used")
    .eq("id", id)
    .single();
    
  if (fetchErr || !existing) return { success: false, error: "Discount not found." };
  
  if (existing.times_used > 0) {
    return { 
      success: false, 
      error: "Cannot delete a discount code that has already been used. Please deactivate it instead to preserve order history." 
    };
  }

  const { error } = await (admin as any).from("discounts").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/discounts");
  return { success: true };
}
