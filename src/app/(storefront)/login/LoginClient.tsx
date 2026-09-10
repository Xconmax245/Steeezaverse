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
          emailRedirectTo: `${window.location.origin}/account/orders`,
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
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-chillax font-bold uppercase tracking-widest text-xl mb-2">Check your email</h3>
        <p className="text-white/60 text-sm">We&apos;ve sent a magic link to {email}. Click it to access your account.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors"
          />
        </div>
        
        {status === "error" && (
          <p className="text-red-400 text-xs uppercase tracking-widest mt-2">Failed to send link. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-white hover:bg-white/90 text-black font-bold uppercase tracking-widest py-4 mt-2 transition-colors rounded shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Link"}
        </button>
      </form>
    </div>
  );
}
