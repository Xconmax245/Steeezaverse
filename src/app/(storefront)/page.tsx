import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeDivider from "@/components/MarqueeDivider";
import ManifestoSection from "@/components/ManifestoSection";
import MiniShopSection from "@/components/MiniShopSection";
import LookbookSection from "@/components/LookbookSection";
import DropSection from "@/components/DropSection";
import SilenceSection from "@/components/SilenceSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import TakeReeksModal from "@/components/TakeReeksModal";
import { getDropProducts } from "@/lib/products";

export default async function HomePage() {
  let dropStartsAt: string | null = null;
  try {
    const drops = await getDropProducts();
    dropStartsAt = drops[0]?.drop_starts_at || null;
  } catch {}

  return (
    <main>
      {/* ── Take Reeks Intro Modal (flyer + write-up, 24h localStorage) ── */}
      <TakeReeksModal dropStartsAt={dropStartsAt} />

      <Navbar />
      <HeroSection />

      {/* ── Wavy Divider & Marquee ── */}
      <MarqueeDivider />

      {/* ── All Products Grid (Shop on Home) ── */}
      <MiniShopSection />

      {/* ── Lookbook Section ── */}
      <LookbookSection />

      {/* ── Take Reeks Drop Section (directly after Lookbook, id="take-reeks") ── */}
      <DropSection />

      {/* ── Manifesto (3-sentence scroll transition) ── */}
      <ManifestoSection />

      {/* ── Silence Section ── */}
      <SilenceSection />

      {/* ── Final Minimal CTA ── */}
      <FinalCTA />

      {/* ── Footer / Loop ── */}
      <Footer />
    </main>
  );
}
