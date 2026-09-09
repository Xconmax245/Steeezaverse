import { NextResponse } from 'next/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  role: 'owner' | 'staff';
}

/**
 * Resolves the current admin, or null when unauthenticated / not an admin.
 * Flow is deliberately separate from customer auth:
 *  1. Read the Supabase session from cookies (anon-key client, no trust).
 *  2. Look up the email in `admin_users` with the service-role client.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = getServerSessionClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user?.email) return null;

  const { data } = await getSupabaseAdmin()
    .from('admin_users')
    .select('id, email, role')
    .eq('email', user.email)
    .single();

  if (!data) return null;

  const admin = data as unknown as AdminUser;
  return admin;
}

/**
 * Guard for API routes: returns a 401 JSON response (or null when authorized).
 * Usage: `const unauthorized = await requireAdmin(); if (unauthorized) return unauthorized;`
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}