"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MiniShopItem } from "@/lib/products";

import { ProductCard } from "./ProductCard";
import { EmptyState } from "./ProductGrid";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Latest" },
  { key: "price-asc", label: "₦ Low → High" },
  { key: "price-desc", label: "₦ High → Low" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * ShopBrowser — the client-side heart of the revamped /shop.
 * Search + category chips + sort, all with layout animations so cards
 * re-flow smoothly instead of snapping. Products arrive pre-validated
 * from the server (see ShopPage).
 */
export default function ShopBrowser({ products }: { products: MiniShopItem[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  // ── Derive category chips from actual product data ──
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.is_drop ? "drops" : "essentials";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [
      { key: "all", label: "Everything", count: products.length },
      ...Array.from(counts.entries()).map(([key, count]) => ({
        key,
        label: key === "drops" ? "Drops" : "Essentials",
        count,
      })),
    ];
  }, [products]);

  // ── Filter + sort pipeline ──
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;

    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (activeTag === "drops") list = list.filter((p) => p.is_drop);
    if (activeTag === "essentials") list = list.filter((p) => !p.is_drop);

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.base_price - b.base_price);
      case "price-desc":
        return [...list].sort((a, b) => b.base_price - a.base_price);
      case "newest":
        return [...list].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      default:
        return list;
    }
  }, [products, query, activeTag, sort]);

  const filtering = query.trim() !== "" || activeTag !== "all" || sort !== "featured";

  return (
    <div>
      {/* ── Control bar — search, chips, sort ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="sticky top-0 md:top-[88px] z-30 mb-12 bg-black/90 backdrop-blur-xl border-b border-white/[0.05] py-4"
        data-cuelume-hover="tick"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <label className="group flex flex-1 items-center gap-3 transition-colors lg:max-w-xs bg-white/[0.02] border border-white/5 rounded-full px-4 py-2.5 focus-within:border-white/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/30 group-focus-within:text-white/60">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the rack…"
              className="w-full bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </label>

          {/* Category chips & Sort */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              {tags.map((tag) => {
                const active = activeTag === tag.key;
                return (
                  <button
                    key={tag.key}
                    onClick={() => setActiveTag(tag.key)}
                    data-cuelume-hover="tick"
                    className={`relative rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors duration-300 ${
                      active
                        ? "text-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="shop-chip-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">
                      {tag.label}
                      <sup className="ml-1 opacity-50">{tag.count}</sup>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden h-4 w-px bg-white/10 lg:block" />

            <div className="flex items-center gap-1">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  data-cuelume-hover="tick"
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors duration-300 ${
                    sort === s.key
                      ? "text-sz-red font-bold"
                      : "text-white/30 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {filtering && (
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTag("all");
                  setSort("featured");
                }}
                className="ml-auto text-[10px] font-bold uppercase tracking-widest text-sz-red underline-offset-4 hover:underline lg:ml-4"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Grid — layout-animated reflow ── */}
      {visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <EmptyState
            title="Nothing matches that"
            hint="Try a different search or reset the filters"
          />
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:gap-x-10 md:gap-y-16 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.22 } }}
                transition={{ duration: 0.55, ease, delay: Math.min(i * 0.04, 0.3) }}
              >
                <ProductCard product={product} enableEntrance={false} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
