import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendTelegramAlert } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const { productId, variantId, email } = await request.json();

    if (!productId || !email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await (supabaseAdmin.from('waitlist_signups') as any)
      .insert([{ product_id: productId, variant_id: variantId || null, email }]);

    if (error) throw error;

    // Fetch product name for the telegram alert (fire-and-forget)
    (async () => {
      try {
        const { data: product } = await (supabaseAdmin.from('products') as any)
          .select('name')
          .eq('id', productId)
          .single();
          
        let variantText = '';
        if (variantId) {
          const { data: variant } = await (supabaseAdmin.from('product_variants') as any)
            .select('size, color')
            .eq('id', variantId)
            .single();
          if (variant) {
            variantText = ` (${variant.color}, ${variant.size})`;
          }
        }
        
        const productName = product?.name || 'Unknown Product';
        const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steezaverse.com';
        
        await sendTelegramAlert({
          type: 'telegram_waitlist_alert',
          text: `👀 <b>New waitlist signup:</b> ${productName}${variantText}\n\nAdmin: ${adminUrl}/admin/products/${productId}`,
        });
      } catch (err) {
        console.error('Waitlist telegram alert error:', err);
      }
    })();

    return NextResponse.json({ success: true, message: 'Successfully joined waitlist' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
