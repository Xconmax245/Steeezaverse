import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Server client that reads the Supabase session from request cookies.
// Scoped per-request (cookie state differs per request) — it does NOT hold a
// database connection, so it does not count against the pooled connection cap.
// Use alongside the singleton service-role client (server.ts) for data access.
export function getServerSessionClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies cannot be written.
            // Sessions set here are only persisted when invoked from a route
            // handler or server action, which is fine for our read-only guards.
          }
        },
      },
    }
  );
}