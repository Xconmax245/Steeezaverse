import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Browser client that persists the session in cookies so the server-side
// admin session client (server-session.ts) can read it. Used ONLY for the
// admin auth flow — the storefront keeps its own localStorage-based client
// (client.ts). Admin and customer auth intentionally do not share sessions.
export function getBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}