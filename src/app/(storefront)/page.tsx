import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import ManifestoSection from "@/components/ManifestoSection";
import MiniShopSection from "@/components/MiniShopSection";
import LookbookSection from "@/components/LookbookSection";
import HomeTransitionWrapper from "@/components/HomeTransitionWrapper";
import DropSection from "@/components/DropSection";
import SilenceSection from "@/components/SilenceSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />

      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      <HomeTransitionWrapper>
        {/* ── Mini-Shop Section (featured products, 2-col grid on mobile) ── */}
        <MiniShopSection />

        {/* ── Lookbook Section (admin-managed) ── */}
        <LookbookSection />
      </HomeTransitionWrapper>

      {/* ── Manifesto (3-sentence scroll transition) — after lookbook ── */}
      <ManifestoSection />

      {/* ── Drop Section ── */}
      <DropSection />

      {/* ── Silence Section ── */}
      <SilenceSection />

      {/* ── Final Minimal CTA ── */}
      <FinalCTA />

      {/* ── Footer / Loop ── */}
      <Footer />
    </main>
  );
}
