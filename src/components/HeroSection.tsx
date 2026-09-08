"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import ClickBlackHole from "./ClickBlackHole";
import HeroBlobs from "./HeroBlobs";

gsap.registerPlugin(ScrollTrigger);

// Shared entrance easing
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number, duration = 0.85) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease },
});

const fadeIn = (delay: number, duration = 0.75) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration, delay, ease: "easeOut" as const },
});

const fadeUpObj = (delay: number, duration = 0.85) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease },
});

const fadeInObj = (delay: number, duration = 0.75) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration, delay, ease: "easeOut" as const },
});

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef    = useRef<HTMLSpanElement>(null);
  const rightRef   = useRef<HTMLSpanElement>(null);
  const modelRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [playAnimations, setPlayAnimations] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ((window as any).introPlayed) {
        setPlayAnimations(true);
      } else {
        const handleIntro = () => setPlayAnimations(true);
        window.addEventListener("introComplete", handleIntro);
        return () => window.removeEventListener("introComplete", handleIntro);
      }
    }
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current!;
      const left    = leftRef.current!;
      const right   = rightRef.current!;
      const model   = modelRef.current!;
      const overlay = overlayRef.current!;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=220%",
          scrub: 1.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(model,   { y: "-18vh", duration: 1, ease: "none" }, 0)
        .to(left,    { x: "-20vw", opacity: 0, duration: 1, ease: "power2.inOut" }, 0)
        .to(right,   { x: "20vw",  opacity: 0, duration: 1, ease: "power2.inOut" }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const desktopFontSize = "clamp(90px, 11vw, 210px)";
  const mobileFontSize  = "clamp(36px, 12.5vw, 65px)";
  const fontSize = isMobile ? mobileFontSize : desktopFontSize;

  const wordStyle: React.CSSProperties = {
    fontFamily: "'Aktura', serif",
    fontSize,
    whiteSpace: "nowrap",
    letterSpacing: "-0.02em",
    color: "#ffffff",
    lineHeight: 0.85,
    display: "block",
  };

  return (
    <ClickBlackHole dotSize={3} count={65} coreRadius={12} color="#ffffff" className="w-full">
      <motion.section
        ref={sectionRef}
        className="relative w-full h-screen overflow-hidden"
        style={{ backgroundColor: "var(--red)" }}
        aria-label="Hero"
        initial={{ opacity: 0 }}
        animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.07,
            mixBlendMode: "overlay",
          }}
        />

        {/* Floating interactive blobs */}
        <HeroBlobs count={8} />

        {/* Scroll overlay */}
        <div ref={overlayRef} className="absolute inset-0 bg-black opacity-0 pointer-events-none z-50" />

        {/* ── MODEL ── */}
        {isMobile ? (
          <motion.div
            className="absolute left-1/2 z-20 pointer-events-none"
            style={{ top: "50%", width: "135vw", height: "65vh" }}
            initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.96 }}
            animate={playAnimations ? { opacity: 1, x: "-50%", y: "-50%", scale: 1 } : { opacity: 0, x: "-50%", y: "-50%", scale: 0.96 }}
            transition={{ duration: 1.1, delay: 0.5, ease }}
          >
            <div ref={modelRef} className="w-full h-full relative">
              <Image
                src="/IMG_3889-removebg-preview.png"
                alt="Steezaverse model"
                fill priority
                className="object-contain object-center select-none"
                draggable={false}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="absolute left-1/2 z-20 pointer-events-none"
            style={{ top: "50%", width: "clamp(420px, 52vw, 980px)", height: "115vh" }}
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 30px)" }}
            animate={playAnimations ? { opacity: 1, x: "-50%", y: "-50%" } : { opacity: 0, x: "-50%", y: "calc(-50% + 30px)" }}
            transition={{ duration: 1.2, delay: 0.55, ease }}
          >
            <div ref={modelRef} className="w-full h-full relative">
              <Image
                src="/IMG_3889-removebg-preview.png"
                alt="Steezaverse model"
                fill priority
                className="object-contain object-bottom select-none"
                draggable={false}
              />
            </div>
          </motion.div>
        )}

        {/* ── STEEZA ── */}
        <motion.div
          className="absolute left-0 z-10 select-none pointer-events-none"
          style={{ bottom: isMobile ? "16vh" : "12vh" }}
          initial={{ opacity: 0, x: -40 }}
          animate={playAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 1.0, delay: 0.7, ease }}
        >
          <span ref={leftRef} style={wordStyle}>
            STEEZA
          </span>
        </motion.div>

        {/* ── VERSE ── */}
        <motion.div
          className="absolute right-0 z-10 select-none pointer-events-none"
          style={{ bottom: isMobile ? "16vh" : "12vh" }}
          initial={{ opacity: 0, x: 40 }}
          animate={playAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 1.0, delay: 0.7, ease }}
        >
          <span ref={rightRef} style={wordStyle}>
            VERSE
          </span>
        </motion.div>

        {/* ── EDITORIAL META — desktop only ── */}
        {!isMobile && (
          <>
            <motion.div
              className="absolute z-30 select-none pointer-events-none"
              style={{ top: "14vh", left: "3vw" }}
              initial={fadeUpObj(0.9).initial}
              animate={playAnimations ? fadeUpObj(0.9).animate : fadeUpObj(0.9).initial}
              transition={fadeUpObj(0.9).transition}
            >
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block", lineHeight: 1.9 }}>Drop</span>
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "block" }}>001 / FW26</span>
            </motion.div>

            <motion.div
              className="absolute z-30 flex items-center gap-2 select-none pointer-events-none"
              style={{ top: "14vh", right: "3vw" }}
              initial={fadeUpObj(1.0).initial}
              animate={playAnimations ? fadeUpObj(1.0).animate : fadeUpObj(1.0).initial}
              transition={fadeUpObj(1.0).transition}
            >
              <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>01 / 06</span>
            </motion.div>

            <motion.div
              className="absolute z-30 select-none pointer-events-none"
              style={{ top: "50%", transform: "translateY(-50%)", right: "3vw", maxWidth: 148 }}
              initial={fadeInObj(1.1).initial}
              animate={playAnimations ? fadeInObj(1.1).animate : fadeInObj(1.1).initial}
              transition={fadeInObj(1.1).transition}
            >
              <span style={{ fontFamily: "'Ranade', sans-serif", fontWeight: 300, fontSize: 10.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, display: "block" }}>
                Custom-fit cotton hoodie with doubled sleeves and a partially hidden right-sleeve print.
              </span>
            </motion.div>
          </>
        )}

        {/* Mobile drop label */}
        {isMobile && (
          <motion.div
            className="absolute z-30 select-none pointer-events-none"
            style={{ top: "10vh", left: "4vw" }}
            initial={fadeInObj(0.6).initial}
            animate={playAnimations ? fadeInObj(0.6).animate : fadeInObj(0.6).initial}
            transition={fadeInObj(0.6).transition}
          >
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", display: "block", lineHeight: 1.9 }}>Drop 001</span>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 600, fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", display: "block" }}>FW26</span>
          </motion.div>
        )}



      </motion.section>
    </ClickBlackHole>
  );
}
