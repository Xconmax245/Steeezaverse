"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MiniShopItem } from "@/lib/products";

// Shared storefront product card — visual language matches the homepage
// Mini-Shop carousel (tilted editorial cards, red price, uppercase meta).

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export function ProductCard({ product }: { product: MiniShopItem }) {
  const isNew = Date.now() - new Date(product.updated_at).getTime() < 1000 * 60 * 60 * 24 * 7;

  return (
    <motion.a
      href={`/shop/${product.slug}`}
      className="group relative flex-shrink-0 w-full flex flex-col gap-4 rounded-lg touch-pan-y"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      data-cuelume-hover="tick"
      draggable={false}
    >
      <div className="w-full aspect-[3/4] bg-[#111] rounded-lg overflow-hidden relative">
        {product.is_drop && (
          <div className="absolute top-4 left-4 z-20 bg-sz-red text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Drop
          </div>
        )}
        {!product.is_drop && isNew && (
          <div className="absolute top-4 left-4 z-20 bg-sz-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            New
          </div>
        )}

        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${
              product.hover_image ? "group-hover:opacity-0" : ""
            }`}
            draggable={false}
          />
        )}
        {product.hover_image && (
          <Image
            src={product.hover_image}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            draggable={false}
          />
        )}
        {!product.image && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-sans text-base text-white tracking-wide truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <p className="font-sans text-sm text-sz-red font-semibold">
            {formatNGN(product.base_price)}
          </p>
          {product.compare_at_price != null && product.compare_at_price > product.base_price && (
            <p className="font-sans text-xs text-white/30 line-through">
              {formatNGN(product.compare_at_price)}
            </p>
          )}
        </div>

        <div className="mt-3 text-sz-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 group/btn cursor-pointer">
          <span>Show more</span>
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </div>
      </div>
    </motion.a>
  );
}

export function ProductGrid({ products }: { products: MiniShopItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="border border-dashed border-white/10 rounded-lg py-24 flex flex-col items-center justify-center gap-3 bg-white/[0.02] text-center px-6">
      <p className="font-chillax text-sm uppercase tracking-widest text-white/40">{title}</p>
      {hint && <p className="text-xs uppercase tracking-wider text-white/25">{hint}</p>}
    </div>
  );
}
