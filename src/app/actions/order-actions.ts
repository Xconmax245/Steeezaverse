'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/admin-auth';

// Admin order management server actions.

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: 'Unauthorized' };

  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return { success: false, error: 'Invalid order status' };
  }

  const { error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { success: true };
}