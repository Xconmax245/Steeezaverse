"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSoftTick } from "@/lib/sound";
import { getDropLaunchTime } from "@/lib/constants";

interface TakeReeksModalProps {
  dropStartsAt?: string | null;
}

export default function TakeReeksModal({ dropStartsAt }: TakeReeksModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Show on every reload of the homepage until the drop is live
  useEffect(() => {
    // Only homepage, never on /checkout, /cart, /admin, etc.
    if (pathname !== "/") return;

    // Retire at launch (poster says "Dropping Soon")
    const launchMs = getDropLaunchTime(dropStartsAt);
    if (Date.now() >= launchMs) return;

    // Check prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    let delayTimer: NodeJS.Timeout | null = null;

    const showModal = () => {
      delayTimer = setTimeout(() => {
        if (typeof document !== "undefined") {
          previousFocusRef.current = document.activeElement as HTMLElement | null;
        }
        setIsOpen(true);
      }, 700);
    };

    if (typeof window !== "undefined" && (window as any).introPlayed) {
      showModal();
    } else {
      const handleIntro = () => showModal();
      window.addEventListener("introComplete", handleIntro, { once: true });
      // Fallback timer if intro was skipped without event
      const fallbackTimer = setTimeout(() => {
        if (!delayTimer) showModal();
      }, 3500);

      return () => {
        window.removeEventListener("introComplete", handleIntro);
        clearTimeout(fallbackTimer);
        if (delayTimer) clearTimeout(delayTimer);
      };
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [pathname, dropStartsAt]);

  const handleClose = useCallback(() => {
    playSoftTick();
    setIsOpen(false);

    // Return focus
    setTimeout(() => {
      previousFocusRef.current?.focus?.();
    }, 50);
  }, []);

  const handleNotifyCTA = () => {
    handleClose();
    setTimeout(() => {
      const section = document.getElementById("take-reeks");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        // Trigger notification action if available
        const notifyBtn = section.querySelector("button[data-notify-trigger]") as HTMLButtonElement | null;
        notifyBtn?.click();
      }
    }, 150);
  };

  // Keyboard navigation: Escape & Focus Trap, plus Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="take-reeks-modal-headline"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
      >
        {/* Backdrop — clickable with pointer cursor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Dialog Card — responsive max height and natural cursor */}
        <motion.div
          ref={modalRef}
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 10 }
          }
          animate={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.96, y: 10 }
          }
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[92vw] sm:max-w-md md:max-w-3xl max-h-[92dvh] overflow-y-auto bg-[#0c0c0c] rounded-2xl md:rounded-3xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95),_0_0_50px_rgba(0,85,255,0.15)] flex flex-col md:grid md:grid-cols-[1.05fr,1fr] cursor-default"
        >
          {/* Poster Column */}
          <div className="relative w-full aspect-[4/5] max-h-[38dvh] sm:max-h-[46dvh] md:max-h-none overflow-hidden bg-black flex-shrink-0">
            <Image
              src="/take-reeks-drop.jpg"
              alt="Take Reeks First Collection flyer featuring a model wearing the Take Reeks varsity jacket and cap"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover object-center"
            />

            {/* Dark gradient overlay on mobile bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent md:hidden" />

            {/* 44px Visible Close Button with dark pill backdrop */}
            <button
              ref={closeBtnRef}
              onClick={handleClose}
              aria-label="Close Take Reeks announcement"
              data-cursor="pointer"
              data-cuelume-hover="tick"
              className="absolute top-3 right-3 md:top-4 md:left-4 md:right-auto w-11 h-11 bg-black/75 hover:bg-black backdrop-blur-md rounded-full border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 z-20"
            >
              <X size={18} className="transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>

          {/* Write-up Column */}
          <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-between bg-[#0c0c0c] text-white">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-archivo font-bold uppercase tracking-[0.25em] text-blue-400">
                  FIRST COLLECTION
                </span>
              </div>

              {/* Headline */}
              <h2
                id="take-reeks-modal-headline"
                className="font-archivo font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight uppercase leading-none"
              >
                TAKE REEKS
              </h2>

              {/* Body */}
              <p className="text-xs sm:text-sm md:text-[15px] text-white/70 leading-relaxed font-sans font-normal">
                Our first collection lands Monday, November 23. Statement pieces for people who move different. Limited runs, no restocks.
              </p>

              {/* Sign-off */}
              <p className="font-zodiak italic text-xs sm:text-sm md:text-base text-white/50 pt-0.5">
                Take a ride into the Steezaverse.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-5 sm:pt-6 md:pt-8 mt-auto">
              <button
                onClick={handleNotifyCTA}
                data-cursor="pointer"
                data-cuelume-hover="tick"
                className="w-full flex items-center justify-center gap-2.5 bg-[#0055ff] hover:bg-[#0047db] active:bg-[#003bb8] text-white text-xs sm:text-sm font-archivo font-bold uppercase tracking-wider py-3.5 sm:py-4 px-6 rounded-full transition-all duration-200 shadow-[0_10px_25px_rgba(0,85,255,0.35)] hover:shadow-[0_12px_30px_rgba(0,85,255,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Get notified</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
