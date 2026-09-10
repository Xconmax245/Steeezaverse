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

  const { data: order, error } = await (getSupabaseAdmin() as any)
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('customer_id, order_number')
    .single();

  if (error || !order) return { success: false, error: error?.message || 'Order not found' };

  if (order.customer_id) {
    let title = 'Order Update';
    let message = `Your order #${order.order_number} has been updated to ${status}.`;

    switch (status) {
      case 'processing':
        title = 'Order Processing';
        message = `Good news! We are now processing your order #${order.order_number}.`;
        break;
      case 'shipped':
        title = 'Order Shipped';
        message = `Your order #${order.order_number} has shipped! Keep an eye out for tracking details.`;
        break;
      case 'delivered':
        title = 'Order Delivered';
        message = `Your order #${order.order_number} has been delivered. Enjoy!`;
        break;
      case 'cancelled':
      case 'refunded':
        title = `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        message = `Your order #${order.order_number} has been ${status}.`;
        break;
    }

    await (getSupabaseAdmin() as any).from('customer_notifications').insert({
      customer_id: order.customer_id,
      order_id: orderId,
      title,
      message,
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { success: true };
}

export async function sendCustomerMessage(orderId: string, customerId: string, message: string): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: 'Unauthorized' };

  if (!message.trim()) {
    return { success: false, error: 'Message cannot be empty' };
  }

  const { error } = await (getSupabaseAdmin() as any).from('customer_notifications').insert({
    customer_id: customerId,
    order_id: orderId,
    title: 'Message from Steezaverse',
    message: message.trim(),
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}