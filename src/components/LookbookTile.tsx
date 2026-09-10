"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LookbookItem } from "@/lib/lookbook";

function formatNGN(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function LookbookTile({
  item,
  index,
  variant,
  spanClass,
  aspectClass,
}: {
  item: LookbookItem;
  index: number;
  variant: "full" | "inset";
  spanClass: string;
  aspectClass: string;
}) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const secondImage = item.linked_product?.images?.[1]?.url || item.linked_product?.images?.[0]?.url;
  // Mask reveal only applies to "full" bleed tiles that have a secondary image
  const hasMask = variant === "full" && secondImage;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hasMask || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const tileInner = (
    <div
      ref={containerRef}
      className={`group relative w-full bg-[#0a0a0a] overflow-hidden ${aspectClass} ${variant === "inset" ? "p-4 md:p-6 flex flex-col" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cuelume-hover={hasMask ? "pulse" : "tick"}
      style={{ borderRadius: "0px", cursor: hasMask ? "none" : "auto", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
    >
      {variant === "inset" ? (
        // --- INSET VARIANT (Text Top, Image Floating Inside) ---
        <>
          <div className="flex flex-col gap-1 mb-4 z-20">
            {item.caption && (
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white/50">
                {item.caption.split(' ')[0]} {/* "Heritage" style subtitle */}
              </span>
            )}
            {item.linked_product ? (
              <h3 className="font-chillax text-xl md:text-2xl font-bold text-white tracking-tight">
                {item.linked_product.name}
              </h3>
            ) : (
              <h3 className="font-chillax text-xl md:text-2xl font-bold text-white tracking-tight">
                {item.caption}
              </h3>
            )}
            {item.linked_product && (
              <p className="text-xs text-white/40 mt-1">
                {formatNGN(item.linked_product.base_price)}
              </p>
            )}
          </div>
          <div className="relative flex-grow w-full rounded-[16px] overflow-hidden bg-[#111]">
            {item.image_url && (
              <Image
                src={item.image_url}
                alt={item.caption ?? `Lookbook image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                draggable={false}
              />
            )}
            {/* Play/Arrow icon inside inset */}
            {item.linked_product && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
                <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        // --- FULL BLEED VARIANT (Image Fills Card, Text Bottom) ---
        <>
          {/* Primary Image */}
          {item.image_url && (
            <Image
              src={item.image_url}
              alt={item.caption ?? `Lookbook image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-700 ease-out ${!hasMask && "group-hover:scale-[1.04]"}`}
              draggable={false}
            />
          )}

          {/* Mask Reveal Image */}
          {hasMask && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              animate={{
                clipPath: isHovered
                  ? `circle(25% at ${mousePos.x}% ${mousePos.y}%)`
                  : `circle(0% at ${mousePos.x}% ${mousePos.y}%)`,
              }}
              transition={{ type: "spring", stiffness: 150, damping: 25 }}
            >
              <Image
                src={secondImage!}
                alt="Detail view"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
            </motion.div>
          )}

          {/* Stronger bottom gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

          {/* Full Bleed Text Overlay (Bottom Left) & Arrow Button (Bottom Right) */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-30 pointer-events-none">
            <div className="flex flex-col gap-1 drop-shadow-md max-w-[75%] translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              {item.linked_product ? (
                <>
                  <h3 className="font-chillax text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
                    {item.linked_product.name}
                  </h3>
                  {item.caption && (
                    <p className="font-sans text-[10px] uppercase tracking-[0.1em] text-white/70 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                  <p className="font-sans text-sm font-semibold text-white/90 mt-1">
                    {formatNGN(item.linked_product.base_price)}
                  </p>
                </>
              ) : (
                item.caption && (
                  <h3 className="font-chillax text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
                    {item.caption}
                  </h3>
                )
              )}
            </div>

            {/* Circular Arrow Button (Like Reference) */}
            {item.linked_product && (
              <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`${spanClass} w-full`}
      data-aos="fade-up"
      data-aos-delay={(index % 4) * 100}
      data-aos-duration="900"
    >
      {item.linked_product?.slug ? (
        <Link href={`/product/${item.linked_product.slug}`} className="block w-full">
          {tileInner}
        </Link>
      ) : (
        tileInner
      )}
    </div>
  );
}
