"use client";

import { useState, useTransition } from "react";
import { sendCustomerMessage } from "@/app/actions/order-actions";
import { Send, MessageSquare } from "lucide-react";

export default function MessageCustomerForm({
  orderId,
  customerId,
}: {
  orderId: string;
  customerId?: string;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!customerId) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-3">
        <MessageSquare className="w-4 h-4 text-white/20 flex-shrink-0" />
        <p className="text-xs text-white/30 font-chillax uppercase tracking-widest">
          Guest order — cannot send in-app message
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("idle");
    startTransition(async () => {
      const res = await sendCustomerMessage(orderId, customerId, message);
      if (res.success) {
        setStatus("success");
        setMessage("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-white/30" />
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-chillax font-bold">
          Message Customer
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          placeholder="Type an in-app notification to send to this customer..."
          rows={3}
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors disabled:opacity-50 resize-none font-sans"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs font-chillax uppercase tracking-widest">
            {status === "success" && <span className="text-green-400">✓ Sent</span>}
            {status === "error" && <span className="text-red-400">Failed to send</span>}
          </span>
          <button
            type="submit"
            disabled={isPending || !message.trim()}
            className="flex items-center gap-2 bg-white text-black text-xs font-chillax font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-white/90 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send className="w-3 h-3" />
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
