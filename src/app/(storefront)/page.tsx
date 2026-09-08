import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import ManifestoSection from "@/components/ManifestoSection";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      
      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      <ManifestoSection />

      {/* ── Placeholder for next sections (Day 4 onwards) ─────────────── */}
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="font-archivo text-[11px] tracking-wider2 text-white/20 uppercase">
          New Arrivals — Coming Day 4
        </p>
      </div>
    </main>
  );
}
