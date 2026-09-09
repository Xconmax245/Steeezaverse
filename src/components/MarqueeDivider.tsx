import React from "react";

export default function MarqueeDivider() {
  const wordsRow1 = [
    { text: "Island Adventure", num: "01" },
    { text: "Boho Chic", num: "02" },
    { text: "Urban Utility", num: "03" },
    { text: "Neo Tokyo", num: "04" },
    { text: "Core Aesthetics", num: "05" },
  ];

  const wordsRow2 = [
    { text: "Neon Lights", num: "06" },
    { text: "Knight Riders", num: "07" },
    { text: "Heavy Metal", num: "08" },
    { text: "Acid Wash", num: "09" },
    { text: "Stealth Tech", num: "10" },
  ];

  // Helper to render a continuous track of items
  const renderTrack = (words: typeof wordsRow1) => {
    // Duplicate the words array a few times to ensure seamless scrolling
    const repeated = [...words, ...words, ...words, ...words];
    return repeated.map((item, index) => (
      <div key={index} className="flex items-center gap-8 md:gap-16 mx-4 md:mx-8">
        <span className="text-[var(--red)] font-light text-[clamp(40px,6vw,90px)] leading-none">/</span>
        <div className="relative flex items-start">
          <span className="font-zodiak text-[clamp(40px,6vw,90px)] tracking-wide text-white leading-none">
            {item.text}
          </span>
          <span className="text-[var(--red)] text-[10px] md:text-[14px] font-bold tracking-widest absolute -top-2 md:-top-4 -right-6 md:-right-8">
            {item.num}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full relative z-10 bg-black py-20 md:py-32 overflow-hidden border-y border-white/10">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-track-left {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: marquee-scroll-left 50s linear infinite;
          will-change: transform;
        }
        .marquee-track-right {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: marquee-scroll-right 50s linear infinite;
          will-change: transform;
        }
        .marquee-container:hover .marquee-track-left,
        .marquee-container:hover .marquee-track-right {
          animation-play-state: paused;
        }
        .font-zodiak {
          font-family: 'Zodiak', serif;
        }
      `}} />

      <div className="marquee-container flex flex-col gap-12 md:gap-20">
        {/* Row 1: Scrolls Left */}
        <div className="w-full overflow-hidden">
          <div className="marquee-track-left" aria-hidden="true">
            {renderTrack(wordsRow1)}
          </div>
        </div>

        {/* Row 2: Scrolls Right */}
        <div className="w-full overflow-hidden">
          <div className="marquee-track-right" aria-hidden="true">
            {renderTrack(wordsRow2)}
          </div>
        </div>
      </div>
    </div>
  );
}
