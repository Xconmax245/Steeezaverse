"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    // Simulate API call for newsletter signup
    setTimeout(() => {
      if (email.includes("@")) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    }, 800);
  };

  return (
    <footer className="relative bg-black pt-24 pb-12 border-t border-transparent overflow-hidden">
      {/* ── Motif Line (The Loop) ── */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] bg-white/10" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">
          
          {/* Column 1: Store/Contact Info */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Steezaverse</h4>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Curated heavyweight garments. Limited runs. Shaping the future of streetwear from Los Angeles to the world.
            </p>
            <a 
              href="mailto:support@steezaverse.com" 
              className="text-white/60 hover:text-white transition-colors text-sm w-fit"
              data-cuelume-hover="tick"
            >
              support@steezaverse.com
            </a>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Navigation</h4>
            <Link href="/shop" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              Shop
            </Link>
            <Link href="/drops" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              Drops
            </Link>
            <Link href="/about" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              About
            </Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              Contact
            </Link>
          </div>

          {/* Column 3: Socials */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Social</h4>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              Twitter / X
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm w-fit" data-cuelume-hover="tick">
              TikTok
            </a>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">The Loop</h4>
            <p className="text-white/60 text-sm mb-2">Join the list for early access to drops and exclusive pieces.</p>
            
            <form onSubmit={handleSubscribe} className="relative w-full max-w-sm">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="w-full bg-transparent border-b border-white/20 pb-2 px-0 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success" || !email}
                className="absolute right-0 top-0 bottom-2 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                data-cuelume-press
              >
                <ArrowRight size={16} />
              </button>
            </form>
            
            {/* Form Status Messages */}
            {status === "success" && (
              <p className="text-green-500 text-xs uppercase tracking-wider mt-1 animate-in fade-in">
                You're in the loop.
              </p>
            )}
            {status === "error" && (
              <p className="text-sz-red text-xs uppercase tracking-wider mt-1 animate-in fade-in">
                Invalid email address.
              </p>
            )}
          </div>

        </div>

        {/* ── Footer Bottom ── */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-6">
          <p className="text-white/40 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Steezaverse. All rights reserved.
          </p>
          
          {/* Optional 2nd Loop Layer: Static Tiny Wordmark / Logo */}
          <div className="opacity-20 select-none">
            <img 
              src="/STV_mini_logo-removebg-preview.png" 
              alt="Steezaverse" 
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
