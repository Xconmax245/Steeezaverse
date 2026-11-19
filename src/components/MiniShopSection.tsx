import { getAllProducts, type MiniShopItem } from "@/lib/products";
import MiniShopCarousel from "./MiniShopCarousel";
import Link from "next/link";

export default async function MiniShopSection() {
  let products: MiniShopItem[] = [];
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error("Failed to load products for homepage shop section:", err);
    products = [];
  }

  return (
    <section className="relative w-full bg-black py-16 md:py-24 z-20">
      <div className="max-w-[95vw] mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12 border-b border-white/[0.08] pb-6">
          <div>
            <span className="text-[10px] md:text-xs font-archivo font-bold uppercase tracking-[0.3em] text-sz-red block mb-2">
              Full Lineup
            </span>
            <h2 className="font-chillax font-extrabold uppercase tracking-tight text-white text-3xl md:text-4xl lg:text-5xl leading-none">
              Shop
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-archivo uppercase tracking-widest text-white/40 hidden sm:inline-block">
              {products.length} {products.length === 1 ? "Piece" : "Pieces"} Available
            </span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-archivo font-semibold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02]"
            >
              <span>Explore Shop</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 2-col grid on mobile, 3-col md, 4-col lg — natural vertical scroll, no lag */}
        <MiniShopCarousel products={products} />
      </div>
    </section>
  );
}
