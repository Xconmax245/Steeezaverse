"use client";

import { useState, useTransition } from "react";
import { sendCustomerMessage } from "@/app/actions/order-actions";

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
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Message Customer</h3>
        <p className="text-sm text-gray-400">Cannot message guest customers without an account.</p>
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
        // Hide success message after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        console.error(res.error);
      }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Message Customer</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          placeholder="Type a custom notification message to the customer..."
          className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-sz-red disabled:opacity-50 min-h-[80px]"
        />
        <div className="flex items-center justify-between">
          <span className="text-sm">
            {status === "success" && <span className="text-green-400">Message sent successfully!</span>}
            {status === "error" && <span className="text-red-400">Failed to send message.</span>}
          </span>
          <button
            type="submit"
            disabled={isPending || !message.trim()}
            className="bg-sz-red hover:bg-sz-red/90 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50 transition-colors"
          >
            {isPending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
