import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  
  // Also check for the PKCE code parameter
  const code = searchParams.get('code');

  if (token_hash && type) {
    const supabase = getServerSessionClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(`/${next.slice(1)}`, request.url));
    }
  } else if (code) {
    const supabase = getServerSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(`/${next.slice(1)}`, request.url));
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
}
