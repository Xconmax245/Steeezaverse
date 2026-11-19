"use client";

import { MiniShopItem } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export default function MiniShopCarousel({ products }: { products: MiniShopItem[] }) {
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          enableEntrance={false}
        />
      ))}
    </div>
  );
}
