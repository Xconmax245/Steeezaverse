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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white text-black overflow-hidden relative z-50"
        >
          <div className="flex items-center justify-center px-10 py-2.5 text-xs font-bold uppercase tracking-widest font-chillax text-center relative">
            <span className="flex items-center gap-2">
              <span className="animate-pulse">🔴</span>
              Physical Store Launch: October 1st - 3rd
            </span>
            <button 
              onClick={handleClose}
              className="absolute right-4 p-1 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
