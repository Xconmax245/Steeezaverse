import { NextResponse } from 'next/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';

export async function POST(request: Request) {
  const supabase = getServerSessionClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  });
}
