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

  return (
    <motion.a
      href={`/product/${product.slug}`}
      className={`group relative flex flex-col gap-5 cursor-pointer ${className}`}
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
      <div className="w-full aspect-[4/5] bg-[#f4f4f4] relative transition-transform duration-700 ease-out group-hover:scale-[1.02]">
        
        {/* Inner Image Wrapper */}
        <div className="relative w-full h-full overflow-hidden bg-black/5">
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
            <div className="absolute inset-0 flex items-center justify-center text-black/20 text-[10px] uppercase tracking-widest">
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
              className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex justify-between items-start px-1 mt-1">
        {/* Left: Name and Color */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-chillax text-[15px] font-bold tracking-wide text-white/90 truncate group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <div className="text-[12px] text-white/40 font-chillax tracking-wide">
            Steezaverse - 1 Colour
          </div>
        </div>
        
        {/* Right: Plus and Price */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[12px] text-white/40 leading-none font-light">+</span>
          <span className="font-chillax text-[14px] text-white font-bold tracking-wide">
            {formatNGN(product.base_price)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
