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
    lineHeight: 1,
    letterSpacing: "-0.02em",
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#e8e8e8]"
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Layer 1 (bottom): VERSE text sits BEHIND image ── */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <span
          className="absolute opacity-0 select-none"
          style={{
            ...wordStyle,
            fontSize: "clamp(40px, 11vw, 160px)",
            top: "50%",
            transform: "translateY(-50%)",
            left: "8%",
          }}
        >
          STEEZA
        </span>
        <span
          className="absolute text-[var(--red)] select-none"
          style={{
            ...wordStyle,
            fontSize: "clamp(40px, 11vw, 160px)",
            top: "50%",
            transform: "translateY(-50%)",
            left: "62%",
          }}
        >
          VERSE
        </span>
      </motion.div>

      {/* ── Layer 2 (middle): The photo — mix-blend-multiply reveals text through studio grey bg ── */}
      <motion.div
        ref={bgRef}
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply"
        style={{ x: bgX, y: bgY }}
      >
        <Image
          src="/photo_2026-09-09_21-08-39.jpg"
          alt="Steezaverse Models"
          fill
          priority
          className="object-cover object-[center_20%] select-none"
          draggable={false}
        />
      </motion.div>

      {/* ── Layer 3 (top): STEEZA sits IN FRONT of image ── */}
      <motion.div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <span
          className="absolute text-black select-none"
          style={{
            ...wordStyle,
            fontSize: "clamp(40px, 11vw, 160px)",
            top: "50%",
            transform: "translateY(-50%)",
            left: "8%",
          }}
        >
          STEEZA
        </span>
        <span
          className="absolute opacity-0 select-none"
          style={{
            ...wordStyle,
            fontSize: "clamp(40px, 11vw, 160px)",
            top: "50%",
            transform: "translateY(-50%)",
            left: "62%",
          }}
        >
          VERSE
        </span>
      </motion.div>

      {/* ── UI Layer: typewriter + CTA button, interactable ── */}
      <motion.div
        ref={contentRef}
        className="absolute inset-0 z-[4] flex flex-col items-center justify-end pb-20 text-center px-4"
        style={{ x: contentX, y: contentY }}
      >
        <motion.p
          className="mb-6 text-black/70 uppercase tracking-widest min-h-[1.5rem]"
          style={{ fontFamily: "'Chillax', sans-serif", fontSize: "11px", fontWeight: 600 }}
          initial={{ opacity: 0 }}
          animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease }}
        >
          {typewriterText}<span className="animate-pulse">|</span>
        </motion.p>

        <motion.button
          className="flex items-center justify-center bg-black px-10 py-3 transition-colors duration-300 hover:bg-[var(--red)]"
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
            className="text-white font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: "'Chillax', sans-serif", fontSize: "13px" }}
          >
            SHOP THE DROP
          </span>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
