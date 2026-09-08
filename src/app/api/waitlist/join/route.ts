import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { productId, variantId, email } = await request.json();

    if (!productId || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await (supabaseAdmin.from('waitlist_signups') as any)
      .insert([{ product_id: productId, variant_id: variantId || null, email }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Successfully joined waitlist' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
