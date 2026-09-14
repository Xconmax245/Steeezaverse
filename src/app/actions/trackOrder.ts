"use server";

import { getServerSessionClient } from '@/lib/supabase/server-session';

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const supabase = getServerSessionClient();
    
    // 1. Fetch order by orderNumber
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select(`
        *,
        customers ( id, first_name, last_name, email ),
        order_items (
          id, quantity, unit_price,
          variant:product_variants(
            id, size, color,
            product:products(
              name,
              product_images(url)
            )
          )
        ),
        order_notifications (
          id, message, created_at
        )
      `)
      .eq('order_number', orderNumber.trim().toUpperCase())
      .single();
      
    if (orderError || !order) {
      return { error: 'Order not found or email does not match.' };
    }
    
    // 2. Verify email matches (either the customer's email or fallback)
    const customer = order.customers;
    if (!customer || !customer.email || customer.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return { error: 'Order not found or email does not match.' };
    }
    
    return { success: true, order, customer };
  } catch (err: any) {
    return { error: err.message || 'An error occurred while tracking your order.' };
  }
}
