import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { verifyWebhookAmount } from '@/lib/payments';

// Paystack webhook — confirms a `pending` order as `paid`.
// Idempotent: the status flip is a single UPDATE gated on `payment_status =
// 'pending'`, so duplicate or concurrent deliveries can only succeed once and
// can never double-decrement stock (stock is reserved at order creation).
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (!signature || hash !== signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Fetch order to verify the charged amount matches.
      const { data: orderData } = await (getSupabaseAdmin() as any)
        .from('orders')
        .select('id, total, discount_code, status')
        .eq('payment_reference', reference)
        .single();

      const order = orderData as any;
      if (!order) {
        // Unknown reference — ack to stop provider retries; nothing to process.
        return NextResponse.json({ success: true, message: 'Order not found, acked' });
      }

      // The stock-release job may have cancelled an abandoned order before the
      // payment landed. Money was taken for a cancelled order — flag it for a
      // manual refund and ack (do NOT flip it to paid).
      if (order.status === 'cancelled') {
        await (getSupabaseAdmin() as any)
          .from('notification_log')
          .insert([
            {
              type: 'order_confirmation',
              recipient: event.data.customer?.email || '',
              status: 'needs_refund',
            },
          ]);
        return NextResponse.json({ success: true, message: 'Order cancelled, refund needed' });
      }

      // Paystack sends amount in kobo; reject tampered/mismatched charges.
      if (event.data.currency !== 'NGN' || !verifyWebhookAmount('paystack', Number(order.total), event.data.amount)) {
        return NextResponse.json(
          { success: false, error: 'Amount mismatch' },
          { status: 400 }
        );
      }

      // Atomic flip: only a `pending` order can be marked paid. Zero rows
      // updated = already processed (idempotent retry), so just ack.
      const { data: updated, error: updateError } = await (getSupabaseAdmin() as any)
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          payment_gateway: 'paystack',
          updated_at: new Date().toISOString(),
        })
        .eq('payment_reference', reference)
        .eq('payment_status', 'pending')
        .eq('status', 'pending')
        .select('id, discount_code');

      if (updateError) throw updateError;

      if (!updated?.length) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Consume discount usage exactly once per paid order.
      if (order.discount_code) {
        await (getSupabaseAdmin().rpc as any)('increment_discount_usage', {
          p_code: order.discount_code,
        });
      }

      // Log the confirmation notification (email dispatch is wired via
      // /api/notifications/send once an email provider is configured).
      await (getSupabaseAdmin() as any)
        .from('notification_log')
        .insert([
          {
            type: 'order_confirmation',
            recipient: event.data.customer?.email || '',
            status: 'sent',
          },
        ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}