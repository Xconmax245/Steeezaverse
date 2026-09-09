"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SocialProofStrip() {
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
    <motion.section 
      className="w-full relative z-10 bg-[#0a0a0a] py-10 md:py-12 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
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
    </motion.section>
  );
}
