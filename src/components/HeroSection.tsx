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
      className="relative w-full h-screen overflow-hidden bg-black"
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Image with Gyro Parallax */}
      <motion.div
        ref={bgRef}
        className="absolute inset-[-5%] w-[110%] h-[110%] z-0"
        style={{ x: bgX, y: bgY }}
      >
        <Image
          src="/240_F_333810258_5gP2SBYroH0jtgAtI2ANibRRDe2YY7dU.jpg"
          alt="Steezaverse Models"
          fill
          priority
          className="object-cover object-center select-none"
          draggable={false}
        />
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4"
        style={{ x: contentX, y: contentY }}
      >
        <div className="flex flex-col items-center">
          <motion.span
            style={wordStyle}
            className="text-[clamp(40px,8vw,120px)] text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            STYLE
          </motion.span>
          <motion.span
            style={wordStyle}
            className="text-[clamp(40px,8vw,120px)] text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
          >
            VIBE
          </motion.span>
          <motion.span
            style={wordStyle}
            className="text-[clamp(40px,8vw,120px)] text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={playAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
          >
            REFLECT
          </motion.span>
        </div>

        <motion.p
          className="mt-6 mb-10 text-white/80"
          style={{ fontFamily: "'Ranade', sans-serif", fontSize: "14px" }}
          initial={{ opacity: 0 }}
          animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease }}
        >
          Add a little bit of body text
        </motion.p>

        <motion.button
          className="flex items-center justify-center bg-white px-10 py-3 transition-colors duration-300 hover:bg-white/80"
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
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
            className="text-black transition-colors duration-300"
          >
            Shop Now
          </span>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
