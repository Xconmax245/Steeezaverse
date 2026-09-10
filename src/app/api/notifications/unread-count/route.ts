import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    // Bypass RLS here with admin since we already verified the user via auth.getUser()
    // Or we could use the normal client, but since we're returning just a count, this is fine.
    const { count, error } = await (getSupabaseAdmin() as any)
      .from('customer_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error("Unread count endpoint error:", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
