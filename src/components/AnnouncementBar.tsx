"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSaleGate } from "@/lib/sale";

export default function AnnouncementBar() {
  const { isMounted, isSaleActive } = useSaleGate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!isMounted) return;

    let media: MediaQueryList | null = null;
    let listener: ((e: MediaQueryListEvent) => void) | null = null;

    try {
      media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(media.matches);
      listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", listener);
      } else if (typeof (media as any).addListener === "function") {
        (media as any).addListener(listener);
      }
    } catch (_) {}

    try {
      const storageKey = isSaleActive
        ? "steezaverse_bf_announcement_dismissed"
        : "steezaverse_store_launch_dismissed";
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch (_) {
      setIsVisible(true);
    }

    return () => {
      if (media && listener) {
        try {
          if (typeof media.removeEventListener === "function") {
            media.removeEventListener("change", listener);
          } else if (typeof (media as any).removeListener === "function") {
            (media as any).removeListener(listener);
          }
        } catch (_) {}
      }
    };
  }, [isMounted, isSaleActive]);

  // Rotate messages every 4s during active sale, pausing when hovered or reduced motion
  useEffect(() => {
    if (!isSaleActive || reducedMotion || isHovered || !isVisible) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev === 0 ? 1 : 0));
    }, 4000);

    return () => clearInterval(timer);
  }, [isSaleActive, reducedMotion, isHovered, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    try {
      const storageKey = isSaleActive
        ? "steezaverse_bf_announcement_dismissed"
        : "steezaverse_store_launch_dismissed";
      localStorage.setItem(storageKey, "true");
    } catch (_) {}
  };

  if (!isMounted) return null;

  const messages = [
    {
      id: "store",
      content: (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-sz-red animate-pulse" />
          <span>Physical Store is Now Open</span>
        </span>
      ),
      href: "/#store-location",
    },
    {
      id: "black-friday",
      content: (
        <span className="flex items-center gap-2 whitespace-nowrap text-sz-red font-bold">
          <span>BLACK FRIDAY</span>
          <span className="text-black/40">·</span>
          <span>20% OFF TRACKSUITS</span>
          <span className="text-black/40">·</span>
          <span className="text-black">ENDS NOV 30 →</span>
        </span>
      ),
      href: "/product/stv-tracksuit",
    },
  ];

  const activeMessage =
    (isSaleActive && !reducedMotion
      ? messages[currentIdx]
      : isSaleActive
      ? messages[1]
      : messages[0]) || messages[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="announcement-bar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white text-black overflow-hidden relative z-[200] w-full border-b border-black/5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative flex items-center justify-center w-full py-2.5 px-10 min-h-[38px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMessage.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -2 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] text-center"
              >
                <Link
                  href={activeMessage.href}
                  className="hover:opacity-80 transition-opacity flex items-center justify-center"
                >
                  {activeMessage.content}
                </Link>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleClose}
              className="absolute right-3 p-1.5 opacity-50 hover:opacity-100 transition-opacity rounded-full hover:bg-black/5 flex-shrink-0"
              aria-label="Close notification"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
