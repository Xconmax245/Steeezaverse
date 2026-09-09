import { getFeaturedProducts } from "@/lib/products";
import MiniShopCarousel from "./MiniShopCarousel";

export default async function MiniShopSection() {
  const products = await getFeaturedProducts();
  
  return (
    <section className="relative w-full bg-black py-24 overflow-hidden z-20">
      <div className="max-w-[95vw] mx-auto px-4 md:px-8">
        {/* Section Heading */}
        <h2
          className="font-chillax text-xs md:text-sm uppercase tracking-[0.3em] text-white/50 mb-12"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          Featured
        </h2>
        
        {/* Horizontal Drag-Scroll Carousel */}
        <MiniShopCarousel products={products} />
      </div>
    </section>
  );
}
