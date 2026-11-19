"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check, Bell } from "lucide-react";
import type { MiniShopItem } from "@/lib/products";
import { getDropLaunchTime } from "@/lib/constants";
import { playDropArrival, playButtonPress, playButtonRelease } from "@/lib/sound";

const NOTIFY_STORAGE_KEY = "take_reeks_site_notification";

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
  const [isNotified, setIsNotified] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const launchMs = getDropLaunchTime(drop?.drop_starts_at);

  useEffect(() => {
    setHasMounted(true);
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(isReduced);

    // Read stored notification state
    try {
      if (localStorage.getItem(NOTIFY_STORAGE_KEY) === "true") {
        setIsNotified(true);
      }
    } catch (_) {}

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

  const toggleNotification = async () => {
    playButtonPress();

    if (!isNotified) {
      // Request browser notification permission if available
      try {
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
        }
      } catch (_) {}

      try {
        localStorage.setItem(NOTIFY_STORAGE_KEY, "true");
      } catch (_) {}

      setIsNotified(true);
      playButtonRelease();
    } else {
      // Allow disabling if desired
      try {
        localStorage.removeItem(NOTIFY_STORAGE_KEY);
      } catch (_) {}
      setIsNotified(false);
      playButtonRelease();
    }
  };

  // Hard cut background: deep electric blue (#030f26) for upcoming drop, deep red (#120303) when live
  const bgStyle = isLive
    ? "bg-gradient-to-b from-[#120303] via-[#0a0202] to-black"
    : "bg-gradient-to-b from-[#030f26] via-[#020919] to-black";

  return (
    <section
      id="take-reeks"
      ref={sectionRef}
      className={`relative w-full min-h-[80vh] md:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700 ${bgStyle} py-16 sm:py-20 md:py-28 px-4 sm:px-6 z-20`}
    >
      {/* Subtle ambient lighting orb */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[650px] h-[350px] sm:h-[500px] md:h-[650px] rounded-full blur-[140px] opacity-25 transition-colors duration-700 ${
          isLive ? "bg-sz-red" : "bg-[#0055ff]"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isLive ? "bg-sz-red" : "bg-blue-400"
            }`}
          />
          <span
            className={`text-[10px] sm:text-[11px] md:text-xs font-archivo font-extrabold uppercase tracking-[0.3em] ${
              isLive ? "text-sz-red" : "text-blue-400"
            }`}
          >
            {isLive ? "NOW LIVE" : "FIRST COLLECTION"}
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-archivo font-black text-white text-4xl sm:text-6xl md:text-7xl lg:text-9xl uppercase tracking-tight leading-none mb-3 sm:mb-4">
          TAKE REEKS
        </h2>

        {/* Subline */}
        <p className="font-archivo font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/60 text-[11px] sm:text-xs md:text-sm lg:text-base mb-8 sm:mb-12 md:mb-14">
          {isLive ? "The First Collection Has Landed" : "Limited run. No restocks."}
        </p>

        {/* Kinetic Countdown / Live Swap */}
        {!isLive ? (
          <div className="w-full flex flex-col items-center">
            {timeLeft ? (
              <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-7 mb-10 sm:mb-12 select-none w-full max-w-xl">
                {/* Days */}
                <div className="flex flex-col items-center flex-1">
                  <div className="font-archivo font-black text-white tracking-tight text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-none flex justify-center">
                    <GlitchDigit digit={timeLeft.d[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.d[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[9px] sm:text-[11px] md:text-xs font-archivo font-bold uppercase tracking-[0.2em] text-white/40 mt-1.5 sm:mt-2">
                    DAYS
                  </span>
                </div>

                <span className="font-archivo font-black text-lg sm:text-3xl md:text-5xl text-blue-500/40 -translate-y-2 sm:-translate-y-3">
                  :
                </span>

                {/* Hours */}
                <div className="flex flex-col items-center flex-1">
                  <div className="font-archivo font-black text-white tracking-tight text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-none flex justify-center">
                    <GlitchDigit digit={timeLeft.h[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.h[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[9px] sm:text-[11px] md:text-xs font-archivo font-bold uppercase tracking-[0.2em] text-white/40 mt-1.5 sm:mt-2">
                    HOURS
                  </span>
                </div>

                <span className="font-archivo font-black text-lg sm:text-3xl md:text-5xl text-blue-500/40 -translate-y-2 sm:-translate-y-3">
                  :
                </span>

                {/* Minutes */}
                <div className="flex flex-col items-center flex-1">
                  <div className="font-archivo font-black text-white tracking-tight text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-none flex justify-center">
                    <GlitchDigit digit={timeLeft.m[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.m[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[9px] sm:text-[11px] md:text-xs font-archivo font-bold uppercase tracking-[0.2em] text-white/40 mt-1.5 sm:mt-2">
                    MINS
                  </span>
                </div>

                <span className="font-archivo font-black text-lg sm:text-3xl md:text-5xl text-blue-500/40 -translate-y-2 sm:-translate-y-3">
                  :
                </span>

                {/* Seconds */}
                <div className="flex flex-col items-center flex-1">
                  <div className="font-archivo font-black text-blue-400 tracking-tight text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-none flex justify-center">
                    <GlitchDigit digit={timeLeft.s[0]} reducedMotion={reducedMotion} />
                    <GlitchDigit digit={timeLeft.s[1]} reducedMotion={reducedMotion} />
                  </div>
                  <span className="text-[9px] sm:text-[11px] md:text-xs font-archivo font-bold uppercase tracking-[0.2em] text-blue-400/70 mt-1.5 sm:mt-2">
                    SECS
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-20 sm:h-28" />
            )}

            {/* On-Site Drop Notification Option (No email required) */}
            <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-3">
              <button
                type="button"
                data-notify-trigger
                onClick={toggleNotification}
                data-cursor="pointer"
                data-cuelume-hover="tick"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-archivo font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isNotified
                    ? "bg-white/[0.08] hover:bg-white/[0.12] text-white border border-blue-400/40 shadow-[0_0_25px_rgba(0,85,255,0.25)]"
                    : "bg-[#0055ff] hover:bg-[#0047db] active:bg-[#003bb8] text-white shadow-[0_10px_30px_rgba(0,85,255,0.4)] hover:shadow-[0_12px_35px_rgba(0,85,255,0.55)] transform hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {isNotified ? (
                  <>
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span>Drop Notifications Enabled</span>
                  </>
                ) : (
                  <>
                    <Bell size={16} className="animate-pulse" />
                    <span>Turn on Drop Notifications</span>
                  </>
                )}
              </button>

              <p className="text-[10px] sm:text-[11px] font-archivo uppercase tracking-[0.18em] text-white/40 max-w-xs sm:max-w-sm text-center leading-relaxed">
                {isNotified
                  ? "✓ You will be alerted directly on this device the moment Take Reeks goes live."
                  : "Tap above to enable instant drop alerts on this device. No signup required."}
              </p>
            </div>
          </div>
        ) : (
          // Live State
          <div className="w-full max-w-md flex flex-col items-center gap-5 sm:gap-6">
            <p className="text-xs sm:text-sm md:text-base text-white/70 max-w-sm">
              Statement pieces for people who move different. Heavyweight cuts, no restocks.
            </p>
            <Link
              href="/shop"
              data-cursor="pointer"
              data-cuelume-hover="tick"
              className="inline-flex items-center gap-3 bg-sz-red hover:bg-red-600 active:bg-red-700 text-white font-archivo font-black uppercase tracking-widest text-xs sm:text-sm md:text-base px-8 sm:px-10 py-4 sm:py-5 rounded-full transition-all duration-300 shadow-[0_10px_35px_rgba(255,42,42,0.4)] hover:shadow-[0_15px_45px_rgba(255,42,42,0.6)] transform hover:-translate-y-0.5 cursor-pointer"
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
