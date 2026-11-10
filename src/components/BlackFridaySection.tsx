"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSaleGate, SALE_END } from "@/lib/sale";
import { playButtonPress, playButtonRelease } from "@/lib/sound";
import FlyerModal from "./FlyerModal";

interface ProductPriceInfo {
  base_price: number;
  compare_at_price: number | null;
  slug: string;
}

// Kinetic flip digit matching the Drop section's countdown
function GlitchDigit({ digit, reducedMotion }: { digit: string; reducedMotion: boolean }) {
  if (reducedMotion) {
    return <span className="inline-block tabular-nums">{digit}</span>;
  }

  return (
    <div className="relative inline-block w-[1ch] text-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(4px)", scale: 1.25, rotate: (Math.random() - 0.5) * 15 }}
          transition={{ duration: 0.28, type: "spring", bounce: 0.2 }}
          className="inline-block tabular-nums"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function BlackFridaySection({ initialProduct }: { initialProduct?: ProductPriceInfo | null }) {
  const { isMounted, isSaleActive } = useSaleGate();
  const [product, setProduct] = useState<ProductPriceInfo | null>(initialProduct || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: string; h: string; m: string; s: string } | null>(null);

  // 3D tilt tracking on the flyer
  const flyerContainerRef = useRef<HTMLDivElement>(null);
  const flyerTriggerRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2347016764281";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Steezaverse, I'd like to order the Black Friday Tracksuit (20% OFF)."
  )}`;

  // Detect reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Fetch live tracksuit product price data if not provided via server prop
  useEffect(() => {
    if (!isMounted || !isSaleActive) return;

    let active = true;
    async function loadProduct() {
      try {
        const res = await fetch("/api/products/stv-tracksuit");
        if (res.ok) {
          const data = await res.json();
          if (active && data) {
            setProduct({
              base_price: Number(data.base_price),
              compare_at_price: data.compare_at_price != null ? Number(data.compare_at_price) : null,
              slug: data.slug || "stv-tracksuit",
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch tracksuit price for Black Friday:", err);
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [isMounted, isSaleActive]);

  // Countdown to SALE_END (Nov 30 23:59:59 WAT)
  useEffect(() => {
    if (!isMounted || !isSaleActive) return;

    const endTime = new Date(SALE_END).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, "0");
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");

      setTimeLeft({ d, h, m, s });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isMounted, isSaleActive]);

  // Cursor tilt calculation (max ~5deg)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !flyerContainerRef.current) return;
    const rect = flyerContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  // Date Gate: Do not render until mounted and only if sale is active
  if (!isMounted || !isSaleActive) {
    return null;
  }

  const formatPrice = (val: number) => `₦${val.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

  return (
    <section
      id="black-friday-sale"
      className="relative w-full bg-black text-white py-16 sm:py-20 md:py-28 overflow-hidden z-20 border-t border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Countdown (Mobile: First) */}
          <div className="flex flex-col items-start gap-6 sm:gap-8 order-1">
            
            {/* Eyebrow */}
            <motion.p
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-archivo font-semibold text-white/50 text-xs sm:text-sm tracking-[0.25em] uppercase"
            >
              NOV 6 – 30
            </motion.p>

            {/* Headline: BLACK FRIDAY in white, 20% OFF in red, Archivo 900 same scale */}
            <div className="flex flex-col font-archivo font-black uppercase tracking-tight leading-[0.92] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              <motion.span
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="text-white"
              >
                BLACK FRIDAY
              </motion.span>
              <motion.span
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="text-sz-red"
              >
                20% OFF
              </motion.span>
            </div>

            {/* Price Line: compare-at struck through, sale price beside it.
                If compare_at_price is empty/missing, completely hidden so it never shows wrong price. */}
            {product?.compare_at_price && product.compare_at_price > 0 && (
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex items-baseline gap-4 pt-1"
              >
                <span className="line-through text-white/40 text-lg sm:text-xl md:text-2xl font-bold font-chillax">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold font-chillax text-sz-red">
                  {formatPrice(product.base_price)}
                </span>
              </motion.div>
            )}

            {/* Countdown timer reusing Drop's kinetic digits */}
            {timeLeft && (
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col gap-2 pt-2 w-full max-w-md"
              >
                <span className="text-[10px] uppercase font-archivo font-semibold tracking-[0.2em] text-white/40">
                  Sale Ends In
                </span>
                <div
                  className="flex items-center gap-2 sm:gap-4 text-white font-black tracking-tighter"
                  style={{ fontFamily: "'Bespoke Sans', sans-serif", fontSize: "clamp(2rem, 7vw, 3.5rem)" }}
                >
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <div className="flex">
                      <GlitchDigit digit={timeLeft.d[0]} reducedMotion={reducedMotion} />
                      <GlitchDigit digit={timeLeft.d[1]} reducedMotion={reducedMotion} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-widest text-white/30 uppercase mt-1">
                      Days
                    </span>
                  </div>

                  <span className="opacity-40 self-start text-xl sm:text-2xl mt-1">:</span>

                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="flex">
                      <GlitchDigit digit={timeLeft.h[0]} reducedMotion={reducedMotion} />
                      <GlitchDigit digit={timeLeft.h[1]} reducedMotion={reducedMotion} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-widest text-white/30 uppercase mt-1">
                      Hours
                    </span>
                  </div>

                  <span className="opacity-40 self-start text-xl sm:text-2xl mt-1">:</span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="flex">
                      <GlitchDigit digit={timeLeft.m[0]} reducedMotion={reducedMotion} />
                      <GlitchDigit digit={timeLeft.m[1]} reducedMotion={reducedMotion} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-widest text-white/30 uppercase mt-1">
                      Mins
                    </span>
                  </div>

                  <span className="opacity-40 self-start text-xl sm:text-2xl mt-1">:</span>

                  {/* Seconds */}
                  <div className="flex flex-col items-center text-sz-red">
                    <div className="flex">
                      <GlitchDigit digit={timeLeft.s[0]} reducedMotion={reducedMotion} />
                      <GlitchDigit digit={timeLeft.s[1]} reducedMotion={reducedMotion} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-widest text-sz-red/50 uppercase mt-1">
                      Secs
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
              {/* Primary Red CTA */}
              <Link
                href="/product/stv-tracksuit"
                onMouseDown={playButtonPress}
                onMouseUp={playButtonRelease}
                data-cuelume-press
                className="flex items-center justify-center gap-3 bg-sz-red hover:bg-sz-red/90 text-white font-chillax font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(255,42,42,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Shop the Tracksuit</span>
                <ArrowRight size={15} />
              </Link>

              {/* Secondary Quiet WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs uppercase font-medium tracking-wider px-6 py-4 transition-colors"
              >
                <MessageCircle size={14} className="text-green-500" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Flyer with Entrance Overshoot and 3D Cursor Tilt (Mobile: Second) */}
          <div className="flex justify-center items-center order-2 w-full">
            <div
              ref={flyerContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[460px] perspective-[1000px]"
            >
              <motion.button
                ref={flyerTriggerRef}
                onClick={() => setIsModalOpen(true)}
                initial={
                  reducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: -60, rotateZ: -2 }
                }
                whileInView={
                  reducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, y: 0, rotateZ: -2 }
                }
                viewport={{ once: true, margin: "-100px" }}
                animate={
                  reducedMotion
                    ? { rotateZ: 0 }
                    : {
                        rotateX: tilt.rotateX,
                        rotateY: tilt.rotateY,
                        rotateZ: -2,
                      }
                }
                transition={{
                  y: { type: "spring", stiffness: 220, damping: 18 },
                  opacity: { duration: 0.4 },
                  rotateX: { duration: 0.15, ease: "linear" },
                  rotateY: { duration: 0.15, ease: "linear" },
                }}
                className="relative block w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.85),_0_0_40px_rgba(255,42,42,0.12)] border border-white/10 hover:border-white/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-sz-red"
                aria-label="Enlarge Steezaverse Black Friday sale flyer"
              >
                <Image
                  src="/photo_2026-11-10_13-52-33.jpg"
                  alt="Steezaverse Black Friday sale: 20% off all tracksuits, November 6 to 30"
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 420px, 460px"
                  priority={false}
                  className="object-cover rounded-2xl select-none group-hover:scale-[1.01] transition-transform duration-300"
                />

                {/* Subtle overlay hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none rounded-2xl" />
              </motion.button>
            </div>
          </div>

        </div>
      </div>

      {/* Shared Flyer Modal */}
      <FlyerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productSlug={product?.slug || "stv-tracksuit"}
        triggerRef={flyerTriggerRef}
      />
    </section>
  );
}
