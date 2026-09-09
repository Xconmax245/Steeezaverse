"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SilenceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReducedMotion) {
      gsap.set(dividerRef.current, { scaleX: 1 });
      return;
    }

    gsap.set(dividerRef.current, { scaleX: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      });

      // Ultra-thin horizontal line that draws across viewport in sync with scroll
      tl.to(dividerRef.current, { scaleX: 1, duration: 1, ease: "none" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-[25vh] min-h-[200px] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Viewport-wide thin horizontal line motif */}
      <div 
        ref={dividerRef} 
        className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 origin-left -translate-y-1/2 z-0"
      />
    </section>
  );
}
