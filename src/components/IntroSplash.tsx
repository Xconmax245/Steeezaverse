"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const WORD = "STEEZAVERSE";

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return chars[Math.floor(Math.random() * chars.length)];
}

function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState<string[]>(() => text.split(""));
  const [done, setDone] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let iv: ReturnType<typeof setInterval>;
    let step = 0;
    const total = text.length * 3;

    t1 = setTimeout(() => {
      if (!isMounted.current) return;
      setDisplayed(text.split("").map(() => randomChar()));
      iv = setInterval(() => {
        step++;
        setDisplayed(text.split("").map((char, i) => {
          const resolveAt = Math.floor((i / text.length) * total);
          return step >= resolveAt ? char : randomChar();
        }));
        if (step >= total) { clearInterval(iv); setDone(true); }
      }, 42);
    }, delay);

    return () => { clearTimeout(t1); clearInterval(iv); };
  }, [text, delay]);

  return (
    <span aria-label={text}>
      {displayed.map((char, i) => (
        <span key={i} style={{
          color: done || char === text[i] ? "#ffffff" : "rgba(180,30,30,0.85)",
          transition: "color 0.1s",
        }}>
          {char}
        </span>
      ))}
    </span>
  );
}

function LoaderBar({ delay = 900, duration = 1700 }: { delay?: number; duration?: number }) {
  const [width, setWidth] = useState(0);
  const [label, setLabel] = useState("LOADING DROP 001");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setWidth(100);
      const t2 = setTimeout(() => setLabel("READY  ✓"), Math.floor(duration * 0.68));
      return () => clearTimeout(t2);
    }, delay);
    return () => clearTimeout(t1);
  }, [delay, duration]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: "min(220px, 34vw)", height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: "linear-gradient(90deg, #5e0505, #9e0e0e)",
          borderRadius: 9999,
          transition: `width ${duration}ms cubic-bezier(0.4,0,0.2,1)`,
        }} />
      </div>
      <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: "8px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
        {label}
      </span>
    </div>
  );
}

export default function IntroSplash() {
  const pathname = usePathname();
  // Root-layout component: it mounts once per document load, so capture the
  // route of THAT load. Client-side navigations change `pathname` but never
  // remount the component, so they can never replay the splash.
  const initialPathname = useRef(pathname);

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const dismiss = useCallback(() => {
    setPhase("out");
    if (typeof window !== "undefined") {
      (window as any).introPlayed = true;
      window.dispatchEvent(new Event("introComplete"));
    }
  }, []);

  // Only play on a real load of the landing page: first visit ("navigate") or
  // a refresh ("reload"). Skip on every other route, on back/forward restores
  // (bfcache), and always on client-side navigation. When skipped, fire
  // "introComplete" immediately so hero animations start without the splash.
  useEffect(() => {
    const nav = performance?.getEntriesByType?.("navigation")?.[0] as
      PerformanceNavigationTiming | undefined;
    const navType = nav?.type ?? "navigate";

    if (initialPathname.current !== "/" || navType === "back_forward") {
      (window as any).introPlayed = true;
      window.dispatchEvent(new Event("introComplete"));
      return;
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onInteract = () => dismiss();
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("pointerdown", onInteract, { once: true });
    const hold = setTimeout(dismiss, reduced ? 1000 : 4000);
    const cap  = setTimeout(dismiss, 6500);
    return () => {
      clearTimeout(hold); clearTimeout(cap);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("pointerdown", onInteract);
    };
  }, [visible, dismiss]);

  const onExitComplete = useCallback(async () => {
    setVisible(false);
    try { const { play } = await import("cuelume"); play("ready"); } catch (_) {}
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {phase !== "out" && (
        <motion.div key="intro" className="fixed inset-0" style={{ zIndex: 9999 }}>
          {/* ── CONTENT LAYER — lifts away first ── */}
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
            style={{ backgroundColor: "#0a0a0a", cursor: "pointer" }}
            exit={{ y: "-6%", opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            onClick={dismiss}
          >
            <SplashContent />
          </motion.div>

          {/* ── CURTAIN PANELS — staggered wipe, reveals the hero beneath ──
              Driven purely by `exit` so AnimatePresence holds the unmount
              until the full staggered wipe finishes. */}
          <div className="fixed inset-0 flex pointer-events-none" style={{ zIndex: 2 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-full flex-1"
                style={{
                  backgroundColor: "#0a0a0a",
                  boxShadow: "1px 0 0 rgba(255,255,255,0.045)",
                  willChange: "transform",
                }}
                initial={{ y: "0%" }}
                exit={{
                  y: "-102%",
                  transition: { duration: 0.72, ease: [0.76, 0, 0.24, 1], delay: i * 0.055 },
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** All visual content of the splash, split out so the exit choreography stays readable. */
function SplashContent() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ghost counter — a loader-style percentage readout that races to 100
  // alongside the bar, then flips to READY. Purely decorative.
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const DURATION = 2250;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out so it flies up fast, then crawls — classic loader feel
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <>
      {/* Soft ambient bloom — warm, not harsh */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 48% at 50% 52%, rgba(124,10,10,0.25) 0%, transparent 72%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.0, ease: "easeOut" }}
          />

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)" }}
          />

          {/* ── LARGE BRAND LOGO — STV_mini_logo ── */}
          <motion.div
            style={{ position: "relative", width: "clamp(130px, 20vw, 280px)", height: "clamp(65px, 10vw, 140px)", marginBottom: "clamp(20px, 3.5vw, 44px)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/STV_mini_logo-removebg-preview.png"
              alt="Steezaverse"
              fill
              priority
              className="object-contain"
            />
          </motion.div>

          {/* ── WORDMARK — Chillax, massive ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: "clamp(46px, 10vw, 172px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 0.88,
              textAlign: "center",
            }}
          >
            <ScrambleText text={WORD} delay={460} />
          </motion.div>

          {/* ── TAGLINE ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.38 }}
            transition={{ duration: 0.7, delay: 0.85, ease: "easeOut" }}
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(9px, 1vw, 13px)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginTop: "clamp(10px, 1.5vw, 18px)",
            }}
          >
            Streetwear is dead — long live Steezaverse
          </motion.p>

          {/* Thin divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "clamp(40px, 6vw, 80px)",
              height: 1,
              background: "rgba(255,255,255,0.2)",
              marginTop: "clamp(18px, 3vw, 32px)",
              transformOrigin: "center",
            }}
          />

          {/* ── LOADER (goofy bit) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            style={{ marginTop: "clamp(18px, 2.5vw, 28px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
          >
            <LoaderBar delay={850} duration={1800} />
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.4)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(count).padStart(3, "0")}%
            </span>
          </motion.div>

          {/* Bottom edition stamp */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.13 }}
            transition={{ duration: 0.5, delay: 2.4 }}
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 600,
              fontSize: "8px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              position: "absolute",
              bottom: "36px",
            }}
          >
            Est. 2024 — Drop 001 — FW26 — Limited Edition
          </motion.p>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            transition={{ duration: 0.4, delay: 1.7 }}
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 600,
              fontSize: "8px",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
              position: "absolute",
              bottom: "18px",
            }}
          >
            Tap anywhere to skip →
          </motion.p>
    </>
  );
}
