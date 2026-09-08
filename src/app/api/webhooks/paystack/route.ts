import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    // Verify signature
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      
      // Idempotency check: Ensure order isn't already paid
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('payment_status')
        .eq('payment_reference', reference)
        .single();

      if (existingOrder && existingOrder.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Update order status to paid
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing', updated_at: new Date().toISOString() })
        .eq('payment_reference', reference);
        
      // Trigger notification (e.g. via notification API or direct email)
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
