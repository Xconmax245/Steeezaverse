import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('verif-hash');
    const secret = process.env.FLUTTERWAVE_SECRET_KEY!;

    // Verify signature
    if (!signature || signature !== secret) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    const event = await request.json();

    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const reference = event.data.tx_ref;
      
      // Idempotency check
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('payment_status')
        .eq('payment_reference', reference)
        .single();
        
      const existingOrder = data as any;

      if (existingOrder && existingOrder.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing', updated_at: new Date().toISOString() })
        .eq('payment_reference', reference);
        
      // Trigger notification
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
