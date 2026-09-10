"use client";

import { useCart } from "@/components/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ArrowRight } from "lucide-react";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, isLoading } = useCart();

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-24 px-6 md:px-12 text-white">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="font-chillax text-4xl md:text-5xl font-bold uppercase tracking-widest mb-12 flex items-center gap-4">
          Your Cart
          <span className="text-white/20 text-2xl">{items.length}</span>
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/80 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
            <div className="text-white/40 uppercase tracking-widest text-lg mb-8 font-chillax">Your cart is empty</div>
            <Link 
              href="/shop"
              className="bg-white text-black px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors rounded-full"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Line Items */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              {items.map((item) => {
                const product = item.variant?.product;
                const primaryImage = product?.product_images?.[0]?.url;
                
                if (!product) return null;

                return (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl transition-all hover:bg-white/[0.03]">
                    {/* Image */}
                    <div className="w-full md:w-32 h-40 bg-black/50 relative flex-shrink-0 rounded-2xl overflow-hidden border border-white/5">
                      {primaryImage && (
                        <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-col flex-1 justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-chillax font-bold tracking-wide uppercase text-white">
                            <Link href={`/product/${product.slug}`} className="hover:text-sz-red transition-colors">
                              {product.name}
                            </Link>
                          </h3>
                          <div className="text-sm text-white/50 tracking-wider mt-2 uppercase flex items-center gap-2">
                            {item.variant?.size && <span>{item.variant.size}</span>}
                            {item.variant?.size && item.variant?.color && <span className="w-1 h-1 bg-white/20 rounded-full" />}
                            {item.variant?.color && <span>{item.variant.color}</span>}
                          </div>
                        </div>
                        <div className="text-lg font-bold font-chillax tracking-widest text-sz-red">
                          {formatNGN(product.base_price)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center bg-black/50 border border-white/10 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            data-cuelume-press
                          >
                            <Minus size={14} />
                          </button>
                          <div className="w-8 text-center text-sm font-medium">{item.quantity}</div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            data-cuelume-press
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-sz-red hover:bg-sz-red/10 rounded-full transition-all"
                          aria-label="Remove item"
                          data-cuelume-hover="tick"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Summary Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl sticky top-32">
                <h2 className="font-chillax text-xl font-bold uppercase tracking-widest mb-8 text-white">Order Summary</h2>
                
                <div className="flex justify-between items-center mb-5 text-white/60 uppercase tracking-widest text-sm">
                  <span>Subtotal</span>
                  <span className="text-white">{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-8 text-white/60 uppercase tracking-widest text-sm">
                  <span>Shipping</span>
                  <span className="text-right text-xs">Calculated at<br/>checkout</span>
                </div>
                
                <div className="border-t border-white/10 pt-6 flex justify-between items-center mb-10">
                  <span className="text-white uppercase tracking-widest font-bold">Total</span>
                  <span className="text-2xl font-bold font-chillax text-white">{formatNGN(subtotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-3 w-full bg-sz-red hover:bg-sz-red/90 text-white font-chillax font-bold tracking-widest uppercase py-4 rounded-full text-sm transition-colors"
                  data-cuelume-press
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>
                
                <div className="mt-6 text-center text-white/40 text-[10px] tracking-widest uppercase">
                  Secure Checkout Guaranteed
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
