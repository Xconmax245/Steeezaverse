"use client";

import { useState, useEffect } from "react";

export const SALE_START = "2026-11-06T00:00:00+01:00";
export const SALE_END = "2026-11-30T23:59:59+01:00";

/**
 * Checks whether the Black Friday sale window is active.
 *
 * Supports QA testing override via NEXT_PUBLIC_SALE_NOW:
 * - "true" | "1" | "active" -> forces sale active
 * - "false" | "0" | "inactive" -> forces sale inactive
 * - ISO date string (e.g. "2026-11-01T12:00:00+01:00") -> evaluates as if current time is that date
 */
export function isSaleActive(currentTime?: number): boolean {
  if (typeof window === "undefined" && currentTime === undefined) {
    return false;
  }

  const override = process.env.NEXT_PUBLIC_SALE_NOW?.trim().toLowerCase();
  if (override === "true" || override === "1" || override === "active") {
    return true;
  }
  if (override === "false" || override === "0" || override === "inactive") {
    return false;
  }

  let nowMs = currentTime ?? Date.now();
  if (override) {
    const parsed = new Date(override).getTime();
    if (!isNaN(parsed)) {
      nowMs = parsed;
    }
  }

  const startMs = new Date(SALE_START).getTime();
  const endMs = new Date(SALE_END).getTime();

  return nowMs >= startMs && nowMs <= endMs;
}

/**
 * React hook for components governed by the date gate.
 * Strictly waits until client-side mount before returning `isSaleActive = true`,
 * preventing any SSR or cached HTML flash.
 */
export function useSaleGate() {
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsActive(isSaleActive());

    // Evaluate periodically so midnight rollover transitions live
    const timer = setInterval(() => {
      setIsActive(isSaleActive());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return { isMounted, isSaleActive: isMounted && isActive };
}
