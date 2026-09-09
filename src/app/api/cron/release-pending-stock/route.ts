import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// External trigger for the abandoned-order stock release. The actual work runs
// inside Postgres (release_expired_pending_orders, scheduled by pg_cron every
// 20 min via migration 00003) — this route lets an external scheduler
// (cron-job.org, Vercel Pro cron, etc.) fire the same function at a finer
// cadence if desired. Idempotent: overlapping runs simply release nothing.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data, error } = await (getSupabaseAdmin().rpc as any)(
      'release_expired_pending_orders',
      { p_age_minutes: 20 }
    );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      releasedCount: data ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}