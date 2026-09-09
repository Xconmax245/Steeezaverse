"use client";

import { motion } from "framer-motion";

/**
 * Route-transition template — remounts on every pathname change, so each
 * storefront page enters with a soft, heavy fade. Cheap (compositor-only
 * properties), respects reduced-motion via framer's built-in handling.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
