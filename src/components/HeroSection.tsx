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

      // Premium parallax outro effect
      if (bg) {
        // Background pushes in, blurs, and fades to black
        tl.to(bg, { 
          opacity: 0.2, 
          scale: 1.15, 
          filter: "blur(12px)",
          duration: 1, 
          ease: "power1.inOut" 
        }, 0);
      }
      if (content && content.children.length >= 2) {
        // Left text block (massive text) scrolls up faster and scales down slightly
        tl.to(content.children[0], { 
          y: "-35vh", 
          opacity: 0, 
          scale: 0.9,
          duration: 1, 
          ease: "power2.inOut" 
        }, 0);
        
        // Right block (typewriter + button) scrolls up slower for depth separation
        tl.to(content.children[1], { 
          y: "-15vh", 
          opacity: 0, 
          duration: 0.8, 
          ease: "power3.in" 
        }, 0.1);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-black"
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Background Photo & Gradient ── */}
      <motion.div
        ref={bgRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ x: bgX, y: bgY, scale: 1.05 }}
      >
        {/* Desktop Image */}
        <Image
          src="/photo_2026-09-09_21-08-39.jpg"
          alt="Steezaverse Models"
          fill
          priority
          className="object-cover object-[center_20%] select-none hidden md:block"
          draggable={false}
        />
        {/* Mobile Image */}
        <Image
          src="/One_voice,_three_shades_Style_that_rides_the_wave_of_fire,_calm (3).jpg"
          alt="Steezaverse Models Mobile"
          fill
          priority
          className="object-cover object-[center_20%] select-none block md:hidden"
          draggable={false}
        />
        {/* Gradients to darken edges for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent md:w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-transparent md:w-1/3 right-0" />
      </motion.div>

      {/* ── Foreground Layout ── */}
      <motion.div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col justify-end md:justify-between md:flex-row md:items-end px-6 md:px-16 pb-20 md:pb-32 pt-32"
        style={{ x: contentX, y: contentY }}
      >
        {/* Left Side: Staggered Large Typography */}
        <div className="flex flex-col text-white uppercase tracking-tighter leading-[0.85] mb-12 md:mb-0" style={{ fontFamily: "'Bespoke Sans', sans-serif" }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={playAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="text-[clamp(45px,7.5vw,130px)] font-extrabold"
          >
            OWN YOUR
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={playAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="text-[clamp(45px,7.5vw,130px)] font-extrabold md:ml-[12%]"
          >
            MODERN LOOK
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={playAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="text-[clamp(45px,7.5vw,130px)] font-extrabold md:ml-[4%] text-[var(--red)]"
          >
            WITH <span style={{ fontFamily: "'Nunito', sans-serif" }}>STEEZAVERSE</span>
          </motion.div>
        </div>

        {/* Right Side: Typewriter Box & CTA */}
        <motion.div
          className="flex flex-col items-start md:items-end w-full md:w-auto md:max-w-xs"
          initial={{ opacity: 0, y: 50 }}
          animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6, ease }}
        >
          {/* Bracketed Typewriter Box */}
          <div className="relative p-6 mb-8 border border-transparent w-full">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60" />
            
            <p
              className="text-white/90 uppercase tracking-widest md:text-right leading-relaxed text-[12px] md:text-[13px] min-h-[3.5rem]"
              style={{ fontFamily: "'Chillax', sans-serif", fontWeight: 500 }}
            >
              {typewriterText}<span className="animate-pulse font-bold text-white">|</span>
            </p>
          </div>

          {/* Pill CTA Button */}
          <motion.button
            className="flex items-center justify-center gap-3 bg-white text-black px-10 py-4 rounded-full transition-all duration-300 hover:bg-black hover:text-white group border border-white"
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
              className="font-bold uppercase tracking-[0.15em] mt-[2px]"
              style={{ fontFamily: "'Chillax', sans-serif", fontSize: "14px" }}
            >
              SHOP THE DROP
            </span>
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M17 7v9m0-9H8" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
