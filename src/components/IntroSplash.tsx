"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";




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
            style={{ backgroundColor: "#0a0a0a", cursor: "pointer", zIndex: 9999 }}
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
function SplashContent() {
  return (
    <>
      {/* ── BIG BRAND LOGO ── */}
      <motion.div
        style={{ position: "relative", width: "clamp(200px, 60vw, 800px)", height: "clamp(80px, 20vw, 250px)" }}
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/STV_mini_logo-removebg-preview.png"
          alt="Steezaverse"
          fill
          priority
          className="object-contain brightness-0 invert"
        />
      </motion.div>
    </>
  );
}
