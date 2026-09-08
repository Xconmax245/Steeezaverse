"use client";

import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  points: { angle: number; r: number; dr: number; speed: number }[];
  hue: number; // slight hue variation around red
  opacity: number;
}

function createBlob(w: number, h: number): Blob {
  const pointCount = 7 + Math.floor(Math.random() * 4);
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: 80 + Math.random() * 160,
    hue: 0 + (Math.random() - 0.5) * 22, // reds: -11 to +11 deg
    opacity: 0.18 + Math.random() * 0.14,
    points: Array.from({ length: pointCount }, (_, i) => ({
      angle: (i / pointCount) * Math.PI * 2,
      r: 0.7 + Math.random() * 0.3,
      dr: (Math.random() - 0.5) * 0.006,
      speed: 0.004 + Math.random() * 0.006,
    })),
  };
}

function drawBlob(ctx: CanvasRenderingContext2D, b: Blob, t: number) {
  const pts = b.points.map((p) => {
    const r = b.radius * (p.r + 0.15 * Math.sin(t * p.speed + p.angle));
    return {
      x: b.x + Math.cos(p.angle + t * 0.0015) * r,
      y: b.y + Math.sin(p.angle + t * 0.0015) * r,
    };
  });

  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const cpx = (curr.x + next.x) / 2;
    const cpy = (curr.y + next.y) / 2;
    if (i === 0) ctx.moveTo(cpx, cpy);
    else ctx.quadraticCurveTo(curr.x, curr.y, cpx, cpy);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 1.2);
  grad.addColorStop(0, `hsla(${b.hue}, 90%, 30%, ${b.opacity})`);
  grad.addColorStop(1, `hsla(${b.hue}, 80%, 15%, 0)`);
  ctx.fillStyle = grad;
  ctx.fill();
}

export default function HeroBlobs({ count = 7 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef  = useRef<Blob[]>([]);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef<number>(0);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Re-seed blobs on resize
      if (blobsRef.current.length === 0) {
        blobsRef.current = Array.from({ length: count }, () =>
          createBlob(canvas.width, canvas.height)
        );
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };

    canvas.parentElement?.addEventListener("mousemove", onMove as EventListener);
    canvas.parentElement?.addEventListener("touchmove", onMove as EventListener, { passive: true });

    const tick = () => {
      tRef.current += 1;
      const t  = tRef.current;
      const w  = canvas.width;
      const h  = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      for (const b of blobsRef.current) {
        // Mouse repulsion
        const dx   = b.x - mx;
        const dy   = b.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const interactRadius = 180;

        if (dist < interactRadius && dist > 0) {
          const force = ((interactRadius - dist) / interactRadius) * 0.8;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }

        // Drift + dampen velocity
        b.vx *= 0.97;
        b.vy *= 0.97;

        // Add gentle Brownian noise
        b.vx += (Math.random() - 0.5) * 0.06;
        b.vy += (Math.random() - 0.5) * 0.06;

        // Clamp speed
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > 1.8) {
          b.vx = (b.vx / speed) * 1.8;
          b.vy = (b.vy / speed) * 1.8;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Soft boundary bounce
        const pad = b.radius * 0.4;
        if (b.x < -pad) b.vx += 0.3;
        if (b.x > w + pad) b.vx -= 0.3;
        if (b.y < -pad) b.vy += 0.3;
        if (b.y > h + pad) b.vy -= 0.3;

        // Morph blob points
        for (const p of b.points) {
          p.r = Math.max(0.5, Math.min(1.0, p.r + p.dr));
          if (p.r >= 1.0 || p.r <= 0.5) p.dr *= -1;
        }

        drawBlob(ctx, b, t);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.parentElement?.removeEventListener("mousemove", onMove as EventListener);
      canvas.parentElement?.removeEventListener("touchmove", onMove as EventListener);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
