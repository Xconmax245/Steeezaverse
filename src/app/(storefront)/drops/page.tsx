import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { ProductGrid, EmptyState } from "@/components/ProductGrid";
import { getDropProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Drops — Steezaverse",
  description: "Time-gated Steezaverse drops. Limited runs. When it's gone, it's gone.",
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function DropsPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <DropsContent />
    </main>
  );
}

async function DropsContent() {
  let drops: Awaited<ReturnType<typeof getDropProducts>> = [];
  let failed = false;
  try {
    drops = await getDropProducts();
  } catch {
    failed = true;
  }

  const now = Date.now();
  const live = drops.filter(
    (d) =>
      (!d.drop_starts_at || new Date(d.drop_starts_at).getTime() <= now) &&
      (!d.drop_ends_at || new Date(d.drop_ends_at).getTime() >= now)
  );
  const upcoming = drops.filter((d) => d.drop_starts_at && new Date(d.drop_starts_at).getTime() > now);
  const past = drops.filter(
    (d) => d.drop_ends_at && new Date(d.drop_ends_at).getTime() < now && !live.includes(d) && !upcoming.includes(d)
  );

  return (
    <section className="relative w-full pt-40 pb-32">
      <div className="max-w-[95vw] mx-auto px-4 md:px-8">
        <header className="mb-16">
          <h1 className="font-chillax text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
            The <span className="text-sz-red">Drops</span>
          </h1>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
            Limited runs. When it&apos;s gone, it&apos;s gone.
          </p>
        </header>

        {failed ? (
          <EmptyState title="Couldn't load the drops" hint="Check back in a moment" />
        ) : drops.length === 0 ? (
          <EmptyState
            title="No drops scheduled"
            hint="Mark a published product as a drop in the admin panel to schedule it here"
          />
        ) : (
          <div className="flex flex-col gap-20">
            {live.length > 0 && (
              <DropGroup title="Live now" accent products={live} />
            )}
            {upcoming.length > 0 && (
              <DropGroup title="Upcoming" products={upcoming} />
            )}
            {past.length > 0 && (
              <DropGroup title="Archive" products={past} muted />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function DropGroup({
  title,
  products,
  accent = false,
  muted = false,
}: {
  title: string;
  products: Awaited<ReturnType<typeof getDropProducts>>;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h2
          className={`font-chillax text-xs uppercase tracking-[0.3em] ${
            accent ? "text-sz-red" : "text-white/50"
          }`}
        >
          {title}
        </h2>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] uppercase tracking-widest text-white/25">
          {products.length} drop{products.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className={muted ? "opacity-50" : ""}>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
