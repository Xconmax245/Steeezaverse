import { createClient } from '@supabase/supabase-js'

// Lazy singleton — only created when first used (not at build time)
// WARNING: This client bypasses RLS. Use only in trusted server environments.
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabaseAdmin;
}

// Backward-compat export (resolved lazily via getter)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
