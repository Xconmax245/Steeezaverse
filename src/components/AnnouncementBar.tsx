"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AnnouncementBar() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const dismissed = localStorage.getItem("steezaverse_store_launch_dismissed");
      if (!dismissed) setIsVisible(true);
    } catch (_) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("steezaverse_store_launch_dismissed", "true");
    } catch (_) {}
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
          className="bg-white text-black overflow-hidden relative z-[200] w-full border-b border-black/5"
        >
          <div className="relative flex items-center justify-center w-full py-2.5 px-10 min-h-[38px]">
            <Link
              href="/#store-location"
              className="hover:opacity-80 transition-opacity"
            >
              <span className="font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] flex items-center gap-2 whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full bg-sz-red animate-pulse" />
                <span>Physical Store is Now Open</span>
              </span>
            </Link>

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
