"use client";

import { useMemo, useState } from "react";
import type { ShopProduct } from "@/lib/products";

// Purchase-side interactivity for /shop/[slug]: variant selection, live stock
// display, and the waitlist capture for sold-out variants (posts to
// /api/waitlist, feeds the admin dashboard's waitlist stats).

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function ProductPurchasePanel({ product }: { product: ShopProduct }) {
  const inStockVariants = useMemo(
    () => product.variants.filter((v) => v.stock_quantity > 0),
    [product.variants]
  );
  const totalStock = useMemo(
    () => product.variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    [product.variants]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    inStockVariants[0]?.id ?? null
  );
  const selected = product.variants.find((v) => v.id === selectedId) ?? null;

  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const unitPrice = selected?.price_override ?? product.base_price;
  const soldOut = totalStock === 0 || !selected;

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitlistState("sending");
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selected?.id ?? null,
          email,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to join waitlist");
      setWaitlistState("done");
    } catch (err: any) {
      setWaitlistError(err.message || "Failed to join waitlist");
      setWaitlistState("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <p className="font-chillax text-3xl font-bold text-sz-red">{formatNGN(unitPrice)}</p>
        {product.compare_at_price != null && product.compare_at_price > unitPrice && (
          <p className="font-sans text-sm text-white/30 line-through">
            {formatNGN(product.compare_at_price)}
          </p>
        )}
      </div>

      {/* Variant picker */}
      {product.variants.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
            Select variant
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selectedId;
              const out = variant.stock_quantity <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={out}
                  onClick={() => setSelectedId(variant.id)}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider border transition-all duration-300 ${
                    isSelected
                      ? "bg-sz-red/10 border-sz-red text-sz-red"
                      : out
                        ? "bg-transparent border-white/5 text-white/20 line-through cursor-not-allowed"
                        : "bg-transparent border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                  title={
                    out
                      ? "Sold out — join the waitlist"
                      : `${variant.stock_quantity} in stock`
                  }
                >
                  {[variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku || "One size"}
                </button>
              );
            })}
          </div>

          {/* Stock line */}
          <p className="mt-3 text-[10px] uppercase tracking-wider">
            {selected && selected.stock_quantity > 0 ? (
              selected.stock_quantity <= 5 ? (
                <span className="text-yellow-400">
                  Only {selected.stock_quantity} left — moving fast
                </span>
              ) : (
                <span className="text-white/30">In stock and ready to ship</span>
              )
            ) : (
              <span className="text-sz-red">This variant is sold out</span>
            )}
          </p>
        </div>
      )}

      {/* Primary CTA — checkout wired in when the cart flow ships */}
      {!soldOut && (
        <button
          type="button"
          className="w-full rounded-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-white/85 transition-colors disabled:opacity-50"
          data-cuelume-press
          data-cuelume-release
          onClick={() => {
            // Placeholder until the cart/checkout flow lands on the storefront.
            alert("Checkout is coming soon — this button will start payment.");
          }}
        >
          Add to cart — {formatNGN(unitPrice)}
        </button>
      )}

      {/* Waitlist for sold-out products / variants */}
      {(soldOut || product.variants.length === 0) && (
        <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02]">
          {waitlistState === "done" ? (
            <p className="text-xs uppercase tracking-widest text-green-400">
              You&apos;re on the list — we&apos;ll email you the moment it&apos;s back
            </p>
          ) : (
            <form onSubmit={joinWaitlist} className="flex flex-col gap-4">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Sold out — join the waitlist for first access on restock
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-sz-red"
                />
                <button
                  type="submit"
                  disabled={waitlistState === "sending"}
                  className="rounded-md bg-sz-red px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-sz-red-dim transition-colors disabled:opacity-50"
                >
                  {waitlistState === "sending" ? "…" : "Notify me"}
                </button>
              </div>
              {waitlistError && (
                <p className="text-[11px] text-sz-red uppercase tracking-wider">{waitlistError}</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
