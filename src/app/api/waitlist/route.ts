import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Public waitlist signup — backs the "Notify me" CTA on out-of-stock product
// pages. Feeds the waitlist_signups table that the admin dashboard counts and
// that /api/waitlist/notify consumes when a restock or drop goes live.
// Public, unauthenticated by design (visitors aren't logged in).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, variantId, email } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'A valid email is required' },
        { status: 400 }
      );
    }

    // Best-effort dedupe: same email waiting on the same variant (or product
    // when no variant is given) doesn't create a duplicate row.
    let query = (getSupabaseAdmin() as any)
      .from('waitlist_signups')
      .select('id')
      .eq('product_id', productId)
      .eq('email', email.trim().toLowerCase());

    if (variantId && typeof variantId === 'string') {
      query = query.eq('variant_id', variantId);
    } else {
      query = query.is('variant_id', null);
    }

    const { data: existing } = await query.maybeSingle();
    if (existing) {
      return NextResponse.json({ success: true, alreadySignedUp: true });
    }

    const { error } = await (getSupabaseAdmin() as any)
      .from('waitlist_signups')
      .insert({
        product_id: productId,
        variant_id: variantId && typeof variantId === 'string' ? variantId : null,
        email: email.trim().toLowerCase(),
        notified: false,
      });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to join waitlist' },
      { status: 400 }
    );
  }
}
