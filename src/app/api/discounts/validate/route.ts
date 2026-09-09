import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Discount code is required' },
        { status: 400 }
      );
    }

    // Codes are matched case-insensitively.
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select('*')
      .ilike('code', code.trim())
      .eq('active', true)
      .single();

    const discount = data as any;

    if (error || !discount) {
      return NextResponse.json({ success: false, error: 'Invalid discount code' }, { status: 400 });
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Discount expired' }, { status: 400 });
    }

    if (discount.min_order_value && cartTotal < discount.min_order_value) {
      return NextResponse.json({ success: false, error: `Minimum order value of ${discount.min_order_value} required` }, { status: 400 });
    }

    if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
      return NextResponse.json({ success: false, error: 'Usage limit reached' }, { status: 400 });
    }

    return NextResponse.json({ success: true, discount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
