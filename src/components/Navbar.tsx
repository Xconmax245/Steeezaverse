"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ShoppingCartIcon from './ShoppingCartIcon';
import { usePathname } from 'next/navigation';
import MuteToggle from './MuteToggle';
import { useCart } from './CartContext';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'DROPS', href: '/drops' },
  { label: 'ABOUT', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setIsOpen } = useCart();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setIsDarkBg(pathname !== '/' || window.scrollY > window.innerHeight - 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Derived styles based on scroll
  const logoHeight = scrolled ? 54 : 64;
  const logoBgColor = scrolled ? 'rgba(20, 8, 8, 0.50)' : 'rgba(20, 8, 8, 0.35)';
  const borderColor = scrolled ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.10)';
  
  // Mobile derived styles
  const mobileHeight = scrolled ? 50 : 58;

  // Stagger animation for entry
  const pieceVariants: any = {
    hidden: { opacity: 0, y: -12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <>
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[680px] pointer-events-none flex items-center justify-center">
        
        {/* ─── DESKTOP "WRISTBAND" (hidden on mobile) ─── */}
        <motion.nav
          custom={0}
          initial="hidden"
          animate="visible"
          variants={pieceVariants}
          className="hidden md:flex pointer-events-auto items-center justify-between px-8 relative z-10 w-full"
          style={{
            height: logoHeight,
            background: logoBgColor,
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: `1px solid ${borderColor}`,
            borderRadius: '100px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.20)',
            transition: 'height 0.4s ease, background 0.4s ease, border-color 0.4s ease',
          }}
        >
          {/* Left - Navigation */}
          <div className="flex-1 flex items-center justify-start gap-5">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <DesktopNavLink key={link.label} href={link.href} label={link.label} active={pathname === link.href} />
            ))}
          </div>

          {/* Center Logo */}
          <Link href="/" className="block flex-shrink-0" aria-label="Steezaverse Home">
            <div className="relative w-[75px] h-[38px] flex items-center justify-center">
              <Image
                src="/STV_mini_logo-removebg-preview.png"
                alt="STEEZAVERSE"
                fill
                priority
                sizes="(max-width: 768px) 80px, 75px"
                className="object-contain transition-all duration-500"
                style={{ filter: isDarkBg ? "brightness(2)" : "invert(1) brightness(2)" }}
              />
            </div>
          </Link>

          {/* Right - Utility */}
          <div className="flex-1 flex items-center justify-end gap-6">
            {NAV_LINKS.slice(2, 4).map((link) => (
              <DesktopNavLink key={link.label} href={link.href} label={link.label} active={pathname === link.href} />
            ))}
            
            <MuteToggle />
            <button
              id="navbar-cart-btn"
              onClick={() => setIsOpen(true)}
              className="relative text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Cart"
              data-cursor="navbar"
              data-cuelume-press
              data-cuelume-release
            >
              <ShoppingCartIcon size={15} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-sz-red text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              whileHover="hover"
              className="text-white/70 hover:text-white transition-colors duration-200 p-1 flex items-center justify-center"
              aria-label="Open Menu"
              data-cursor="navbar"
              data-cuelume-hover="tick"
            >
              <GridIcon />
            </motion.button>
          </div>
        </motion.nav>

        {/* ─── MOBILE SINGLE PILL (hidden on desktop) ─── */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={pieceVariants}
          className="md:hidden pointer-events-auto w-[calc(100%-40px)] max-w-[380px] flex items-center justify-between px-5"
          style={{
            height: mobileHeight,
            background: logoBgColor,
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: `1px solid ${borderColor}`,
            borderRadius: '100px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.20)',
            transition: 'height 0.4s ease, background 0.4s ease, border-color 0.4s ease',
          }}
        >
          <Link href="/" className="block">
            <div className="relative w-[70px] h-[30px]">
              <Image
                src="/STV_mini_logo-removebg-preview.png"
                alt="STEEZAVERSE"
                fill
                priority
                sizes="(max-width: 768px) 80px, 75px"
                className="object-contain transition-all duration-500"
                style={{ filter: isDarkBg ? "brightness(2)" : "invert(1) brightness(2)" }}
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <MuteToggle />
            <button
              id="navbar-cart-btn-mobile"
              onClick={() => setIsOpen(true)}
              className="relative text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Cart"
              data-cuelume-press
              data-cuelume-release
            >
              <ShoppingCartIcon size={16} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-sz-red text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <motion.button
              onClick={() => setIsMenuOpen(true)}
              whileHover="hover"
              className="text-white/70 hover:text-white transition-colors duration-200 flex items-center justify-center"
              aria-label="Open Menu"
              data-cuelume-hover="tick"
            >
              <GridIcon mobile />
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* ─── FULL-SCREEN MENU OVERLAY ─── */}
      <div id="menu-portal-root">
        <AnimatePresence>
          {isMenuOpen && (
            <MenuOverlay key="menu-overlay" onClose={() => setIsMenuOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   DESKTOP NAV LINK
────────────────────────────────────────────────────────── */
function DesktopNavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} className="relative group flex items-center justify-center" data-cursor="navbar" data-cuelume-hover="tick">
      <span 
        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors duration-200"
        style={{ fontFamily: "'Chillax', sans-serif", color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.65)' }}
      >
        {label}
      </span>
      {/* Hover/Active Dot - Hidden for Home link */}
      {href !== '/' && (
        <>
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ff2a2a] rounded-full transition-all duration-300 ease-out"
            style={{ opacity: active ? 1 : 0, transform: active ? 'scale(1)' : 'scale(0)' }} 
          />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#ff2a2a] rounded-full opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out" />
        </>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────
   GRID ICON COMPONENT
────────────────────────────────────────────────────────── */
function GridIcon({ mobile = false }: { mobile?: boolean }) {
  const size = mobile ? 10 : 10;
  const square = mobile ? 4 : 4;
  const gap = mobile ? 2 : 2;
  const offset = square + gap;

  // Hover scatter variant
  const scatterVariants: any = {
    hover: (custom: { x: number; y: number }) => ({
      x: custom.x,
      y: custom.y,
      transition: { type: 'spring', stiffness: 400, damping: 20 },
    }),
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="currentColor"
      className="overflow-visible"
    >
      <motion.rect x="0" y="0" width={square} height={square} custom={{ x: -2, y: -2 }} variants={scatterVariants} />
      <motion.rect x={offset} y="0" width={square} height={square} custom={{ x: 2, y: -2 }} variants={scatterVariants} />
      <motion.rect x="0" y={offset} width={square} height={square} custom={{ x: -2, y: 2 }} variants={scatterVariants} />
      <motion.rect x={offset} y={offset} width={square} height={square} custom={{ x: 2, y: 2 }} variants={scatterVariants} />
    </motion.svg>
  );
}

/* ─────────────────────────────────────────────────────────
   MENU OVERLAY COMPONENT
────────────────────────────────────────────────────────── */
const MenuOverlay = React.forwardRef<HTMLDivElement, { onClose: () => void }>(({ onClose }, ref) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ x: '90%', y: '40px' });

  useEffect(() => {
    const updateOrigin = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const pillWidth = Math.min(window.innerWidth - 40, 380);
        const rightEdge = window.innerWidth / 2 + pillWidth / 2;
        const xCoord = rightEdge - 30; // ~30px from right edge of the pill
        setOrigin({ x: `${xCoord}px`, y: `${20 + 25}px` });
      } else {
        const xCoord = window.innerWidth / 2 + 340 - 45; // 340px is half of 680px
        setOrigin({ x: `${xCoord}px`, y: `${20 + 26}px` });
      }
    };

    updateOrigin();
    window.addEventListener('resize', updateOrigin);
    return () => window.removeEventListener('resize', updateOrigin);
  }, []);

  const overlayVariants: any = {
    hidden: { clipPath: 'circle(0px at var(--click-origin-x, 90%) var(--click-origin-y, 40px))' },
    visible: {
      clipPath: 'circle(250vmax at var(--click-origin-x, 90%) var(--click-origin-y, 40px))',
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      clipPath: 'circle(0px at var(--click-origin-x, 90%) var(--click-origin-y, 40px))',
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
  };

  const linkVariants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.07,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <motion.div
      ref={ref}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        '--click-origin-x': origin.x,
        '--click-origin-y': origin.y,
      } as any}
      className="fixed inset-0 z-[200] bg-[#0a0303] flex flex-col pointer-events-auto overflow-hidden"
    >
      {/* ── OVERLAY TOP BAR (Mirroring Navbar architecture but transparent) ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[380px] flex md:hidden items-center justify-between px-5 h-[50px] z-20">
         <div className="relative w-[70px] h-[30px]">
            <Image 
              src="/STV_mini_logo-removebg-preview.png" 
              alt="STEEZAVERSE" 
              fill 
              sizes="80px" 
              className="object-contain opacity-90" 
              style={{ filter: "brightness(2)" }} 
            />
         </div>
         <motion.button onClick={onClose} whileHover={{ rotate: 90 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-white/70 hover:text-white p-2">
           <X size={20} strokeWidth={1.5} />
         </motion.button>
      </div>

      <div className="hidden md:flex items-center justify-center absolute top-5 left-1/2 -translate-x-1/2 w-full max-w-[680px] h-[52px] z-20">
        <div className="w-[220px] h-[44px]" />
        
        <div className="w-[80px] h-[52px] flex items-center justify-center">
          <div className="relative w-[75px] h-[38px] opacity-90">
            <Image 
              src="/STV_mini_logo-removebg-preview.png" 
              alt="STEEZAVERSE" 
              fill 
              sizes="75px" 
              className="object-contain" 
              style={{ filter: "brightness(2)" }}
            />
          </div>
        </div>

        <div className="w-[220px] h-[44px] flex justify-end items-center px-5">
           <motion.button onClick={onClose} whileHover={{ rotate: 90 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-white/70 hover:text-white">
             <X size={20} strokeWidth={1.5} />
           </motion.button>
        </div>
      </div>

      {/* ── MAIN MENU CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-[1200px] w-full mx-auto px-8 md:px-16 items-center justify-center h-full">
        
        {/* Full Width Column - Primary Links (Secondary info removed) */}
        <div className="w-full flex flex-col gap-6 items-center text-center mt-20 md:mt-0">
          {NAV_LINKS.map((link, i) => {
            const isHovered = hoveredIndex === i;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <motion.div custom={i} variants={linkVariants} initial="hidden" animate="visible" key={link.label}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group block relative"
                >
                  <span 
                    className="block transition-all duration-500 ease-out"
                    style={{ 
                      fontFamily: "'Chillax', sans-serif",
                      fontSize: 'clamp(4rem, 10vw, 8rem)', 
                      lineHeight: 0.85, 
                      letterSpacing: '-0.02em',
                      color: isAnyHovered ? (isHovered ? '#fff' : 'transparent') : 'rgba(255,255,255,0.8)',
                      WebkitTextStroke: isAnyHovered && !isHovered ? '1px rgba(255,255,255,0.2)' : '0px',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});
