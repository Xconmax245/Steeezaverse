import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { productId, variantId } = await request.json();
    
    // Fetch users waiting for this product/variant
    let query = supabaseAdmin.from('waitlist_signups').select('*').eq('notified', false).eq('product_id', productId);
    if (variantId) {
      query = query.eq('variant_id', variantId);
    }
    
    const { data: signups, error } = await query;
    if (error) throw error;

    // Trigger emails (pseudo-code)
    // for (const signup of signups) {
    //   await sendNotificationEmail(signup.email, 'Back in stock!');
    //   await supabaseAdmin.from('waitlist_signups').update({ notified: true }).eq('id', signup.id);
    // }

    return NextResponse.json({ success: true, notifiedCount: signups?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
