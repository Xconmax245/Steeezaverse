"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const dismissed = localStorage.getItem("steezaverse_store_launch_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("steezaverse_store_launch_dismissed", "true");
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
          className="bg-white text-black overflow-hidden relative z-[200] w-full"
        >
          <div className="relative flex items-center justify-center w-full py-2.5 px-10">
            <span className="flex items-center gap-2 font-chillax font-bold uppercase tracking-widest text-[10px] md:text-[11px] whitespace-nowrap">
              <span className="animate-pulse text-red-600">●</span>
              <span>Physical Store Launch — Oct 1st – 3rd</span>
            </span>
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
