"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [authError, setAuthError] = useState<string | null>(
    errorParam === "invalid_link" ? "Invalid or expired link. Please try again." : null
  );

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const nextUrl = searchParams.get("redirect") || searchParams.get("next") || "/account/orders";
        router.replace(nextUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setAuthError(null);
    try {
      const nextUrl = searchParams.get("redirect") || searchParams.get("next") || "/account/orders";
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const [otpCode, setOtpCode] = useState("");

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    
    setStatus("loading");
    setAuthError(null);
    try {
      const cleanOtp = otpCode.trim();
      
      // Supabase generates different token types depending on user state and configuration.
      // We try the standard 'email' first, then fallback to 'magiclink' (existing users) and 'signup' (new users).
      let res = await supabase.auth.verifyOtp({ email, token: cleanOtp, type: 'email' });
      
      if (res.error && res.error.message.toLowerCase().includes("invalid")) {
        res = await supabase.auth.verifyOtp({ email, token: cleanOtp, type: 'magiclink' });
      }
      
      if (res.error && res.error.message.toLowerCase().includes("invalid")) {
        res = await supabase.auth.verifyOtp({ email, token: cleanOtp, type: 'signup' });
      }

      if (res.error) throw res.error;
      // onAuthStateChange will handle the redirect
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setAuthError(err.message || "Invalid code. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center mt-8 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-black mx-auto mb-4" />
        <h3 className="font-chillax font-bold text-xl mb-2 text-black">Check your email</h3>
        <p className="text-black/60 text-sm mb-6">We&apos;ve sent a 6-digit security code to {email}.</p>
        
        <div>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full bg-white border border-gray-300 rounded-[24px] px-6 py-4 text-center tracking-[0.5em] text-2xl font-bold text-black placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            <button
              type="submit"
              disabled={otpCode.length < 6}
              className="w-full bg-black hover:bg-black/90 text-white font-medium py-4 rounded-[24px] transition-colors disabled:opacity-50 mt-2 text-lg"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-black ml-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
            className="w-full bg-white border border-gray-300 rounded-[24px] px-6 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          />
        </div>
        
        {(status === "error" || authError) && (
          <p className="text-red-500 text-sm mt-1 ml-1">{authError || "Failed to send link. Please try again."}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-black hover:bg-black/90 text-white font-medium py-4 mt-4 transition-colors rounded-[24px] flex items-center justify-center disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Code"}
        </button>
      </form>
      
      <div className="mt-8 text-center flex items-center gap-2 justify-center text-sm text-black/50">
        <span className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-black/20"></span>
        </span>
        No password required. Secure login code sent instantly.
      </div>
    </div>
  );
}
