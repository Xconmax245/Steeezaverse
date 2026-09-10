"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, cartCount, subtotal, isLoading } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const router = useRouter();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;
    
    setPromoStatus("loading");
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPromoStatus("success");
      } else {
        setPromoStatus("error");
      }
    } catch (err) {
      setPromoStatus("error");
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0303] border-l border-white/10 z-[201] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-chillax text-xl font-bold uppercase tracking-widest text-white">
                Cart {cartCount > 0 && `(${cartCount})`}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-2 -mr-2"
                data-cuelume-hover="tick"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6">
                  <div className="text-white/40 uppercase tracking-widest text-sm">Your cart is empty</div>
                  <Link 
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="border border-white/20 px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    Go to Shop
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => {
                    const product = item.variant?.product;
                    const primaryImage = product?.product_images?.[0]?.url;
                    console.log("CART PRODUCT:", product);
                    
                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-32 bg-[#111] relative flex-shrink-0">
                          {primaryImage && (
                            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="flex flex-col flex-1 py-1 justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-sm font-bold tracking-wide uppercase text-white/90 leading-tight">
                                {product.name}
                              </h3>
                              <div className="text-xs text-white/50 tracking-wider mt-1 uppercase">
                                {item.variant?.size && `${item.variant.size}`}
                                {item.variant?.size && item.variant?.color && ' / '}
                                {item.variant?.color && `${item.variant.color}`}
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-white/30 hover:text-sz-red transition-colors"
                              data-cuelume-hover="tick"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-end justify-between mt-4">
                            <div className="flex items-center border border-white/20">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                data-cuelume-press
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-8 text-center text-sm">{item.quantity}</div>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                data-cuelume-press
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="text-sm font-bold tracking-widest">
                              {formatNGN(product.base_price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#050101]">
                {/* Promo */}
                <form onSubmit={handleApplyPromo} className="flex mb-6 relative">
                  <input
                    type="text"
                    placeholder="PROMO CODE"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white uppercase tracking-widest"
                  />
                  <button
                    type="submit"
                    disabled={!promoCode || promoStatus === "loading" || promoStatus === "success"}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ArrowRight size={16} />
                  </button>
                </form>
                {promoStatus === "success" && <p className="text-green-500 text-xs mb-4 uppercase tracking-widest">Promo code applied</p>}
                {promoStatus === "error" && <p className="text-sz-red text-xs mb-4 uppercase tracking-widest">Invalid or expired code</p>}

                {/* Subtotal */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/60 text-sm uppercase tracking-widest">Subtotal</span>
                  <span className="text-xl font-bold font-chillax text-white">{formatNGN(subtotal)}</span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-sz-red hover:bg-sz-red-dim text-white font-bold tracking-widest uppercase py-4 text-sm transition-colors flex items-center justify-center gap-2"
                  data-cuelume-press
                >
                  Checkout
                </button>
                <div className="text-center mt-4">
                  <Link 
                    href="/cart" 
                    onClick={() => setIsOpen(false)}
                    className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/100"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
