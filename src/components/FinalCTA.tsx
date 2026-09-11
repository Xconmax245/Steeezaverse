"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Magnetic pull strength (closer to 1 = stronger pull)
    setPosition({ x: distanceX * 0.2, y: distanceY * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <section className="bg-black py-32 md:py-48 flex flex-col items-center justify-center">
      <h2 
        className="text-white text-center mb-12 tracking-tight"
        style={{ 
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 600,
          fontSize: "clamp(28px, 4vw, 56px)" 
        }}
      >
        READY TO TAKE REEKS?
      </h2>
      
      <Link 
        href="/drops" 
        passHref 
        legacyBehavior
      >
        <motion.a
          ref={buttonRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
          className="inline-block bg-sz-red text-white px-12 py-5 rounded text-sm md:text-base font-bold tracking-widest uppercase transition-colors hover:bg-sz-red-dim"
          data-cursor="pointer"
          data-cuelume-press
          data-cuelume-release
        >
          SHOP THE DROP →
        </motion.a>
      </Link>
    </section>
  );
}
