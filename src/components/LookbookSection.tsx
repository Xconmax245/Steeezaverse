import { getPublishedLookbook, type LookbookItem } from "@/lib/lookbook";
import LookbookTile from "./LookbookTile";
import Link from "next/link";

// 4-item repeating bento pattern mapped to a dense 3-column grid
const PATTERN: { variant: "full" | "inset"; spanClass: string; aspectClass: string }[] = [
  { variant: "full", spanClass: "col-span-2 md:col-span-1 md:row-span-2", aspectClass: "aspect-[4/3] md:aspect-[3/4]" },
  { variant: "full", spanClass: "col-span-1 md:col-span-1 md:row-span-1", aspectClass: "aspect-[3/4] md:aspect-square" },
  { variant: "full", spanClass: "col-span-1 md:col-span-1 md:row-span-2", aspectClass: "aspect-[3/4] md:aspect-[3/4]" },
  { variant: "full", spanClass: "col-span-2 md:col-span-1 md:row-span-1", aspectClass: "aspect-[2/1] md:aspect-square" }
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
        {/* Section heading (Pill Buttons) */}
        <div className="flex items-center gap-3 mb-12" data-aos="fade-up" data-aos-duration="800">
          <Link href="/shop" className="bg-white text-black hover:bg-white/90 transition-colors text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2">
            Shop now <span>→</span>
          </Link>
          <Link href="/shop" className="border border-white/20 text-white hover:bg-white/10 transition-colors text-xs font-semibold uppercase tracking-widest px-6 py-3 rounded-full">
            Catalogue
          </Link>
        </div>

        {/* Responsive Dense Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-row-dense auto-rows-min gap-2 md:gap-4">
          {items.map((item, index) => {
            const config = PATTERN[index % PATTERN.length];
            return (
              <LookbookTile 
                key={item.id} 
                item={item} 
                index={index} 
                variant={config.variant} 
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
