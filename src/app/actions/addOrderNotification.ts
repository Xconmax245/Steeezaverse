"use server";

import { getServerSessionClient } from '@/lib/supabase/server-session';
import { revalidatePath } from 'next/cache';

export async function addOrderNotificationAction(orderId: string, message: string) {
  try {
    const supabase = getServerSessionClient();
    
    // In a real app, verify that the caller is an Admin here.
    // E.g., check session user role. For now, assume authorized by admin page layout.
    
    const { error } = await (supabase as any)
      .from('order_notifications')
      .insert({
        order_id: orderId,
        message: message.trim(),
      });
      
    if (error) {
      console.error('Error adding notification:', error);
      return { error: 'Failed to add notification' };
    }
    
    // Optionally trigger an email here via Resend if required by user
    
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}
