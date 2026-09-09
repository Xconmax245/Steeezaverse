import React from "react";

export default function MarqueeDivider() {
  const wordsRow1 = [
    { text: "HEAVYWEIGHT COTTON", num: "01" },
    { text: "OVERSIZED SILHOUETTES", num: "02" },
    { text: "LIMITED RUN", num: "03" },
    { text: "NO RESTOCKS", num: "04" },
    { text: "ARCHIVE PIECES", num: "05" },
  ];

  const wordsRow2 = [
    { text: "DROP 001", num: "06" },
    { text: "DISTRESSED WASH", num: "07" },
    { text: "HIDDEN DETAILS", num: "08" },
    { text: "UTILITY WEAR", num: "09" },
    { text: "STEEZAVERSE EXCLUSIVE", num: "10" },
  ];

  // Helper to render a continuous track of items
  const renderTrack = (words: typeof wordsRow1) => {
    // Duplicate the words array a few times to ensure seamless scrolling
    const repeated = [...words, ...words, ...words, ...words];
    return repeated.map((item, index) => (
      <div key={index} className="flex items-center gap-8 md:gap-16 mx-4 md:mx-8">
        <span className="text-[var(--red)] font-black italic text-[clamp(40px,6vw,90px)] leading-none">/</span>
        <div className="relative flex items-start">
          <span className="font-chillax italic font-black text-[clamp(40px,6vw,90px)] tracking-wide text-white leading-none">
            {item.text}
          </span>
          <span className="text-[var(--blue)] text-[12px] md:text-[16px] font-bold tracking-widest absolute -top-4 md:-top-6 -right-6 md:-right-8">
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
