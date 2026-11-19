"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Bell } from "lucide-react";
import type { MiniShopItem } from "@/lib/products";
import { getDropLaunchTime } from "@/lib/constants";
import { playDropArrival, playButtonPress, playButtonRelease } from "@/lib/sound";

// Glitch / flip digit component
function GlitchDigit({
  digit,
  reducedMotion,
}: {
  digit: string;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return <span className="inline-block tabular-nums">{digit}</span>;
  }

  return (
    <div className="relative inline-block w-[1ch] text-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(4px)", scale: 1.2 }}
          transition={{ duration: 0.28, type: "spring", bounce: 0.15 }}
          className="inline-block tabular-nums"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function DropSectionClient({ drop }: { drop: MiniShopItem | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const wasCountingDown = useRef(false);
  const [isLive, setIsLive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: string; h: string; m: string; s: string } | null>(null);
  const [email, setEmail] = useState("");
  const [waitlistState, setWaitlistState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const launchMs = getDropLaunchTime(drop?.drop_starts_at);

  useEffect(() => {
    setHasMounted(true);
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);

    const now = Date.now();
    if (now >= launchMs) {
      setIsLive(true);
      wasCountingDown.current = false;
    } else {
      wasCountingDown.current = true;
    }
  }, [launchMs]);

  // Countdown loop
  useEffect(() => {
    if (isLive || !hasMounted) return;

    const tick = () => {
      const now = Date.now();
      const diff = launchMs - now;

      if (diff <= 0) {
        setIsLive(true);
        setTimeLeft(null);
        if (wasCountingDown.current) {
          playDropArrival();
        }
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
  }, [launchMs, isLive, hasMounted]);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email || waitlistState === "sending") return;

    setWaitlistState("sending");
    setWaitlistError(null);
    playButtonPress();

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: drop?.id || null,
          variantId: null,
          email,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to join RSVP list");
      setWaitlistState("done");
      playButtonRelease();
    } catch (err: any) {
      setWaitlistError(err.message || "Failed to join waitlist. Please try again.");
      setWaitlistState("error");
    }
  }

  // Hard cut background: deep electric blue (#030f26) for upcoming drop, deep red (#120303) when live
  const bgStyle = isLive
    ? "bg-gradient-to-b from-[#120303] via-[#0a0202] to-black"
    : "bg-gradient-to-b from-[#030f26] via-[#020919] to-black";

  return (
    <section
      id="take-reeks"
      ref={sectionRef}
      className={`relative w-full min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 ${bgStyle} py-20 md:py-28 px-4 sm:px-6 z-20`}
    >
      {/* Subtle ambient lighting orb */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-colors duration-700 ${
          isLive ? "bg-sz-red" : "bg-[#0055ff]"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4 md:mb-5">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isLive ? "bg-sz-red" : "bg-blue-400"
            }`}
          />
          <span
            className={`text-[11px] md:text-xs font-archivo font-extrabold uppercase tracking-[0.3em] ${
              isLive ? "text-sz-red" : "text-blue-400"
            }`}
          >
            {isLive ? "NOW LIVE" : "FIRST COLLECTION"}
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-archivo font-black text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tight leading-none mb-3 md:mb-4">
          TAKE REEKS
        </h2>

        {/* Subline */}
        <p className="font-archivo font-semibold uppercase tracking-[0.25em] text-white/60 text-xs sm:text-sm md:text-base mb-10 md:mb-14">
          {isLive ? "The First Collection Has Landed" : "Limited run. No restocks."}
        </p>

        {/* Kinetic Countdown / Live Swap */}
        {!isLive ? (
          <div className="w-full flex flex-col items-center">
            {timeLeft ? (
              <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mb-12 select-none">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div
                    className="font-archivo font-black text-white tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none flex"
                  >
                    <GlitchDigit digit={timeLeft.d[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.d[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-archivo font-bold uppercase tracking-[0.25em] text-white/40 mt-2">
                    DAYS
                  </span>
                </div>

                <span className="font-archivo font-black text-2xl sm:text-4xl md:text-5xl text-blue-500/50 -translate-y-3">
                  :
                </span>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div
                    className="font-archivo font-black text-white tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none flex"
                  >
                    <GlitchDigit digit={timeLeft.h[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.h[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-archivo font-bold uppercase tracking-[0.25em] text-white/40 mt-2">
                    HOURS
                  </span>
                </div>

                <span className="font-archivo font-black text-2xl sm:text-4xl md:text-5xl text-blue-500/50 -translate-y-3">
                  :
                </span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div
                    className="font-archivo font-black text-white tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none flex"
                  >
                    <GlitchDigit digit={timeLeft.m[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.m[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-archivo font-bold uppercase tracking-[0.25em] text-white/40 mt-2">
                    MINS
                  </span>
                </div>

                <span className="font-archivo font-black text-2xl sm:text-4xl md:text-5xl text-blue-500/50 -translate-y-3">
                  :
                </span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div
                    className="font-archivo font-black text-blue-400 tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none flex"
                  >
                    <GlitchDigit digit={timeLeft.s[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.s[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-archivo font-bold uppercase tracking-[0.25em] text-blue-400/60 mt-2">
                    SECS
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-24 sm:h-32" />
            )}

            {/* Waitlist RSVP Form */}
            <div className="w-full max-w-md sm:max-w-lg">
              {waitlistState === "done" ? (
                <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-white/[0.04] border border-blue-500/30 text-white">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <p className="text-xs sm:text-sm font-archivo font-bold uppercase tracking-wider text-white">
                    You&apos;re on the RSVP list · Priority Access Granted
                  </p>
                </div>
              ) : (
                <form onSubmit={joinWaitlist} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2 bg-white/[0.04] p-1.5 sm:p-2 rounded-2xl sm:rounded-full border border-white/15 focus-within:border-blue-500 transition-colors">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for drop access..."
                      className="w-full bg-transparent px-5 py-3 text-sm text-white placeholder-white/35 outline-none font-sans"
                    />
                    <button
                      type="submit"
                      disabled={waitlistState === "sending"}
                      className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#0055ff] hover:bg-[#0047db] active:bg-[#003bb8] text-white px-7 py-3.5 rounded-xl sm:rounded-full font-archivo font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(0,85,255,0.4)]"
                    >
                      {waitlistState === "sending" ? (
                        <span>Joining...</span>
                      ) : (
                        <>
                          <Bell size={14} />
                          <span>Get notified</span>
                        </>
                      )}
                    </button>
                  </div>
                  {waitlistError && (
                    <p className="text-xs text-red-400 font-archivo tracking-wider mt-1">
                      {waitlistError}
                    </p>
                  )}
                  <p className="text-[11px] font-archivo uppercase tracking-[0.2em] text-white/40 mt-1">
                    Drops Monday, Nov 23 · Subscribers Get 15-Minute Head Start
                  </p>
                </form>
              )}
            </div>
          </div>
        ) : (
          // Live State
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            <p className="text-sm md:text-base text-white/70 max-w-sm">
              Statement pieces for people who move different. Heavyweight cuts, no restocks.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-sz-red hover:bg-red-600 active:bg-red-700 text-white font-archivo font-black uppercase tracking-widest text-sm md:text-base px-10 py-5 rounded-full transition-all duration-300 shadow-[0_10px_35px_rgba(255,42,42,0.4)] hover:shadow-[0_15px_45px_rgba(255,42,42,0.6)] transform hover:-translate-y-0.5"
            >
              <span>Shop the collection</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
