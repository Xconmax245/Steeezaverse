"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSaleGate } from "@/lib/sale";
import FlyerModal from "./FlyerModal";

const POPUP_STORAGE_KEY = "stz_bf_popup_suppressed_until";
const SUPPRESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function BlackFridayPopup() {
  const { isMounted, isSaleActive } = useSaleGate();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Strictly homepage only — never on /checkout, /cart, /admin, etc.
    if (!isMounted || !isSaleActive || pathname !== "/") {
      return;
    }

    // Check 24-hour localStorage suppression
    try {
      const suppressedUntil = localStorage.getItem(POPUP_STORAGE_KEY);
      if (suppressedUntil && Date.now() < Number(suppressedUntil)) {
        return;
      }
    } catch (_) {
      // LocalStorage unavailable/blocked
    }

    let delayTimer: NodeJS.Timeout | null = null;

    const schedulePopup = () => {
      // Show ~3s after intro splash completes, never over it
      delayTimer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    };

    // If intro splash already finished before mount
    if (typeof window !== "undefined" && (window as any).introPlayed) {
      schedulePopup();
    } else {
      // Wait for the intro splash to signal completion
      const onIntroComplete = () => {
        schedulePopup();
      };

      window.addEventListener("introComplete", onIntroComplete, { once: true });

      // Fallback timer: if splash was skipped without event, trigger after reasonable delay
      const fallbackTimer = setTimeout(() => {
        if (!delayTimer) {
          schedulePopup();
        }
      }, 6500);

      return () => {
        window.removeEventListener("introComplete", onIntroComplete);
        clearTimeout(fallbackTimer);
        if (delayTimer) clearTimeout(delayTimer);
      };
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [isMounted, isSaleActive, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      // Suppress for 24h once dismissed
      localStorage.setItem(
        POPUP_STORAGE_KEY,
        (Date.now() + SUPPRESSION_DURATION_MS).toString()
      );
    } catch (_) {}
  };

  if (!isMounted || !isSaleActive || pathname !== "/") {
    return <div id="black-friday-popup-slot" aria-hidden="true" />;
  }

  return (
    <div id="black-friday-popup-slot" aria-hidden={!isOpen}>
      <FlyerModal
        isOpen={isOpen}
        onClose={handleClose}
        productSlug="stv-tracksuit"
      />
    </div>
  );
}
