"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MiniShopItem } from "@/lib/products";

import { ProductCard } from "./ProductCard";

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
        className="flex gap-6 md:gap-10 w-max pr-[5vw] pl-[5vw]"
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            className="w-[280px] md:w-[350px] snap-start" 
            enable3D={true} 
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
