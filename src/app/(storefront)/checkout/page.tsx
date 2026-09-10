"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function CheckoutPage() {
  const { cartId, items, subtotal, isLoading: cartLoading } = useCart();
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [gateway, setGateway] = useState<"paystack" | "flutterwave" | null>(null);
  
  // App State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Discount
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "error">("idle");

  const shippingCost = 0; // Flat rate per .env.local specification
  const total = Math.max(0, subtotal - (appliedPromo?.discountAmount || 0)) + shippingCost;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setCustomerId(session.user.id);
        setEmail(session.user.email || "");
      }
    });
  }, []);

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
        setAppliedPromo({ code: promoCode, discountAmount: data.discountAmount });
        setPromoStatus("idle");
      } else {
        setPromoStatus("error");
      }
    } catch {
      setPromoStatus("error");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client validation (mirroring server requirements)
    if (!fullName.trim() || !line1.trim() || !city.trim() || !state.trim() || !phone.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!gateway) {
      setError("Please select a payment method.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cartId,
        customerId,
        email: email.trim(),
        gateway,
        discountCode: appliedPromo?.code || null,
        shippingAddress: {
          full_name: fullName.trim(),
          line1: line1.trim(),
          line2: line2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          phone: phone.trim()
        }
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error || "Checkout failed. Please try again.");
        setIsSubmitting(false);
      } else {
        // Successful order creation -> redirect to payment gateway URL.
        // We DO NOT clear the cart here. Webhooks or the confirmation page will handle it.
        window.location.href = data.authorizationUrl;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-black text-white text-center">
        <h1 className="text-3xl font-chillax font-bold uppercase tracking-widest mb-6">Your Cart is Empty</h1>
        <p className="text-white/60 max-w-md mb-8">You cannot proceed to checkout with an empty cart.</p>
        <button
          onClick={() => router.push("/shop")}
          className="border border-white/20 rounded-full px-8 py-3 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Side - Forms */}
        <div className="flex-1 w-full lg:max-w-2xl flex flex-col gap-12">
          <div>
            <h1 className="font-chillax text-3xl font-bold uppercase tracking-widest mb-2">Checkout</h1>
            <p className="text-white/50 text-sm">Secure your limited pieces.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-10">
            {/* Contact Info */}
            <div className="flex flex-col gap-6">
              <h2 className="font-chillax text-xl font-bold uppercase tracking-widest border-b border-white/10 pb-4">1. Contact</h2>
              <div>
                <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="flex flex-col gap-6">
              <h2 className="font-chillax text-xl font-bold uppercase tracking-widest border-b border-white/10 pb-4">2. Shipping</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="123 Street Name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="Lagos"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="Lagos State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold tracking-widest text-white/50 uppercase mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-all focus:bg-white/[0.05]"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-6">
              <h2 className="font-chillax text-xl font-bold uppercase tracking-widest border-b border-white/10 pb-4">3. Payment</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paystack Card */}
                <div 
                  onClick={() => setGateway("paystack")}
                  className={`cursor-pointer rounded-2xl border p-6 flex flex-col items-start gap-4 transition-all duration-300 ${gateway === "paystack" ? "border-white bg-white/5" : "border-white/10 hover:border-white/30 bg-transparent"}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-chillax font-bold uppercase tracking-widest text-sm">Paystack</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gateway === "paystack" ? "border-white" : "border-white/30"}`}>
                      {gateway === "paystack" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">Pay securely via Cards, Bank Transfer, or USSD.</p>
                </div>

                {/* Flutterwave Card */}
                <div 
                  onClick={() => setGateway("flutterwave")}
                  className={`cursor-pointer rounded-2xl border p-6 flex flex-col items-start gap-4 transition-all duration-300 ${gateway === "flutterwave" ? "border-white bg-white/5" : "border-white/10 hover:border-white/30 bg-transparent"}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-chillax font-bold uppercase tracking-widest text-sm">Flutterwave</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gateway === "flutterwave" ? "border-white" : "border-white/30"}`}>
                      {gateway === "flutterwave" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">Alternative secure gateway for African payments.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side - Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-32 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 flex flex-col gap-8 rounded-3xl shadow-2xl">
            <h2 className="font-chillax text-2xl font-bold uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto scrollbar-hide pt-2 pr-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-white/5 flex-shrink-0 rounded-lg">
                    {item.variant?.product?.product_images?.[0]?.url && (
                      <Image
                        src={item.variant.product.product_images[0].url}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover opacity-80 rounded-lg"
                      />
                    )}
                    <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <span className="font-bold text-sm uppercase tracking-wider">{item.variant?.product?.name}</span>
                    <span className="text-white/50 text-xs mt-1">
                      {item.variant?.color} / {item.variant?.size}
                    </span>
                    <span className="text-sm mt-2">
                      {formatNGN((item.variant?.price_override ?? item.variant?.product?.base_price ?? 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 border-y border-white/10 py-6">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromo}
                className="flex-1 rounded-xl bg-white/[0.03] border border-white/20 px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/50 uppercase"
              />
              <button
                type="submit"
                disabled={!promoCode || !!appliedPromo || promoStatus === "loading"}
                className="bg-white/10 hover:bg-white/20 text-white px-6 text-xs uppercase tracking-widest font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {appliedPromo ? "Applied" : "Apply"}
              </button>
            </form>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>{formatNGN(subtotal)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-[#ff2a2a]">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatNGN(appliedPromo.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatNGN(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-white/10">
                <span>Total</span>
                <span className="font-chillax text-xl">{formatNGN(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full rounded-full bg-white text-black py-5 font-chillax text-[14px] font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Pay Securely
                </>
              )}
            </button>
            <div className="flex justify-center items-center gap-2 text-white/30 text-[10px] uppercase tracking-widest">
              <CreditCard className="w-3 h-3" /> Encrypted Processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
