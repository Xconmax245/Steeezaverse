"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getDropLaunchTime } from "@/lib/constants";

interface AnnouncementBarProps {
  dropStartsAt?: string | null;
}

export default function AnnouncementBar({ dropStartsAt }: AnnouncementBarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const dismissed = localStorage.getItem("steezaverse_store_launch_dismissed");
      if (!dismissed) setIsVisible(true);
    } catch (_) {
      setIsVisible(true);
    }

    const checkLive = () => {
      const launchMs = getDropLaunchTime(dropStartsAt);
      setIsLive(Date.now() >= launchMs);
    };

    checkLive();
    const interval = setInterval(checkLive, 10000);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    return () => clearInterval(interval);
  }, [dropStartsAt]);

  // Rotate messages every ~4s when upcoming and not hovered
  useEffect(() => {
    if (!isMounted || isLive || reducedMotion || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMounted, isLive, reducedMotion, isHovered]);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("steezaverse_store_launch_dismissed", "true");
    } catch (_) {}
  };

  const handleTakeReeksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("take-reeks");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="announcement-bar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-white text-black overflow-hidden relative z-[200] w-full border-b border-black/5"
        >
          <div className="relative flex items-center justify-center w-full py-2.5 px-10 min-h-[38px]">
            {isLive ? (
              // Live Drop State
              <Link
                href="/shop"
                className="hover:opacity-85 transition-opacity"
              >
                <span className="font-chillax font-extrabold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center gap-2 whitespace-nowrap text-sz-red">
                  <span className="inline-block w-2 h-2 rounded-full bg-sz-red animate-ping" />
                  <span>TAKE REEKS IS LIVE → SHOP NOW</span>
                </span>
              </Link>
            ) : reducedMotion ? (
              // Reduced motion: static text
              <Link
                href="/#take-reeks"
                onClick={handleTakeReeksClick}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center gap-2 whitespace-nowrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>TAKE REEKS · FIRST COLLECTION DROPS MON, NOV 23 →</span>
                </span>
              </Link>
            ) : (
              // Standard animated rotation
              <div className="relative h-5 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeIdx === 0 ? (
                    <motion.div
                      key="store"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    >
                      <Link
                        href="/#store-location"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <span className="font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center gap-2 whitespace-nowrap">
                          <span className="inline-block w-2 h-2 rounded-full bg-sz-red animate-pulse" />
                          <span>Physical Store is Now Open</span>
                        </span>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="drop"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    >
                      <Link
                        href="/#take-reeks"
                        onClick={handleTakeReeksClick}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <span className="font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center gap-2 whitespace-nowrap text-black">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          <span>TAKE REEKS · FIRST COLLECTION DROPS MON, NOV 23 →</span>
                        </span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
