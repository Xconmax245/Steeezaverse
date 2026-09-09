import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Triggered on restock or drop-live. Marks matching waitlist signups as
// notified and logs a notification per recipient. Email dispatch itself is
// handled by /api/notifications/send once an email provider is configured;
// this route records the intent/audit trail.
//
// Usage: { productId, variantId? } — variantId narrows to one variant,
// omit to notify everyone waiting on the product (e.g. drop is live).
export async function POST(request: Request) {
  try {
    const { productId, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    let query = getSupabaseAdmin()
      .from('waitlist_signups')
      .select('id, email')
      .eq('notified', false)
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data: signups, error } = await query;
    if (error) throw error;

    if (!signups?.length) {
      return NextResponse.json({ success: true, notifiedCount: 0 });
    }

    // Audit-log a notification per recipient.
    const logEntries = (signups as any[]).map((signup) => ({
      type: 'waitlist_notify',
      recipient: signup.email,
      status: 'sent',
    }));

    const { error: logError } = await (getSupabaseAdmin() as any)
      .from('notification_log')
      .insert(logEntries);

    if (logError) throw logError;

    // Mark notified so a future trigger skips them.
    const { error: updateError } = await (getSupabaseAdmin() as any)
      .from('waitlist_signups')
      .update({ notified: true })
      .in(
        'id',
        (signups as any[]).map((s) => s.id)
      );

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      notifiedCount: signups.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}