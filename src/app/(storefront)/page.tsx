import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import BlackFridaySection from "@/components/BlackFridaySection";
import BlackFridayPopup from "@/components/BlackFridayPopup";
import ManifestoSection from "@/components/ManifestoSection";
import MiniShopSection from "@/components/MiniShopSection";
import LookbookSection from "@/components/LookbookSection";
import HomeTransitionWrapper from "@/components/HomeTransitionWrapper";
import DropSection from "@/components/DropSection";
import SilenceSection from "@/components/SilenceSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      
      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      {/* ── Black Friday Section (gated Nov 6-30) ── */}
      <BlackFridaySection />

      {/* ── Black Friday 24h Popup (homepage only, syncs after intro) ── */}
      <BlackFridayPopup />

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

      {/* ── Vision & Mission Section ── */}
      <VisionMissionSection />

      {/* ── Final Minimal CTA ── */}
      <FinalCTA />

      {/* ── Footer / Loop ── */}
      <Footer />
    </main>
  );
}
