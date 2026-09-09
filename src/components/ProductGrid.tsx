"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MiniShopItem } from "@/lib/products";

import { ProductCard } from "./ProductCard";

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
