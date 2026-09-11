"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * CuelumeProvider — mounts once at the root.
 * Calls bind() to wire all data-cuelume-* attributes site-wide,
 * and sets a global volume of 0.6 — audible but not intrusive.
 */
export default function CuelumeProvider() {
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { bind, setVolume, play } = await import("cuelume");
        setVolume(0.6);
        
        // Bind existing data-cuelume attributes
        bind();

        // Global fallback for any button or link to ensure they ALWAYS make a sound
        const handleGlobalClick = (e: MouseEvent) => {
          const target = (e.target as Element).closest('button, a');
          if (target) {
            // Ignore disabled buttons
            if ((target as HTMLButtonElement).disabled) return;
            
            // Only fire fallback if it doesn't already have explicit press bindings
            if (!target.hasAttribute('data-cuelume-press') && !target.hasAttribute('data-cuelume-click')) {
              try {
                // Safely attempt to play a generic sound
                if (play) play('tick');
              } catch (err) {}
            }
          }
        };

        document.addEventListener('click', handleGlobalClick);
        cleanup = () => {
          document.removeEventListener('click', handleGlobalClick);
        };
      } catch (err) {
        console.warn("[cuelume] failed to initialise:", err);
      }
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [pathname]);

  return null;
}
