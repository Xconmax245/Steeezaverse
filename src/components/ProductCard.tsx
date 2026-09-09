"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { MiniShopItem } from "@/lib/products";

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
  const isSale = product.compare_at_price != null && product.compare_at_price > product.base_price;
  
  let discountPercent = 0;
  if (isSale && product.compare_at_price) {
    discountPercent = Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100);
  }

  return (
    <motion.a
      href={`/shop/${product.slug}`}
      className={`group relative flex flex-col gap-4 cursor-pointer ${className}`}
      {...(enableEntrance
        ? {
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-50px" },
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }
        : {})}
      data-cuelume-hover="tick"
      draggable={false}
    >
      {/* Image Container */}
      <div className="w-full aspect-[4/5] bg-[#f4f4f4] relative overflow-hidden flex items-center justify-center transition-colors group-hover:bg-[#ebebeb]">
        {/* SALE Badge (Top Right) */}
        {isSale && (
          <div className="absolute top-4 right-4 z-20 text-[9px] uppercase tracking-widest text-black/40 font-medium">
            Sale
          </div>
        )}

        {/* Primary Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-105 ${
              product.hover_image ? "group-hover:opacity-0" : ""
            }`}
            draggable={false}
          />
        ) : (
          <div className="text-black/20 text-[10px] uppercase tracking-widest">
            No image
          </div>
        )}

        {/* Hover Image */}
        {product.hover_image && (
          <Image
            src={product.hover_image}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-8 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
            draggable={false}
          />
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-1.5 px-1">
        {/* Row 1: Discount & Plus Icon */}
        <div className="flex justify-between items-center text-[10px] text-white/50 font-medium uppercase tracking-widest">
          <span>{isSale ? `${discountPercent}% OFF` : ""}</span>
          <span className="text-lg leading-none font-light">+</span>
        </div>
        
        {/* Row 2: Product Name & Prices */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-sans text-[13px] font-medium text-white/90 truncate group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {isSale && product.compare_at_price && (
              <span className="font-sans text-[11px] text-white/40 line-through">
                {formatNGN(product.compare_at_price)}
              </span>
            )}
            <span className="font-sans text-[13px] text-white font-medium">
              {formatNGN(product.base_price)}
            </span>
          </div>
        </div>

        {/* Row 3: Colors (Static Placeholder to match design) */}
        <div className="text-[11px] text-white/40 font-sans mt-0.5">
          Steezaverse • 1 Colour
        </div>
      </div>
    </motion.a>
  );
}
