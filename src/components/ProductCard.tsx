"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { MiniShopItem } from "@/lib/products";
import { useCart } from "./CartContext";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

interface ProductCardProps {
  product: MiniShopItem;
  className?: string;
  enable3D?: boolean;
  enableEntrance?: boolean;
}

export function ProductCard({
  product,
  className = "",
  enableEntrance = true,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [addState, setAddState] = useState<"idle" | "loading" | "done">("idle");

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (addState !== "idle") return;
    setAddState("loading");
    try {
      // Fetch the first variant for this product
      const res = await fetch(`/api/products/${product.slug}`);
      if (res.ok) {
        const data = await res.json();
        const firstVariant = data.variants?.[0];
        if (firstVariant?.id) {
          await addItem(firstVariant.id, 1, true);
          setAddState("done");
          setTimeout(() => setAddState("idle"), 2000);
          return;
        }
      }
    } catch {}
    setAddState("idle");
  }

  return (
    <motion.div
      className={`group relative flex flex-col ${className}`}
      {...(enableEntrance
        ? {
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-50px" },
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }
        : {})}
    >
      {/* Image Container — clickable, navigates to product */}
      <Link
        href={`/product/${product.slug}`}
        className="block w-full relative overflow-hidden bg-[#111]"
        draggable={false}
        data-cuelume-hover="tick"
      >
        <div className="w-full aspect-[3/4] relative">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                product.hover_image ? "group-hover:opacity-0" : ""
              }`}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
              No image
            </div>
          )}

          {/* Hover / Alternate Image */}
          {product.hover_image && (
            <Image
              src={product.hover_image}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
              draggable={false}
            />
          )}

          {/* Sale badge */}
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="absolute top-3 left-3 bg-sz-red text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
              SALE
            </span>
          )}
        </div>
      </Link>

      {/* Info + CTA */}
      <div className="flex flex-col gap-3 pt-4 px-1">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-chillax text-[14px] font-bold tracking-wide text-white/90 group-hover:text-white transition-colors leading-tight truncate">
                {product.name}
              </h3>
            </Link>
            <span className="text-[11px] text-white/35 font-chillax tracking-wide">
              Steezaverse
            </span>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="font-chillax text-[14px] text-white font-bold tracking-wide whitespace-nowrap">
              {formatNGN(product.base_price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.base_price && (
              <span className="font-chillax text-[11px] text-white/30 line-through">
                {formatNGN(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={addState === "loading"}
          data-cuelume-hover="tick"
          className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300
            ${
              addState === "done"
                ? "bg-green-500/20 border border-green-500/40 text-green-400"
                : "bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white"
            }
          `}
        >
          {addState === "done" ? (
            <><Check size={13} strokeWidth={2.5} /><span>Added</span></>
          ) : addState === "loading" ? (
            <span className="opacity-50">Adding…</span>
          ) : (
            <><ShoppingBag size={13} strokeWidth={2} /><span>Add to Cart</span></>
          )}
        </button>
      </div>
    </motion.div>
  );
}
