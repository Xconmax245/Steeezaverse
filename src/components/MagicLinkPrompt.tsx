"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function MagicLinkPrompt({ email }: { email?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!email) return null;

  const handleSendLink = async () => {
    setStatus("loading");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/account/notifications`,
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
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center mt-8">
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
        <h3 className="font-chillax font-bold uppercase tracking-widest text-lg mb-2">Check your email</h3>
        <p className="text-white/60 text-sm">We&apos;ve sent a magic link to {email}. Click it to access your order tracking and notifications.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mt-8 flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-5 h-5 text-white/80" />
      </div>
      <h3 className="font-chillax font-bold uppercase tracking-widest text-xl mb-2">Track Your Order</h3>
      <p className="text-white/60 text-sm max-w-md mb-6">
        Want to track your order status and receive exclusive drop notifications? We created an account for you using {email}.
      </p>
      
      {status === "error" && (
        <p className="text-red-400 text-xs uppercase tracking-widest mb-4">Failed to send link. Please try again.</p>
      )}

      <button
        onClick={handleSendLink}
        disabled={status === "loading"}
        className="bg-white text-black rounded-full px-8 py-3 font-chillax font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
      >
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Login Link"}
      </button>
    </div>
  );
}
