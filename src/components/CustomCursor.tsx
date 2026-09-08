"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  // The ring springs behind the true pointer — soft fluid lag
  const springConfig = { damping: 24, stiffness: 260, mass: 0.7 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const [ringSize, setRingSize] = useState(32); // idle size — visible but not intrusive
  const [visible, setVisible]   = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    setVisible(true);

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;

      // Expand for explicit data-cursor attributes
      const cursorEl = el.closest("[data-cursor]") as HTMLElement | null;
      if (cursorEl?.dataset?.cursor) {
        setRingSize(56);
        return;
      }

      // Interactive element — expand ring slightly
      const isInteractive =
        el.tagName === "A" ||
        el.tagName === "BUTTON" ||
        !!el.closest("a") ||
        !!el.closest("button");

      if (isInteractive) {
        setRingSize(50);
      } else {
        setRingSize(32);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [cursorX, cursorY]);

  if (!visible) return null;

  return (
    <>
      {/* True-position dot — instant, no lag */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          width: 5,
          height: 5,
          backgroundColor: "var(--red)",
        }}
      />

      {/* Difference-blend ring — springs behind, inverts colours underneath */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: "#ffffff",
          mixBlendMode: "difference",
        }}
        animate={{ width: ringSize, height: ringSize }}
        transition={{ type: "spring", damping: 22, stiffness: 260, mass: 0.5 }}
      />
    </>
  );
}
