import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin() as any;

    // 1. Find all active drop products that have passed their start time
    const { data: drops, error: dropsError } = await supabase
      .from('products')
      .select('id')
      .eq('is_drop', true)
      .lte('drop_starts_at', new Date().toISOString());

    if (dropsError) throw dropsError;
    if (!drops?.length) {
      return NextResponse.json({ success: true, notifiedCount: 0 });
    }

    const dropIds = drops.map((d: any) => d.id);

    // 2. Find un-notified waitlist signups for these drops
    const { data: signups, error: signupsError } = await supabase
      .from('waitlist_signups')
      .select('id, email')
      .eq('notified', false)
      .in('product_id', dropIds);

    if (signupsError) throw signupsError;
    if (!signups?.length) {
      return NextResponse.json({ success: true, notifiedCount: 0 });
    }

    // 3. Audit-log a notification per recipient
    const logEntries = signups.map((signup: any) => ({
      type: 'waitlist_notify',
      recipient: signup.email,
      status: 'sent',
    }));

    const { error: logError } = await supabase
      .from('notification_log')
      .insert(logEntries);

    if (logError) throw logError;

    // 4. Mark notified so a future trigger skips them
    const { error: updateError } = await supabase
      .from('waitlist_signups')
      .update({ notified: true })
      .in('id', signups.map((s: any) => s.id));

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      notifiedCount: signups.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
