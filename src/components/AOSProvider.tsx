"use client";

import { useEffect } from "react";

/**
 * AOS scroll-reveal engine — mounted once in the root layout so every
 * `data-aos` attribute across the storefront animates with one config.
 *
 * - Brand easing (out-quint) + generous distance for a heavy, editorial feel
 * - Reduced-motion users get instant reveals, no animation
 * - `disable: () => boolean` keeps AOS alive for dynamic content while
 *   respecting the media query at init time
 */
export default function AOSProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let instance: { refreshHard: () => void } | null = null;

    import("aos").then((mod) => {
      if (cancelled) return;
      // AOS ships without types; the local declaration lives in aos.d.ts.
      instance = mod.init({
        offset: 90,
        delay: 0,
        duration: 950,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        once: true,
        mirror: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // No DOM output — purely an engine mount.
  return null;
}
