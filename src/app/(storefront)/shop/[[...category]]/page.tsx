import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ShopBrowser from "@/components/ShopBrowser";
import { EmptyState } from "@/components/ProductGrid";
import { getAllProducts, getFilteredProducts, getShopFacets } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — Steezaverse",
  description: "The full Steezaverse catalog. Drops, limited-run streetwear, and nothing else.",
};

interface Props {
  params: { category?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const categorySlug = params.category?.[0];
  const hasFilters = Object.keys(searchParams).length > 0;
  
  let products: any[] = [];
  let failed = false;

  try {
    if (!hasFilters && !categorySlug) {
      products = await getAllProducts();
    } else {
      const sizes = searchParams.size ? (Array.isArray(searchParams.size) ? searchParams.size : [searchParams.size]) : undefined;
      const colors = searchParams.color ? (Array.isArray(searchParams.color) ? searchParams.color : [searchParams.color]) : undefined;
      const sort = (searchParams.sort as any) || "featured";
      products = await getFilteredProducts({ categorySlug, sizes, colors, sort });
    }
  } catch (err) {
    console.error(err);
    failed = true;
  }

  let facets = { sizes: [] as string[], colors: [] as string[] };
  try {
    facets = await getShopFacets();
  } catch (err) {}

  const categoryLabel = categorySlug
    ? categorySlug.replace(/-/g, " ").toUpperCase()
    : "ALL";

  return (
    <main className="relative min-h-screen bg-black">
      <Navbar />

      {/* ── Shop Header ── */}
      <section className="relative w-full pt-28 md:pt-32 pb-10 md:pb-14 overflow-hidden">

        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          }}
        />

        {/* Red glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-sz-red/8 blur-[120px] z-0"
        />

        <div className="relative z-10 max-w-[95vw] mx-auto px-4 md:px-8">

          {/* Eyebrow */}
          <p className="font-archivo font-semibold text-white/35 text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-4">
            Steezaverse Collection
          </p>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1 className="font-chillax font-extrabold uppercase tracking-tight leading-[0.9] text-5xl md:text-7xl lg:text-8xl">
              {categorySlug ? (
                <>
                  <span className="text-white/30">The </span>
                  <span className="text-white">{categoryLabel}</span>
                </>
              ) : (
                <>
                  <span className="text-white">The </span>
                  <span className="text-sz-red">Shop</span>
                </>
              )}
            </h1>

            {/* Item count pill */}
            {!failed && (
              <div className="flex-shrink-0 flex items-center gap-1.5 self-start sm:self-auto sm:mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sz-red" />
                <span className="font-archivo text-[11px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mt-8 h-px bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
        </div>
      </section>

      {/* ── Catalog ── */}
      <section className="relative z-10 w-full pb-32">
        <div className="max-w-[95vw] mx-auto px-4 md:px-8">
          {failed ? (
            <EmptyState title="Couldn't load the catalog" hint="Check back in a moment" />
          ) : (
            <ShopBrowser initialProducts={products} facets={facets} />
          )}
        </div>
      </section>
    </main>
  );
}
