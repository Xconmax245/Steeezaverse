"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // The URL will have #access_token=... or ?code=... depending on flow type.
    // supabase-ssr's createBrowserClient automatically detects and exchanges
    // the session from the URL fragment. We just need to wait for it.

    const next = searchParams.get("next") || searchParams.get("redirect") || "/";

    const checkSession = async () => {
      const code = searchParams.get("code");
      
      if (code) {
        // Explicitly exchange PKCE code on the client
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (data.session) {
          router.replace(next);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Session established - go to destination
        router.replace(next);
        return;
      }

      // If no session yet, listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          subscription.unsubscribe();
          router.replace(next);
        }
      });

      // Fallback: if nothing happens in 5s, redirect to login
      setTimeout(() => {
        subscription.unsubscribe();
        router.replace("/login?error=invalid_link");
      }, 5000);
    };

    checkSession();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-white">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="font-chillax uppercase tracking-widest text-sm text-white/60">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
