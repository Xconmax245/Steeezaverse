"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [playAnimations, setPlayAnimations] = useState(false);

  // Typewriter state
  const [typewriterText, setTypewriterText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typewriterTexts = [
    "CURATED HEAVYWEIGHT GARMENTS.",
    "LIMITED RUNS. NO RESTOCKS.",
    "SHAPING THE FUTURE OF STREETWEAR.",
    "THE NEW STANDARD IN PREMIUM ESSENTIALS."
  ];

  useEffect(() => {
    if (!playAnimations) return;
    let timer: NodeJS.Timeout;
    const currentFullText = typewriterTexts[textIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypewriterText(currentFullText.substring(0, typewriterText.length - 1));
        if (typewriterText.length === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
        }
      }, 30); // deleting speed
    } else {
      timer = setTimeout(() => {
        setTypewriterText(currentFullText.substring(0, typewriterText.length + 1));
        if (typewriterText.length === currentFullText.length) {
          timer = setTimeout(() => setIsDeleting(true), 2500); // pause before deleting
        }
      }, 60); // typing speed
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, textIndex, playAnimations]);

  // Parallax Gyroscope values
  const gyroX = useMotionValue(0);
  const gyroY = useMotionValue(0);

  const smoothGyroX = useSpring(gyroX, { stiffness: 100, damping: 30 });
  const smoothGyroY = useSpring(gyroY, { stiffness: 100, damping: 30 });

  // Apply a subtle scale so the image has room to move without showing edges
  const bgX = useTransform(smoothGyroX, (x) => x * -0.5);
  const bgY = useTransform(smoothGyroY, (y) => y * -0.5);
  const contentX = useTransform(smoothGyroX, (x) => x * 0.3);
  const contentY = useTransform(smoothGyroY, (y) => y * 0.3);

  useEffect(() => {
    if (typeof window === "undefined" || !window.DeviceOrientationEvent) return;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;
      const clampedGamma = Math.max(-45, Math.min(45, gamma));
      const clampedBeta = Math.max(0, Math.min(90, beta)) - 45;
      gyroX.set((clampedGamma / 45) * 35);
      gyroY.set((clampedBeta / 45) * 35);
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [gyroX, gyroY]);

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

  // GSAP Pin & Scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const bg = bgRef.current;

      if (!section) return;

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

      // Simple parallax fade and slight zoom out on scroll down
      if (bg) {
        tl.to(bg, { opacity: 0.3, scale: 1.05, duration: 1, ease: "none" }, 0);
      }
      if (content) {
        tl.to(content, { y: "-15vh", opacity: 0, duration: 1, ease: "power2.inOut" }, 0);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const wordStyle: React.CSSProperties = {
    fontFamily: "'Bespoke Sans', sans-serif",
    fontWeight: 800,
    textTransform: "uppercase",
    lineHeight: 1.05,
    letterSpacing: "0.05em",
    display: "block",
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#e6e6e6]"
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Text Layer (VERSE) */}
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center text-center pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <div className="flex items-center tracking-tighter text-[clamp(36px,11vw,140px)]" style={wordStyle}>
           <motion.span 
            className="opacity-0"
            initial={{ opacity: 0, y: 20 }}
            animate={playAnimations ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
           >STEEZA</motion.span>
           <motion.span 
            className="text-[var(--red)]"
            initial={{ opacity: 0, y: 20 }}
            animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
           >VERSE</motion.span>
        </div>
      </motion.div>

      {/* Middle Image Layer */}
      <motion.div
        ref={bgRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none mix-blend-multiply"
        style={{ x: bgX, y: bgY }}
      >
        <Image
          src="/photo_2026-09-09_21-08-39.jpg"
          alt="Steezaverse Models"
          fill
          priority
          className="object-cover md:object-center select-none"
          draggable={false}
        />
        {/* Subtle overlay removed to keep colors bright, add if needed */}
      </motion.div>

      {/* Foreground Text Layer (STEEZA) */}
      <motion.div
        ref={contentRef}
        className="relative z-20 w-full h-full flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <div className="flex flex-col items-center w-full px-2">
          <div className="flex items-center tracking-tighter text-[clamp(36px,11vw,140px)]" style={wordStyle}>
            <motion.span 
              className="text-black"
              initial={{ opacity: 0, y: 20 }}
              animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
            >STEEZA</motion.span>
            <motion.span 
              className="opacity-0"
              initial={{ opacity: 0, y: 20 }}
              animate={playAnimations ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
            >VERSE</motion.span>
          </div>
        </div>

        <motion.p
          className="mt-6 mb-10 text-black/80 uppercase tracking-widest min-h-[1.5rem]"
          style={{ fontFamily: "'Chillax', sans-serif", fontSize: "12px", fontWeight: 600 }}
          initial={{ opacity: 0 }}
          animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease }}
        >
          {typewriterText}<span className="animate-pulse">|</span>
        </motion.p>

        <motion.button
          className="group flex items-center justify-center bg-black px-10 py-3 transition-colors duration-300 hover:bg-[var(--red)]"
          initial={{ opacity: 0, y: 10 }}
          animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            window.scrollBy({
              top: window.innerHeight * 1.5,
              behavior: "smooth",
            })
          }
          data-cursor="pointer"
          data-cuelume-press
          data-cuelume-release
          data-cuelume-hover="tick"
        >
          <span
            className="text-white font-semibold uppercase tracking-[0.2em] transition-colors duration-300"
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: "13px",
            }}
          >
            SHOP THE DROP
          </span>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
