"use client";

import { useEffect } from "react";

/**
 * CuelumeProvider — mounts once at the root.
 * Calls bind() to wire all data-cuelume-* attributes site-wide,
 * and sets a global volume of 0.6 — audible but not intrusive.
 */
export default function CuelumeProvider() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { bind, setVolume } = await import("cuelume");
        setVolume(0.6);
        bind();
      } catch (err) {
        console.warn("[cuelume] failed to initialise:", err);
      }
    })();

    return cleanup;
  }, []);

  return null;
}
