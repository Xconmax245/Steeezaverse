"use server";

import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const supabase = getSupabaseAdmin() as any;
    
    // 1. Fetch order by orderNumber
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customers ( id, name, email ),
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
      
    if (orderError) {
      console.error('[trackOrder] DB error:', JSON.stringify(orderError));
      return { error: `DB error: ${orderError.message} (code: ${orderError.code})` };
    }
    
    if (!order) {
      return { error: 'Order not found.' };
    }
    
    // 2. Verify email matches
    const customer = order.customers;
    console.log('[trackOrder] customer:', JSON.stringify(customer), 'input email:', email);
    
    if (!customer) {
      return { error: 'No customer linked to this order.' };
    }
    
    if (!customer.email || customer.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return { error: `Email mismatch. Expected: ${customer.email}, Got: ${email}` };
    }
    
    return { success: true, order, customer };
  } catch (err: any) {
    console.error('[trackOrder] Exception:', err);
    return { error: `Exception: ${err.message}` };
  }
}
