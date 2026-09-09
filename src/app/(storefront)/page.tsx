import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import ManifestoSection from "@/components/ManifestoSection";
import MiniShopSection from "@/components/MiniShopSection";
import LookbookSection from "@/components/LookbookSection";
import HomeTransitionWrapper from "@/components/HomeTransitionWrapper";
import DropSection from "@/components/DropSection";
import SilenceSection from "@/components/SilenceSection";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      
      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      <ManifestoSection />

      <HomeTransitionWrapper>
        {/* ── Mini-Shop Section ── */}
        <MiniShopSection />

        {/* ── Lookbook Section (admin-managed) ── */}
        <LookbookSection />
      </HomeTransitionWrapper>

      {/* ── Drop Section ── */}
      <DropSection />

      {/* ── Silence Section ── */}
      <SilenceSection />
    </main>
  );
}
