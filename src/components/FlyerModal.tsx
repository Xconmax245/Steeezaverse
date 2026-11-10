"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSoftTick, playButtonPress, playButtonRelease } from "@/lib/sound";

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export default function FlyerModal({
  isOpen,
  onClose,
  productSlug = "stv-tracksuit",
  triggerRef,
}: FlyerModalProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mq: MediaQueryList | null = null;
    let handler: ((e: MediaQueryListEvent) => void) | null = null;

    try {
      mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handler);
      } else if (typeof (mq as any).addListener === "function") {
        (mq as any).addListener(handler);
      }
    } catch (_) {}

    return () => {
      if (mq && handler) {
        try {
          if (typeof mq.removeEventListener === "function") {
            mq.removeEventListener("change", handler);
          } else if (typeof (mq as any).removeListener === "function") {
            (mq as any).removeListener(handler);
          }
        } catch (_) {}
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    playSoftTick();
    onClose();
    // Return focus to triggering element
    if (triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [onClose, triggerRef]);

  // Keyboard navigation: Esc to close & Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus the close button inside modal
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalContentRef.current) return;
        const focusableElements = modalContentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Steezaverse Black Friday sale flyer"
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 pt-14 pb-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalContentRef}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 15 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 10 }
            }
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[360px] sm:max-w-[400px] flex flex-col bg-[#070707] rounded-3xl border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),_0_0_50px_rgba(255,42,42,0.15)]"
          >
            {/* Close Button — positioned cleanly above the card so it never covers the flyer text */}
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              aria-label="Close flyer"
              className="absolute -top-11 right-0 flex items-center gap-2 text-white/70 hover:text-white transition-colors group focus:outline-none focus:ring-1 focus:ring-white/40"
            >
              <span className="text-[10px] font-chillax uppercase tracking-[0.2em] font-semibold text-white/60 group-hover:text-white transition-colors">
                Close
              </span>
              <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-black border border-white/20 flex items-center justify-center transition-all">
                <X size={15} strokeWidth={2.5} />
              </span>
            </button>

            {/* Flyer Image Container — flush with rounded top */}
            <div className="relative w-full aspect-[4/5] rounded-t-3xl overflow-hidden bg-black">
              <Image
                src="/photo_2026-11-10_13-52-33.jpg"
                alt="Steezaverse Black Friday sale: 20% off all tracksuits, November 6 to 30"
                fill
                priority
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-cover select-none"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="w-full p-4 sm:p-5 bg-gradient-to-b from-[#070707] to-black border-t border-white/10 rounded-b-3xl flex flex-col items-center gap-2.5">
              <Link
                href={`/product/${productSlug}`}
                onClick={handleClose}
                onMouseDown={playButtonPress}
                onMouseUp={playButtonRelease}
                data-cuelume-press
                className="group w-full flex items-center justify-center gap-2.5 bg-sz-red hover:bg-[#ff3838] text-white font-chillax font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,42,42,0.35)] hover:shadow-[0_0_45px_rgba(255,42,42,0.55)] hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Shop the Tracksuit</span>
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <p className="text-center text-[10px] uppercase font-sans tracking-[0.25em] text-white/40 pt-0.5">
                Limited run · While stocks last
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
