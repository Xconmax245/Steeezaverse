'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'sz_visitor_id';
const TRACKED_PREFIX = 'sz_viewed_';

// Lightweight visitor tracking: records one page view per session per public
// path via a fire-and-forget beacon. The visitor id is a random UUID kept in
// localStorage so repeat visits count as the same visitor across sessions.
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only track public storefront pages, never admin/api/static assets.
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_')) {
      return;
    }

    // Once per session per path (throttles multi-fire on back/forward).
    const sessionKey = `${TRACKED_PREFIX}${pathname}`;
    if (sessionStorage.getItem(sessionKey)) return;

    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    sessionStorage.setItem(sessionKey, '1');

    try {
      const payload = JSON.stringify({ path: pathname, visitor_id: visitorId });
      navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
    } catch {
      // Tracking must never break the page — fire-and-forget.
    }
  }, [pathname]);

  return null;
}