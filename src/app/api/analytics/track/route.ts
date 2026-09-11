import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';
import { cookies } from 'next/headers';

// Client-side visit tracker. Only tracks authenticated customers, once per session.
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    if (cookieStore.get('sz_visit_counted')?.value === '1') {
      return NextResponse.json({ success: true, cached: true });
    }

    const supabaseAuth = getServerSessionClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    
    if (!user) {
      // Anonymous traffic is no longer tracked to save on DB writes
      return NextResponse.json({ success: true, anonymous: true });
    }

    const { error } = await (getSupabaseAdmin() as any).rpc('increment_customer_visit', {
      customer_uid: user.id
    });

    if (error) throw error;

    // Mark as counted for this session (cookie clears when browser closes)
    cookieStore.set('sz_visit_counted', '1');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}