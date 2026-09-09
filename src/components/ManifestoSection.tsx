"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (isReducedMotion) {
        gsap.set([line1Ref.current, line2Ref.current, line3Ref.current, dividerRef.current], { opacity: 0 });
        gsap.to([line1Ref.current, line2Ref.current, line3Ref.current, dividerRef.current], {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        });
        return;
      }

      // Initial states for scrub animation to prevent flash
      gsap.set(line1Ref.current, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(dividerRef.current, { scaleX: 0 });
      gsap.set(line3Ref.current, { filter: "blur(12px)", opacity: 0 });
      
      const words = line2Ref.current?.querySelectorAll(".word");
      if (words) {
        gsap.set(words, { rotateY: 70, opacity: 0, transformOrigin: "left center" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.2,
        }
      });

      // Ultra-thin horizontal line that draws across viewport in sync with scroll
      tl.to(dividerRef.current, { scaleX: 1, duration: 1, ease: "none" }, 0);

      // Line 1: clip-path mask wipe
      tl.to(line1Ref.current, { clipPath: "inset(0 0% 0 0)", duration: 0.33, ease: "power2.inOut" }, 0);

      // Line 2: staggered 3D flip
      if (words) {
        tl.to(words, { rotateY: 0, opacity: 1, stagger: 0.05, duration: 0.33, ease: "power2.out" }, 0.33);
      }

      // Line 3: blur to focus
      tl.to(line3Ref.current, { filter: "blur(0px)", opacity: 1, duration: 0.34, ease: "power2.out" }, 0.66);

      // Hold briefly before exiting (we removed the scale/fade out so it doesn't leave an empty black space before MiniShop)
      tl.to({}, { duration: 0.2 });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const textStyle = {
    fontFamily: "'Bespoke Sans', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(32px, 6vw, 72px)",
    letterSpacing: "0.02em",
    lineHeight: 1.3,
    color: "rgba(255,255,255,0.92)",
    textTransform: "uppercase" as const,
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Viewport-wide thin horizontal line motif */}
      <div 
        ref={dividerRef} 
        className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20 origin-left -translate-y-1/2 z-0"
      />

      <div ref={contentWrapperRef} className="relative z-10 max-w-[90vw] mx-auto text-center flex flex-col items-center gap-8 md:gap-12 py-10" style={{ perspective: "1000px" }}>
        
        {/* TODO: Replace placeholder copy below when real copy is supplied */}
        
        {/* Line 1 */}
        <div ref={line1Ref} style={textStyle}>
          BUILDING THE <span className="font-zodiak italic lowercase text-[var(--red)]" style={{ fontSize: "1.15em", fontWeight: 400, letterSpacing: "0", textTransform: "none" }}>foundation</span>
        </div>

        {/* Line 2 */}
        <div ref={line2Ref} style={textStyle} className="flex gap-[0.3em] flex-wrap justify-center items-center">
          {"FOR A NEW ERA OF".split(" ").map((word, i) => (
            <span key={i} className="word inline-block">{word}</span>
          ))}
          <span className="word inline-block font-zodiak italic lowercase text-[var(--blue)]" style={{ fontSize: "1.15em", fontWeight: 400, letterSpacing: "0", textTransform: "none" }}>creation</span>
        </div>

        {/* Line 3 */}
        <div ref={line3Ref} style={textStyle}>
          WELCOME TO THE <span className="font-zodiak italic lowercase text-[var(--red)]" style={{ fontSize: "1.15em", fontWeight: 400, letterSpacing: "0", textTransform: "none" }}>manifesto</span>
        </div>

      </div>
    </section>
  );
}
