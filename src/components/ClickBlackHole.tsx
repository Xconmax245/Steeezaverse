"use client";

import { useEffect, useRef, useCallback } from "react";

interface ClickBlackHoleProps {
  dotSize?: number;
  count?: number;
  coreRadius?: number;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  decay: number;
}

export default function ClickBlackHole({
  dotSize = 3,
  count = 65,
  coreRadius = 12,
  color = "#fff",
  children,
  className = "",
}: ClickBlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.01);

    for (const p of particlesRef.current) {
      // Spiral inward
      p.radius = Math.max(coreRadius * 0.5, p.radius - p.speed * 0.4);
      p.angle += p.speed * 0.055;
      p.opacity -= p.decay;

      const x = p.x + Math.cos(p.angle) * p.radius;
      const y = p.y + Math.sin(p.angle) * p.radius;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    rafRef.current = requestAnimationFrame(render);
  }, [color, coreRadius]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        x: cx,
        y: cy,
        angle: (i / count) * Math.PI * 2,
        radius: coreRadius + Math.random() * 60,
        speed: 0.6 + Math.random() * 1.4,
        size: dotSize * (0.5 + Math.random() * 0.8),
        opacity: 0.8 + Math.random() * 0.2,
        decay: 0.008 + Math.random() * 0.012,
      }));

      particlesRef.current.push(...newParticles);
    },
    [count, coreRadius, dotSize]
  );

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ro = new ResizeObserver(() => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    });
    ro.observe(container);
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-40"
        style={{ mixBlendMode: "screen" }}
      />
      {children}
    </div>
  );
}
