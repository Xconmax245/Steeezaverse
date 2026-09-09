import Image from "next/image";
import Link from "next/link";
import { getPublishedLookbook, type LookbookItem } from "@/lib/lookbook";

// Editorial lookbook grid — content managed entirely from the admin Lookbook
// page (upload, caption, product link, ordering, publish toggle). Admin
// mutations purge the LOOKBOOK_TAG cache so this updates immediately.

// Size pattern by position in a 3-column grid — creates an editorial rhythm
// rather than uniform tiles: tall, wide, tall, wide ...
function spanFor(index: number): string {
  const cycle = index % 4;
  if (cycle === 1) return "md:col-span-2";
  return "";
}

export default async function LookbookSection() {
  let items: LookbookItem[] = [];
  try {
    items = await getPublishedLookbook();
  } catch {
    // Never break the homepage over a lookbook fetch failure.
    items = [];
  }

  if (items.length === 0) return null;

  return (
    <section className="relative w-full bg-black py-24 overflow-hidden z-20">
      <div className="max-w-[95vw] mx-auto px-4 md:px-8">
        {/* Section heading — mirrors MiniShopSection */}
        <div className="flex items-end justify-between mb-12">
          <h2 className="font-chillax text-xs md:text-sm uppercase tracking-[0.3em] text-white/50">
            Lookbook
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            FW26 — Shot in Lagos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, index) => (
            <LookbookTile key={item.id} item={item} span={spanFor(index)} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LookbookTile({ item, span, index }: { item: LookbookItem; span: string; index: number }) {
  const aspect = span.includes("col-span-2") ? "aspect-[2/1]" : "aspect-[3/4]";

  const tile = (
    <div
      className={`group relative ${span} ${aspect} w-full bg-[#111] rounded-lg overflow-hidden`}
      style={{ perspective: "1000px" }}
      data-cuelume-hover="tick"
    >
      {item.image_url && (
        <Image
          src={item.image_url}
          alt={item.caption ?? `Lookbook image ${index + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          draggable={false}
        />
      )}

      {/* Subtle top gradient for legibility of overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {item.caption && (
        <p className="absolute bottom-4 left-4 right-4 font-sans text-xs uppercase tracking-[0.2em] text-white/85 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          {item.caption}
        </p>
      )}
    </div>
  );

  // Admin-linked product: whole tile routes to the product page.
  if (item.linked_product?.slug) {
    return (
      <Link
        href={`/shop/${item.linked_product.slug}`}
        className="block"
        aria-label={item.linked_product.name}
      >
        {tile}
      </Link>
    );
  }

  return tile;
}
