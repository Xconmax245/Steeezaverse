"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { MiniShopItem } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./ProductGrid";
import { loadMoreProducts } from "@/app/(storefront)/shop/actions";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Latest" },
  { key: "price-asc", label: "₦ Low → High" },
  { key: "price-desc", label: "₦ High → Low" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ShopBrowser({ 
  initialProducts, 
  facets 
}: { 
  initialProducts: MiniShopItem[], 
  facets: { sizes: string[], colors: string[] } 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<MiniShopItem[]>(initialProducts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length === 12);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync state with server products when URL changes
  useEffect(() => {
    setProducts(initialProducts);
    setHasMore(initialProducts.length === 12);
  }, [initialProducts]);

  const updateFilters = useCallback((updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  const toggleFilter = (key: string, value: string) => {
    const current = searchParams.getAll(key);
    if (current.includes(value)) {
      updateFilters({ [key]: current.filter(v => v !== value) });
    } else {
      updateFilters({ [key]: [...current, value] });
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || products.length === 0) return;
    setLoadingMore(true);

    const sort = (searchParams.get("sort") as SortKey) || "featured";
    const sizes = searchParams.getAll("size");
    const colors = searchParams.getAll("color");
    const pathParts = pathname.split('/').filter(Boolean);
    const categorySlug = pathParts.length > 1 && pathParts[pathParts.length - 2] === 'c' ? pathParts[pathParts.length - 1] : (pathParts[pathParts.length - 1] !== 'shop' ? pathParts[pathParts.length - 1] : undefined);

    const lastProduct = products[products.length - 1];
    let cursorValue: string | number | undefined = undefined;
    
    if (sort === "price-asc" || sort === "price-desc") cursorValue = lastProduct.base_price;
    else cursorValue = lastProduct.updated_at;

    const { products: moreProducts, error } = await loadMoreProducts({
      categorySlug,
      sizes,
      colors,
      sort,
      cursorId: lastProduct.id,
      cursorValue,
      limit: 12
    });

    if (!error && moreProducts) {
      setProducts(prev => [...prev, ...moreProducts]);
      setHasMore(moreProducts.length === 12);
    }
    setLoadingMore(false);
  };

  const activeSizes = searchParams.getAll("size");
  const activeColors = searchParams.getAll("color");
  const currentSort = searchParams.get("sort") || "featured";
  const isFiltering = activeSizes.length > 0 || activeColors.length > 0 || currentSort !== "featured";

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
      {/* ── Mobile Filter Toggle ── */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="lg:hidden w-full flex items-center justify-between border border-white/10 rounded-full px-6 py-3.5 bg-white/[0.02] text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filters
        </span>
        {isFiltering && (
          <span className="bg-sz-red text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
            {activeSizes.length + activeColors.length}
          </span>
        )}
      </button>

      {/* ── Filter Sidebar (Desktop) / Drawer (Mobile) ── */}
      <div className={`
        fixed inset-0 z-50 lg:static lg:z-0 lg:w-64 lg:shrink-0
        ${isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none lg:pointer-events-auto'}
      `}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        />
        
        {/* Drawer content */}
        <div className={`
          absolute inset-y-0 right-0 w-[85vw] max-w-sm bg-[#0a0a0a] border-l border-white/10 p-6 lg:p-0 lg:static lg:w-full lg:bg-transparent lg:border-none
          transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto lg:overflow-visible
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-8">
            <h2 className="font-chillax text-xl font-medium uppercase tracking-widest">Filters</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-10 lg:sticky lg:top-32">
            {/* Sort */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Sort By</h3>
              <div className="flex flex-col gap-2">
                {SORTS.map((s) => (
                  <label key={s.key} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="sort" 
                      className="peer hidden" 
                      checked={currentSort === s.key}
                      onChange={() => updateFilters({ sort: s.key })}
                    />
                    <div className="w-4 h-4 rounded-full border border-white/20 peer-checked:border-sz-red peer-checked:bg-sz-red flex items-center justify-center transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-[13px] uppercase tracking-wider text-white/60 group-hover:text-white peer-checked:text-white transition-colors">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {facets.sizes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {facets.sizes.map((size) => {
                    const active = activeSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleFilter("size", size)}
                        className={`w-12 h-12 rounded-full text-xs font-medium uppercase tracking-wider border transition-all duration-300 flex items-center justify-center
                          ${active ? "bg-white border-white text-black" : "bg-transparent border-white/10 text-white/60 hover:border-white/30 hover:text-white"}
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {facets.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Color</h3>
                <div className="flex flex-col gap-2">
                  {facets.colors.map((color) => {
                    const active = activeColors.includes(color);
                    return (
                      <label key={color} className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: color.toLowerCase() }}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFilter("color", color);
                          }}
                        >
                          {active && <div className="w-2 h-2 rounded-full bg-white mix-blend-difference" />}
                        </div>
                        <span 
                          onClick={() => toggleFilter("color", color)}
                          className={`text-[13px] uppercase tracking-wider transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}
                        >
                          {color}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {isFiltering && (
              <button
                onClick={() => {
                  router.push(pathname, { scroll: false });
                  setIsDrawerOpen(false);
                }}
                className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-sz-red py-4 hover:bg-sz-red/10 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
            
            <div className="h-20 lg:hidden" />
          </div>

          {/* Apply button for mobile */}
          <div className="lg:hidden absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="w-full bg-white text-black rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className={`flex-1 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <EmptyState
              title="Nothing matches that"
              hint="Try a different filter or clear them all"
            />
          </motion.div>
        ) : (
          <div className="flex flex-col gap-16 items-center">
            <motion.div layout className="grid w-full grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 26, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.22 } }}
                    transition={{ duration: 0.55, ease }}
                  >
                    <ProductCard product={product} enableEntrance={false} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full border border-white/10 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
