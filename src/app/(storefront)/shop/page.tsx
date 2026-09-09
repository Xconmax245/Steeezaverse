import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ProductGrid, EmptyState } from "@/components/ProductGrid";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — Steezaverse",
  description: "The full Steezaverse catalog. Drops, limited-run streetwear, and nothing else.",
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <ShopContent />
    </main>
  );
}

async function ShopContent() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  let failed = false;
  try {
    products = await getAllProducts();
  } catch {
    failed = true;
  }

  return (
    <section className="relative w-full pt-40 pb-32">
      <div className="max-w-[95vw] mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="font-chillax text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
            The <span className="text-sz-red">Shop</span>
          </h1>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
            {failed
              ? "Catalog temporarily unavailable — refresh shortly"
              : `${products.length} piece${products.length === 1 ? "" : "s"} — everything published, nothing hidden`}
          </p>
        </header>

        {failed ? (
          <EmptyState title="Couldn't load the catalog" hint="Check back in a moment" />
        ) : products.length === 0 ? (
          <EmptyState
            title="Nothing on the racks yet"
            hint="Products published in the admin panel land here instantly"
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
}
