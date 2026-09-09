import { getPublishedLookbook, type LookbookItem } from "@/lib/lookbook";
import LookbookTile from "./LookbookTile";

// The mosaic layout pattern repeats every 5 items.
// We map indices to size profiles which dictact their span and aspect ratio.
const PATTERN: { size: "large" | "medium" | "small"; spanClass: string; aspectClass: string }[] = [
  { size: "large", spanClass: "col-span-2 md:col-span-3 row-span-2", aspectClass: "aspect-[4/5] md:aspect-[3/4]" },
  { size: "small", spanClass: "col-span-1 md:col-span-1 row-span-1", aspectClass: "aspect-[3/4] md:aspect-square" },
  { size: "medium", spanClass: "col-span-1 md:col-span-2 row-span-1", aspectClass: "aspect-[3/4] md:aspect-[4/3]" },
  { size: "medium", spanClass: "col-span-1 md:col-span-2 row-span-1", aspectClass: "aspect-[3/4] md:aspect-[4/3]" },
  { size: "small", spanClass: "col-span-1 md:col-span-1 row-span-1", aspectClass: "aspect-[3/4] md:aspect-square" }
];

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
        {/* Section heading */}
        <div className="flex items-end justify-between mb-12" data-aos="fade-up" data-aos-duration="800">
          <h2 className="font-chillax text-xs md:text-sm uppercase tracking-[0.3em] text-white/50">
            Lookbook
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            FW26 — Shot in Lagos
          </p>
        </div>

        {/* 6-Column Scattered Mosaic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 auto-rows-min gap-4 md:gap-6">
          {items.map((item, index) => {
            const config = PATTERN[index % PATTERN.length];
            return (
              <LookbookTile 
                key={item.id} 
                item={item} 
                index={index} 
                size={config.size} 
                spanClass={config.spanClass} 
                aspectClass={config.aspectClass} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
