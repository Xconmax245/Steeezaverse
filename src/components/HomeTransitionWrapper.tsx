"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);
    if (isReduced) return;

    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const pinned = pinnedRef.current;
      const overlay = overlayRef.current;

      if (!container || !pinned || !overlay) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          scrub: true,
        },
      });

      tl.to(pinned, { scale: 0.94, ease: "none", duration: 1 }, 0);
      tl.to(overlay, { opacity: 0.6, ease: "none", duration: 1 }, 0);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [miniShop, lookbook] = React.Children.toArray(children);

  if (reducedMotion) {
    return (
      <div className="relative">
        {miniShop}
        {lookbook}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden" ref={pinnedRef}>
        <div className="w-full h-full flex flex-col justify-center">
          {miniShop}
        </div>
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black opacity-0 pointer-events-none z-50"
        />
      </div>
      <div className="relative z-40 bg-black shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        {lookbook}
      </div>
    </div>
  );
}
