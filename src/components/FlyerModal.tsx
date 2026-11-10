"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, MessageCircle } from "lucide-react";
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

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2347016764281";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Steezaverse, I'm ordering the Black Friday Tracksuit (20% OFF)."
  )}`;

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
          className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalContentRef}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96 }
            }
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm sm:max-w-md max-h-[92vh] flex flex-col items-center bg-[#0d0d0d] rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Close Button — 44px min touch target, safe area compliant */}
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              aria-label="Close flyer"
              className="absolute top-3 right-3 z-30 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-sz-red"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* Flyer Image Container (max 72vh on desktop, responsive) */}
            <div className="relative w-full overflow-y-auto overflow-x-hidden flex flex-col items-center p-3 sm:p-4 pb-0">
              <div className="relative w-full max-h-[68vh] sm:max-h-[72vh] aspect-[4/5] rounded-xl overflow-hidden shadow-inner">
                <Image
                  src="/photo_2026-11-10_13-52-33.jpg"
                  alt="Steezaverse Black Friday sale: 20% off all tracksuits, November 6 to 30"
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, 420px"
                  className="object-cover rounded-xl select-none"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="w-full p-4 sm:p-5 pt-3 flex flex-col gap-2.5 bg-gradient-to-t from-black via-black/90 to-transparent">
              <Link
                href={`/product/${productSlug}`}
                onClick={handleClose}
                onMouseDown={playButtonPress}
                onMouseUp={playButtonRelease}
                className="w-full flex items-center justify-center gap-2 bg-sz-red hover:bg-sz-red/90 text-white font-chillax font-bold text-xs uppercase tracking-widest py-3.5 rounded-full transition-all shadow-[0_0_25px_rgba(255,42,42,0.35)]"
              >
                <span>Shop the Tracksuit</span>
                <ArrowRight size={14} />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-white/50 hover:text-white/90 py-1 transition-colors"
              >
                <MessageCircle size={13} className="text-green-500" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
