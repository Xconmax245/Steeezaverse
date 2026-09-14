"use server";

import { getServerSessionClient } from '@/lib/supabase/server-session';

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const supabase = getServerSessionClient();
    
    // 1. Fetch customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email')
      .eq('email', email.toLowerCase().trim())
      .single();
      
    if (customerError || !customer) {
      return { error: 'Order not found or email does not match.' };
    }
    
    // 2. Fetch order by orderNumber and customer_id
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select(`
        *,
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
      .eq('customer_id', customer.id)
      .single();
      
    if (orderError || !order) {
      return { error: 'Order not found or email does not match.' };
    }
    
    return { success: true, order, customer };
  } catch (err: any) {
    return { error: err.message || 'An error occurred while tracking your order.' };
  }
}
