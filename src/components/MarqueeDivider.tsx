import React from "react";

export default function MarqueeDivider() {
  return (
    <div className="w-full relative z-10" style={{ marginTop: "-1px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          white-space: nowrap;
          width: max-content;
          animation: marquee-scroll 20s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-strip {
          background: var(--black);
          padding: 24px 0;
          overflow: hidden;
          transform: rotate(-3deg);
          transform-origin: center;
        }
      `}} />

      {/* ── Wavy SVG Divider ── */}
      <div className="w-full overflow-hidden" style={{ height: "100px", background: "transparent" }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full block">
          <path d="M0,40 C360,100 720,0 1080,45 C1260,65 1350,55 1440,50 L1440,120 L0,120 Z" fill="var(--black)" />
        </svg>
      </div>

      {/* ── Continuous Marquee Strip ── */}
      <div className="w-full" style={{ background: "var(--black)", paddingBottom: "60px" }}>
        <div className="marquee-strip">
          <div className="marquee-track" aria-hidden="true">
            {/* First copy */}
            <span 
              className="font-archivo uppercase italic" 
              style={{ 
                fontWeight: 900, 
                fontSize: "clamp(48px, 8vw, 96px)", 
                color: "var(--red)", 
                paddingRight: "48px" 
              }}
            >
              BORN IN THE SHADOWS OF THE STREETS —
            </span>
            {/* Second identical copy for seamless looping */}
            <span 
              className="font-archivo uppercase italic" 
              style={{ 
                fontWeight: 900, 
                fontSize: "clamp(48px, 8vw, 96px)", 
                color: "var(--red)", 
                paddingRight: "48px" 
              }}
            >
              BORN IN THE SHADOWS OF THE STREETS —
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
