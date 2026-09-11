"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/confirm?next=/account/orders`,
        },
      });

      if (error) throw error;
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center mt-8">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="font-chillax font-bold text-xl mb-2 text-black">Check your email</h3>
        <p className="text-black/60 text-sm">We&apos;ve sent a magic link to {email}. Click it to access your account.</p>
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
        
        {status === "error" && (
          <p className="text-red-500 text-sm mt-1 ml-1">Failed to send link. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-black hover:bg-black/90 text-white font-medium py-4 mt-4 transition-colors rounded-[24px] flex items-center justify-center disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Link"}
        </button>
      </form>
      
      <div className="mt-8 text-center flex items-center gap-2 justify-center text-sm text-black/50">
        <span className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-black/20"></span>
        </span>
        No password required. Secure magic link sent instantly.
      </div>
    </div>
  );
}
