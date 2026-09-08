"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "steezaverse_muted";

export default function MuteToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "1") {
      setMuted(true);
      import("cuelume").then(({ setEnabled }) => setEnabled(false)).catch(() => {});
    }
  }, []);

  const toggle = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    try {
      const { setEnabled, play } = await import("cuelume");
      setEnabled(!next);
      if (!next) play("toggle"); // audible confirmation when unmuting
    } catch (_) {}
  }, [muted]);

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      title={muted ? "Unmute sounds" : "Mute sounds"}
      className="relative text-white/50 hover:text-white transition-colors duration-200 flex items-center justify-center"
      data-cuelume-hover="tick"
      style={{ width: 18, height: 18 }}
    >
      {muted ? <MutedIcon /> : <UnmutedIcon />}
    </button>
  );
}

function UnmutedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
