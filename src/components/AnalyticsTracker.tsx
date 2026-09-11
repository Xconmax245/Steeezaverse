'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TRACKED_PREFIX = 'sz_session_';

// Lightweight visit tracking: hits the analytics endpoint once per session.
// The backend enforces auth and sets a cookie to prevent multiple increments.
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track public storefront pages, never admin/api/static assets.
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_')) {
      return;
    }

    // Client-side debounce to prevent multi-fire on rapid navigation
    const sessionKey = `${TRACKED_PREFIX}tracked`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');

    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {
        // Silently ignore fetch errors
      });
    } catch {
      // Tracking must never break the page — fire-and-forget.
    }
  }, [pathname]);

  return null;
}