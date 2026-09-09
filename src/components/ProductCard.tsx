"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MiniShopItem } from "@/lib/products";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

interface ProductCardProps {
  product: MiniShopItem;
  className?: string;
  enable3D?: boolean;
}

export function ProductCard({ product, className = "", enable3D = false }: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const isNew = Date.now() - new Date(product.updated_at).getTime() < 1000 * 60 * 60 * 24 * 7;

  // Optional 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!enable3D || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (!enable3D) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      href={`/shop/${product.slug}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col gap-0 rounded-[24px] bg-white/[0.02] border border-white/[0.05] p-3 overflow-hidden touch-pan-y transition-colors duration-500 hover:bg-white/[0.04] hover:border-white/10 ${className}`}
      style={enable3D ? { rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" } : {}}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      data-cuelume-hover="tick"
      draggable={false}
    >
      {/* Glow effect behind the image on hover */}
      <div className="absolute inset-0 bg-sz-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />

      {/* Image Container */}
      <div 
        className="w-full aspect-[4/5] bg-black rounded-[16px] overflow-hidden relative z-10"
        style={enable3D ? { transform: "translateZ(30px)" } : {}}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {product.is_drop && (
            <div className="bg-sz-red/90 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              Drop
            </div>
          )}
          {!product.is_drop && isNew && (
            <div className="bg-white/90 backdrop-blur-md text-black text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              New
            </div>
          )}
        </div>

        {/* Primary Image */}
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] ${
              product.hover_image ? "group-hover:opacity-0" : ""
            }`}
            draggable={false}
          />
        )}
        
        {/* Hover Image */}
        {product.hover_image && (
          <Image
            src={product.hover_image}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-[1.05]"
            draggable={false}
          />
        )}

        {!product.image && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
            No image
          </div>
        )}
      </div>

      {/* Content Container */}
      <div 
        className="flex flex-col pt-4 pb-2 px-2 relative z-10"
        style={enable3D ? { transform: "translateZ(20px)" } : {}}
      >
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-sans text-[15px] font-medium text-white/90 tracking-wide line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-col items-end text-right shrink-0">
            <p className="font-sans text-[15px] text-sz-red font-semibold">
              {formatNGN(product.base_price)}
            </p>
            {product.compare_at_price != null && product.compare_at_price > product.base_price && (
              <p className="font-sans text-[11px] text-white/30 line-through mt-0.5">
                {formatNGN(product.compare_at_price)}
              </p>
            )}
          </div>
        </div>

        {/* View Details Button (Slides up on hover) */}
        <div className="mt-4 overflow-hidden h-0 group-hover:h-8 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 flex items-center">
          <div className="text-[10px] font-chillax font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-white flex items-center gap-2 transition-colors">
            View Details
            <span className="w-6 h-[1px] bg-white/30 group-hover:bg-sz-red group-hover:w-8 transition-all duration-500" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
