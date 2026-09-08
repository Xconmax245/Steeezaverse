import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Lazy singleton — only created when first used (not at build time)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabase;
}

// Backward-compat export (resolved lazily via getter)
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
