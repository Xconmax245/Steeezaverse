"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, isLoading } = useCart();

  return (
    <main className="min-h-[80vh] bg-[#0a0303] pt-24 px-6 md:px-12 text-white">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest mb-12">Your Cart</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6 border-t border-b border-white/10">
            <div className="text-white/40 uppercase tracking-widest text-lg">Your cart is empty</div>
            <Link 
              href="/shop"
              className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Line Items */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {items.map((item) => {
                const product = item.variant?.product;
                const primaryImage = product?.product_images?.[0]?.url;
                
                if (!product) return null;

                return (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 border-b border-white/10 pb-8">
                    {/* Image */}
                    <div className="w-full md:w-32 h-48 bg-[#111] relative flex-shrink-0">
                      {primaryImage && (
                        <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-col flex-1 justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-bold tracking-wide uppercase text-white/90">
                            <Link href={`/product/${product.slug}`} className="hover:text-sz-red transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                          <div className="text-sm text-white/50 tracking-wider mt-2 uppercase">
                            {item.variant?.size && `${item.variant.size}`}
                            {item.variant?.size && item.variant?.color && ' / '}
                            {item.variant?.color && `${item.variant.color}`}
                          </div>
                        </div>
                        <div className="text-lg font-bold tracking-widest text-sz-red">
                          {formatNGN(product.base_price)}
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-between mt-6">
                        <div className="flex items-center border border-white/20">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            data-cuelume-press
                          >
                            <Minus size={16} />
                          </button>
                          <div className="w-10 text-center text-sm">{item.quantity}</div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            data-cuelume-press
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 hover:text-sz-red transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
                          data-cuelume-hover="tick"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#111] border border-white/10 p-8 sticky top-24">
                <h2 className="font-chillax text-xl font-bold uppercase tracking-widest mb-6">Order Summary</h2>
                
                <div className="flex justify-between items-center mb-4 text-white/60 uppercase tracking-widest text-sm">
                  <span>Subtotal</span>
                  <span>{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-white/60 uppercase tracking-widest text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="border-t border-white/10 pt-6 flex justify-between items-center mb-8">
                  <span className="text-white uppercase tracking-widest font-bold">Total</span>
                  <span className="text-2xl font-bold font-chillax text-white">{formatNGN(subtotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-sz-red hover:bg-sz-red-dim text-white text-center font-bold tracking-widest uppercase py-5 text-sm transition-colors"
                  data-cuelume-press
                >
                  Proceed to Checkout
                </Link>
                
                <div className="mt-6 flex gap-2 items-center justify-center text-white/30 text-xs tracking-widest uppercase">
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
