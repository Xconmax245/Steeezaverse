import React from "react";

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
      <div key={index} className="flex items-center gap-8 md:gap-16 mx-4 md:mx-8">
        <span className="font-chillax font-medium text-[clamp(16px,2vw,24px)] tracking-[0.15em] text-white/40 uppercase">
          {text}
        </span>
        <span className="text-white/10 text-[clamp(16px,2vw,24px)] leading-none">/</span>
      </div>
    ));
  };

  return (
    <section className="w-full relative z-10 bg-[#0a0a0a] py-16 md:py-24 overflow-hidden border-y border-white/5">
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
    </section>
  );
}
