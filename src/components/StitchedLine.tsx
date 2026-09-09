"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { createPortal } from "react-dom";

interface Point {
  x: number;
  y: number;
}

export default function StitchedLine({
  startId,
  endId,
}: {
  startId: string;
  endId: string;
}) {
  const [points, setPoints] = useState<{ start: Point; end: Point } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // We allow passing a fallback end ID since mobile vs desktop navbar might have different IDs
    const startEl = document.getElementById(startId);
    let endEl = document.getElementById(endId);
    
    // Fallback for mobile cart button if desktop is not visible
    if (endId === "navbar-cart-btn" && (!endEl || window.getComputedStyle(endEl).display === "none")) {
      endEl = document.getElementById("navbar-cart-btn-mobile");
    }

    if (!startEl || !endEl) return;

    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    // Center points of the elements
    const start = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2,
    };

    const end = {
      x: endRect.left + endRect.width / 2,
      y: endRect.top + endRect.height / 2,
    };

    setPoints({ start, end });
  }, [isClient, startId, endId]);

  useEffect(() => {
    if (points && pathRef.current) {
      const length = pathRef.current.getTotalLength();
      
      // Animate dashoffset from full length to 0 to "draw" the line
      controls.set({ strokeDashoffset: length, strokeDasharray: `4 6` });
      
      // But we can't easily animate dashoffset with dasharray seamlessly for drawing in framer-motion 
      // without some tricks.
      // Trick: Use a solid line for drawing, then fade in stitched line? 
      // Better trick: set strokeDasharray to `length length`, animate offset to 0. 
      // Since it's a stitched line, it's natively dashed.
      
      // Let's use a standard CSS animation approach via Framer Motion by animating pathLength.
      // Wait, pathLength animates a solid line.
      // To draw a dashed line, we animate a mask, or we animate strokeDashoffset on a very long dash array?
      // Since it's a "stitched line", the prompt specifies stroke-dasharray.
      // We will draw it by animating pathLength and using a custom strokeDasharray.
    }
  }, [points, controls]);

  if (!isClient || !points) return null;

  // Simple bezier curve for dynamic arc
  // Start point
  const x1 = points.start.x;
  const y1 = points.start.y;
  // End point
  const x2 = points.end.x;
  const y2 = points.end.y;
  
  // Control point (adds an arc, bending slightly upward or downward depending on position)
  const cx = (x1 + x2) / 2 - 50;
  const cy = (y1 + y2) / 2 - Math.abs(x1 - x2) * 0.2; 

  const pathData = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <svg width="100%" height="100%">
        {/* Draw the line using pathLength so the dashes appear sequentially */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="var(--sz-red, #d42b2b)"
          strokeWidth="2"
          strokeDasharray="6 6"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1, opacity: [1, 1, 0] }}
          transition={{
            pathLength: { duration: 0.8, ease: "easeOut" },
            opacity: { duration: 1.5, ease: "linear", times: [0, 0.6, 1] }
          }}
        />
      </svg>
    </div>,
    document.body
  );
}
