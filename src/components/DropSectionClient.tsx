"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import type { MiniShopItem } from "@/lib/products";

// A single digit component with flip/glitch animation
function GlitchDigit({ digit, isLive, reducedMotion }: { digit: string; isLive: boolean; reducedMotion: boolean }) {
  if (reducedMotion) {
    return <span className="inline-block tabular-nums">{digit}</span>;
  }

  return (
    <div className="relative inline-block w-[1ch] text-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        {!isLive && (
          <motion.span
            key={digit}
            initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-100%", opacity: 0, filter: "blur(4px)", scale: 1.5, rotate: (Math.random() - 0.5) * 20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            className="inline-block tabular-nums"
          >
            {digit}
          </motion.span>
        )}
      </AnimatePresence>
      {isLive && (
        <span className="inline-block tabular-nums opacity-0">{digit}</span> // Keep spacing but hidden when shattered
      )}
    </div>
  );
}

export default function DropSectionClient({ drop }: { drop: MiniShopItem | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: string; h: string; m: string; s: string } | null>(null);
  const [stockRemaining, setStockRemaining] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Refs for GSAP animation targets
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Initialize and check Arrive-After-Live
  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const dropTime = new Date("2026-10-01T00:00:00+01:00").getTime();
    const now = Date.now();
    if (now >= dropTime) {
      setIsLive(true);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !contentWrapperRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });

      // Scale from 0.85 to 1 at 30% scroll, stay at 1 until 70%, then scale to 0.85
      // Opacity from 0 to 1 at 30%, stay at 1 until 70%, then opacity 0
      tl.fromTo(contentWrapperRef.current, { opacity: 0, scale: 0.85, y: 50 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power1.out" })
        .to(contentWrapperRef.current, { opacity: 0, scale: 0.85, y: -50, duration: 0.3, ease: "power1.in" }, 0.7);

    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Countdown timer
  useEffect(() => {
    if (isLive) return;

    const dropTime = new Date("2026-10-01T00:00:00+01:00").getTime();
    
    const tick = () => {
      const now = Date.now();
      const diff = dropTime - now;

      if (diff <= 0) {
        setIsLive(true);
        // Fire cuelume arrival sound
        import("cuelume").then(({ play }) => {
          if (play) play("arrival");
        }).catch(console.warn);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
      setTimeLeft({ d, h, m, s });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [drop, isLive]);

  // Stock polling when live
  useEffect(() => {
    if (!isLive || !drop) return;

    const fetchStock = async () => {
      try {
        // Fetch the full product to get variants stock
        const res = await fetch(`/api/products/${drop.slug}`);
        if (res.ok) {
          const data = await res.json();
          const totalStock = data.variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) || 0;
          setStockRemaining(totalStock);
        }
      } catch (err) {
        console.error("Stock poll error", err);
      }
    };

    fetchStock();
    const interval = setInterval(fetchStock, 4000);
    return () => clearInterval(interval);
  }, [isLive, drop]);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setWaitlistState("sending");
    setWaitlistError(null);
    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: drop?.id || null, // Keep original product ID if available so it doesn't fail
          variantId: null,
          email,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to join RSVP list");
      setWaitlistState("done");
      import("cuelume").then(({ play }) => play && play("success")).catch(console.warn);
    } catch (err: any) {
      setWaitlistError(err.message || "Failed to join RSVP list");
      setWaitlistState("error");
      import("cuelume").then(({ play }) => play && play("error")).catch(console.warn);
    }
  }

  // Dynamic Background: Sleek black (#080808) when countdown, Deep red (#0d0202) when live
  const bgColor = isLive ? "#0d0202" : "#080808";

  // Pulse/shake intensity based on stock
  const isLowStock = stockRemaining !== null && stockRemaining > 0 && stockRemaining <= 5;
  const shakeClass = isLowStock && !reducedMotion ? "animate-[shake_0.5s_ease-in-out_infinite]" : "";

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-0"
      style={{ backgroundColor: bgColor, "--ink-2": "var(--blue)" } as React.CSSProperties}
    >
      <div ref={contentWrapperRef} className="z-10 flex flex-col items-center gap-8 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-4 sm:px-6 md:px-8 py-14 md:py-20 lg:py-24">
        
        {/* Kinetic Countdown */}
        {!isLive && timeLeft && (
          <div 
            className="flex gap-3 md:gap-8 text-white font-black tracking-tighter w-full justify-center" 
            style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(2.8rem, 14vw, 7rem)" }}
          >
            <div className="flex">
              <GlitchDigit digit={timeLeft.d[0]} isLive={isLive} reducedMotion={reducedMotion} />
              <GlitchDigit digit={timeLeft.d[1]} isLive={isLive} reducedMotion={reducedMotion} />
            </div>
            <span className="opacity-50">:</span>
            <div className="flex">
              <GlitchDigit digit={timeLeft.h[0]} isLive={isLive} reducedMotion={reducedMotion} />
              <GlitchDigit digit={timeLeft.h[1]} isLive={isLive} reducedMotion={reducedMotion} />
            </div>
            <span className="opacity-50">:</span>
            <div className="flex">
              <GlitchDigit digit={timeLeft.m[0]} isLive={isLive} reducedMotion={reducedMotion} />
              <GlitchDigit digit={timeLeft.m[1]} isLive={isLive} reducedMotion={reducedMotion} />
            </div>
            <span className="opacity-50">:</span>
            <div className="flex text-[var(--red)]">
              <GlitchDigit digit={timeLeft.s[0]} isLive={isLive} reducedMotion={reducedMotion} />
              <GlitchDigit digit={timeLeft.s[1]} isLive={isLive} reducedMotion={reducedMotion} />
            </div>
          </div>
        )}

        {/* Live State Header */}
        {isLive && (
          <motion.h2 
            initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-white font-black tracking-tighter uppercase text-center leading-[0.92] w-full"
            style={{ fontFamily: "Archivo, sans-serif", fontSize: "clamp(2.6rem, 10vw, 6.5rem)" }}
          >
            PHYSICAL STORE
            <br />
            <span className="text-sz-red">IS NOW OPEN</span>
          </motion.h2>
        )}

        <div 
          className="flex flex-col items-center gap-4 sm:gap-5 w-full max-w-sm sm:max-w-md md:max-w-lg"
        >
          <p className="text-white/70 font-semibold tracking-[0.2em] uppercase text-[10px] sm:text-xs text-center">
            Open 9am – 7pm Daily &nbsp;·&nbsp; Oct 1 – 3
          </p>

          {/* Store Location Map */}
          {isLive && (
            <div className="w-full flex flex-col items-center gap-3 mt-1">
              {/* Map container — taller on larger screens */}
              <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] h-[200px] sm:h-[260px] md:h-[320px] lg:h-[360px]">
                <iframe
                  title="Steezaverse Store Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.7929582847974!2d4.5360008999999994!3d7.4880989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1038376b52a82371%3A0x79336306d0f1eaa8!2sSTEEZAVERSE!5e0!3m2!1sen!2sng!4v1792648726850!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(0.8) brightness(0.85)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              {/* Directions link */}
              <a
                href="https://maps.app.goo.gl/7WEyYzQ9D99NeCmS7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-200 py-1"
                style={{ fontFamily: "'Chillax', sans-serif" }}
              >
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
            </div>
          )}

          {!isLive ? (
            <div className="w-full mt-4">
              {waitlistState === "done" ? (
                <p className="text-sm uppercase tracking-widest text-green-400 text-center font-bold">
                  You&apos;re on the RSVP list
                </p>
              ) : (
                <form onSubmit={joinWaitlist} className="flex flex-col gap-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 text-center" style={{ fontFamily: "'Chillax', sans-serif" }}>
                    RSVP for Launch Updates
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="flex-1 rounded-full border border-white/20 bg-transparent px-6 py-4 text-[13px] text-white placeholder-white/30 outline-none transition-all focus:border-white focus:bg-white/5 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={waitlistState === "sending"}
                      data-cuelume-hover="tick"
                      className="rounded-full bg-white px-8 py-4 text-[13px] font-bold uppercase tracking-[0.15em] text-black hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                      style={{ fontFamily: "'Chillax', sans-serif" }}
                    >
                      {waitlistState === "sending" ? "..." : (
                        <>
                          <span className="mt-[2px]">Notify me</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  {waitlistError && (
                    <p className="text-[11px] text-[var(--red)] uppercase tracking-wider text-center">{waitlistError}</p>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 items-center">
              <a
                href="/shop"
                data-cuelume-hover="tick"
                className="w-full text-center rounded-full bg-white text-black py-4 text-[13px] font-bold uppercase tracking-[0.15em] hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                Visit Shop
              </a>
              {stockRemaining !== null && (
                <p className={`text-[11px] font-bold uppercase tracking-widest ${isLowStock ? 'text-[var(--red)]' : 'text-white/50'} ${shakeClass}`}>
                  {stockRemaining > 0 ? (
                    isLowStock ? `Only ${stockRemaining} left — moving fast` : `${stockRemaining} left in stock`
                  ) : (
                    "Sold out"
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
