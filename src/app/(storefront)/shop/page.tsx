import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ShopBrowser from "@/components/ShopBrowser";
import { EmptyState } from "@/components/ProductGrid";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop — Steezaverse",
  description: "The full Steezaverse catalog. Drops, limited-run streetwear, and nothing else.",
};

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  let failed = false;
  try {
    products = await getAllProducts();
  } catch {
    failed = true;
  }

  // ── Header stats ──
  const dropCount = products.filter((p) => p.is_drop).length;
  const cheapest = products.length
    ? Math.min(...products.map((p) => p.base_price))
    : 0;
  const newestAt = products.reduce<number>((max, p) => {
    const t = new Date(p.updated_at).getTime();
    return Number.isNaN(t) ? max : Math.max(max, t);
  }, 0);
  const newestLabel = newestAt
    ? new Date(newestAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
    : "—";

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <Navbar />

      {/* ── Blueprint texture + top glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[70vh]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,245,245,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,245,0.028) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 z-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-sz-red/10 blur-[140px]"
      />

      <section className="relative z-10 w-full pt-32 pb-32">
        <div className="max-w-[95vw] mx-auto px-4 md:px-8">
          {/* ── Minimalist Header ── */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.05] pb-8">
            <div>
              <h1
                className="font-chillax font-medium tracking-wide text-white text-4xl md:text-5xl"
                style={{ animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both" }}
              >
                THE <span className="text-sz-red italic">SHOP</span>
              </h1>
              <p 
                className="mt-3 text-xs uppercase tracking-[0.2em] text-white/40 font-medium"
                style={{ animation: "fadeIn 0.7s 0.2s ease both" }}
              >
                {failed
                  ? "Catalog unavailable"
                  : "Everything published. Nothing hidden."}
              </p>
            </div>
            
            {!failed && (
              <div 
                className="flex items-center gap-6"
                style={{ animation: "fadeIn 0.7s 0.3s ease both" }}
              >
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Total Pieces</span>
                  <span className="font-sans text-sm text-white/80">{products.length}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Active Drops</span>
                  <span className="font-sans text-sm text-sz-red">{dropCount}</span>
                </div>
              </div>
            )}
          </header>

          {failed ? (
            <EmptyState title="Couldn't load the catalog" hint="Check back in a moment" />
          ) : products.length === 0 ? (
            <EmptyState
              title="Nothing on the racks yet"
              hint="Products published in the admin panel land here instantly"
            />
          ) : (
            <ShopBrowser products={products} />
          )}
        </div>
      </section>
    </main>
  );
}
