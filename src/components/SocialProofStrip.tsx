"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SocialProofStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Fade in/up as it enters, fade out/up as it leaves
      tl.fromTo(contentRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" })
        .to(contentRef.current, { opacity: 0, y: -40, duration: 0.3, ease: "power1.in" }, 0.7);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const pressMentions = [
    "HYPEBEAST — THE NEW UNIFORM",
    "COMPLEX — A HEAVYWEIGHT STAPLE",
    "GQ — REDEFINING ESSENTIALS",
    "HIGH SNOBIETY — THE NEXT ERA OF STREETWEAR",
    "VOGUE — BRUTALIST AND REFINED",
  ];

  const renderTrack = () => {
    // Duplicate for seamless loop
    const repeated = [...pressMentions, ...pressMentions, ...pressMentions, ...pressMentions];
    return repeated.map((text, index) => (
      <div key={index} className="flex items-center gap-10 md:gap-20 mx-5 md:mx-10">
        <span className="font-chillax font-semibold text-[clamp(12px,1.2vw,16px)] tracking-[0.25em] text-white/60 uppercase">
          {text}
        </span>
        <div className="w-1 h-1 bg-white/20 rounded-full" />
      </div>
    ));
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full relative z-10 bg-[#0a0a0a] py-10 md:py-12 overflow-hidden"
    >
      <div ref={contentRef}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes social-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .social-track-left {
          display: flex;
          align-items: center;
          white-space: nowrap;
          width: max-content;
          animation: social-scroll-left 80s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .social-track-left {
            animation-duration: 160s;
          }
        }
      `}} />

      <div className="w-full overflow-hidden">
        <div className="social-track-left" aria-hidden="true">
          {renderTrack()}
        </div>
      </div>
      </div>
    </section>
  );
}
