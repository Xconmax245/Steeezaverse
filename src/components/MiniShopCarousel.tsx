"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MiniShopItem } from "@/lib/products";

export default function MiniShopCarousel({ products }: { products: MiniShopItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide py-10"
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragTransition={{ power: 0.3, timeConstant: 200 }}
        className="flex gap-6 md:gap-10 w-max pr-[5vw]"
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function ProductCard({ product }: { product: MiniShopItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isNew = Date.now() - new Date(product.updated_at).getTime() < 1000 * 60 * 60 * 24 * 7; // 7 days

  return (
    <motion.a
      href={`/shop/${product.slug}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-shrink-0 w-[280px] md:w-[350px] snap-start rounded-lg flex flex-col gap-4 touch-pan-y"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } }
      }}
      data-cuelume-hover="tick"
      draggable={false}
    >
      <div 
        className="w-full h-[350px] md:h-[450px] bg-[#111] rounded-lg overflow-hidden relative"
        style={{ transform: "translateZ(30px)" }} // Pop the image out slightly
      >
        {isNew && (
          <div className="absolute top-4 left-4 z-20 bg-sz-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            New
          </div>
        )}
        
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 ${product.hover_image ? 'group-hover:opacity-0' : ''}`}
            draggable={false}
          />
        )}
        {product.hover_image && (
          <Image
            src={product.hover_image}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            draggable={false}
          />
        )}
      </div>

      <div className="flex flex-col gap-1 px-1" style={{ transform: "translateZ(20px)" }}>
        <h3 className="font-sans text-base text-white tracking-wide truncate">{product.name}</h3>
        <p className="font-sans text-sm text-sz-red font-semibold">
          ${product.base_price.toFixed(2)}
        </p>
        
        <div 
          className="mt-3 text-sz-red text-xs font-bold uppercase tracking-widest flex items-center gap-2 group/btn cursor-pointer"
          data-cuelume-press
          data-cuelume-release
        >
          <span>Show more</span>
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </div>
      </div>
    </motion.a>
  );
}
