import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';

// This route handles the server-side OTP/PKCE code exchange.
// It is only called when Supabase sends a token_hash (email OTP confirm flow)
// or a code (PKCE flow). After exchange it redirects to the client callback page
// so that the browser picks up the new session cookies immediately.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  const code = searchParams.get('code');

  if (token_hash && type) {
    const supabase = getServerSessionClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Redirect to client page so session cookies can be set in browser context
      return NextResponse.redirect(new URL(`/auth/callback?next=${encodeURIComponent(next)}`, request.url));
    }
  } else if (code) {
    const supabase = getServerSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(`/auth/callback?next=${encodeURIComponent(next)}`, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
}
