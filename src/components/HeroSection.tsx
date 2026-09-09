"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * ─── Cover-lock typography calibration ──────────────────────────────────────
 * Fractions are in IMAGE SPACE (0..1 across the full 1280x719 photo), NOT
 * viewport %. Because object-position is `center 20%`, horizontal subject
 * fractions are rock solid; vertical fractions shift a little on very wide
 * screens (the photo crops top/bottom around the 20% line).
 *
 * Calibrated against public/photo_2026-09-09_21-08-39.jpg:
 *   blue guy   torso ≈ x 0.055 → 0.215, chest centroid ≈ x 0.135, y 0.63
 *   yellow guy torso ≈ x 0.400 → 0.570, chest centroid ≈ x 0.490, y 0.63
 *   red guy    torso ≈ x 0.680 → 0.905, chest centroid ≈ x 0.790, y 0.63
 *
 * Tune with:  fx/fy  = anchor point in the photo (0..1)
 *             nx/ny  = small offsets in em (relative to font size) or px
 * ────────────────────────────────────────────────────────────────────────────
 */
const STEEZA_ANCHOR = { fx: 0.280, fy: 0.52, nx: "-0.60em", ny: "0.55em" };
const VERSE_ANCHOR = { fx: 0.620, fy: 0.52, nx: "0px", ny: "0.55em" };

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

  const heroFrameStyle = {
    "--img-ar": 1.7803,
    "--render-w": "max(100vw, calc(var(--img-ar) * 100vh))",
    "--render-h": "max(100vh, calc(100vw / var(--img-ar)))",
    "--crop-x": "calc((var(--render-w) - 100vw) / 2)",
    "--crop-y": "calc((var(--render-h) - 100vh) * 0.2)",
  } as React.CSSProperties;

  // Full uncropped photo box, expressed relative to the section. The photo
  // paints exactly inside this box (object-cover center 20%), so anything
  // placed in image-space coordinates lines up with the models 1:1.
  const photoBoxStyle = {
    left: "calc(-1 * var(--crop-x))",
    top: "calc(-1 * var(--crop-y))",
    width: "var(--render-w)",
    height: "var(--render-h)",
  } as React.CSSProperties;

  const anchorStyle = (a: { fx: number; fy: number; nx: string; ny: string }) =>
    ({
      "--fx": a.fx,
      "--fy": a.fy,
      "--nx": a.nx,
      "--ny": a.ny,
    }) as React.CSSProperties;

  return (
    <motion.section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#e8e8e8]"
      style={heroFrameStyle}
      aria-label="Hero"
      initial={{ opacity: 0 }}
      animate={playAnimations ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* ── Layer 1 (bottom): VERSE sits BEHIND the image ──
          Anchored in image space; the full-photo extent div guarantees the
          word is never clipped when the render box exceeds the viewport. */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <div className="absolute" style={photoBoxStyle}>
          <span
            className="hero-word text-[var(--red)] select-none"
            style={{ ...wordStyle, ...anchorStyle(VERSE_ANCHOR) }}
          >
            VERSE
          </span>
        </div>
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

      {/* ── Layer 3 (top): STEEZA sits IN FRONT of the image ──
          --shift-x pushes the word off the blue guy by exactly 15.7% of the
          photo's width — the same fraction of pixels the photo's render box
          moves, so the word tracks the photo crop instead of the viewport. */}
      <motion.div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ x: contentX, y: contentY }}
      >
        <div className="absolute" style={photoBoxStyle}>
          <span
            className="hero-word text-black select-none"
            style={{
              ...wordStyle,
              ...anchorStyle(STEEZA_ANCHOR),
            } as React.CSSProperties}
          >
            STEEZA
          </span>
        </div>
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
