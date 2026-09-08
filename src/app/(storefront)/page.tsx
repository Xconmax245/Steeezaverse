import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import ManifestoSection from "@/components/ManifestoSection";
import MiniShopSection from "@/components/MiniShopSection";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      
      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      <ManifestoSection />

      {/* ── Mini-Shop Section ── */}
      <MiniShopSection />
    </main>
  );
}
