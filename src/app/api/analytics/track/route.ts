import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Client-side page-view beacon (see AnalyticsTracker). Public, unauthenticated
// by design — visitors are not logged in. Input is validated and anonymous:
// only a path + an opaque per-browser visitor id are stored.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, visitor_id } = body;

    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    const visitor = typeof visitor_id === 'string' && visitor_id.length <= 64 ? visitor_id : null;

    const { error } = await (getSupabaseAdmin() as any)
      .from('page_views')
      .insert({ path, visitor_id: visitor });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}