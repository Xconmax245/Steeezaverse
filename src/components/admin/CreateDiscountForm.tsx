"use client";

import { useState } from "react";
import { createDiscount } from "@/app/actions/discount-actions";
import { Plus, X } from "lucide-react";

export default function CreateDiscountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get("code") as string,
      discount_type: formData.get("discount_type") as "percentage" | "fixed_amount",
      discount_value: Number(formData.get("discount_value")),
      min_order_value: formData.get("min_order_value") ? Number(formData.get("min_order_value")) : null,
      usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
      expires_at: formData.get("expires_at") ? (formData.get("expires_at") as string) : null,
    };

    const res = await createDiscount(data);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || "Failed to create discount");
    }
    
    setIsPending(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-sz-red hover:bg-sz-red-dim text-white px-6 py-3 font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center gap-2"
      >
        <Plus size={16} /> New Discount
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-md rounded p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-chillax text-xl font-bold uppercase tracking-widest text-white">Create Promo Code</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-sz-red/10 border border-sz-red/20 text-sz-red p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Code</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. SUMMER20"
                  className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Type</label>
                  <select
                    name="discount_type"
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Value</label>
                  <input
                    name="discount_value"
                    type="number"
                    step="any"
                    required
                    min="1"
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Minimum Order Value (Optional)</label>
                <input
                  name="min_order_value"
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Usage Limit (Optional)</label>
                  <input
                    name="usage_limit"
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/60 mb-2">Expires At (Optional)</label>
                  <input
                    name="expires_at"
                    type="datetime-local"
                    className="w-full bg-black border border-white/10 rounded px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white [color-scheme:dark]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-white hover:bg-white/90 text-black font-bold uppercase tracking-widest py-3 mt-4 transition-colors disabled:opacity-50 rounded"
              >
                {isPending ? "Creating..." : "Create Code"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
