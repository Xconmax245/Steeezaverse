"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShopProduct, MiniShopItem } from "@/lib/products";
import MiniShopCarousel from "@/components/MiniShopCarousel";
import { ChevronDown, ChevronUp } from "lucide-react";
import StitchedLine from "@/components/StitchedLine";
import { createPortal } from "react-dom";
import { useCart } from "@/components/CartContext";

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: ShopProduct;
  relatedProducts: MiniShopItem[];
}) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  // Size Guide Modal state
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Stitched Line Animation state
  const [showStitchedLine, setShowStitchedLine] = useState(false);

  // Extract unique sizes and colors from variants
  const availableSizes = useMemo(() => {
    const sizes = product.variants.map((v) => v.size).filter(Boolean) as string[];
    return Array.from(new Set(sizes));
  }, [product.variants]);

  const availableColors = useMemo(() => {
    const colors = product.variants.map((v) => v.color).filter(Boolean) as string[];
    return Array.from(new Set(colors));
  }, [product.variants]);

  // Find the matching variant based on selections
  const activeVariant = useMemo(() => {
    // If we have sizes but no colors
    if (availableSizes.length > 0 && availableColors.length === 0) {
      return product.variants.find((v) => v.size === selectedSize);
    }
    // If we have colors but no sizes
    if (availableColors.length > 0 && availableSizes.length === 0) {
      return product.variants.find((v) => v.color === selectedColor);
    }
    // If we have both
    if (availableSizes.length > 0 && availableColors.length > 0) {
      return product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
    }
    // If we have neither (single variant product)
    return product.variants[0];
  }, [product.variants, selectedSize, selectedColor, availableSizes, availableColors]);

  const displayPrice = activeVariant?.price_override ?? product.base_price;
  const isOutOfStock = activeVariant ? activeVariant.stock_quantity <= 0 : false;
  
  // Check if Add to Cart is ready
  const isReadyToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) return false;
    if (availableColors.length > 0 && !selectedColor) return false;
    return !isOutOfStock;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isReadyToCart() || !activeVariant) return;
    
    // Trigger animation
    setShowStitchedLine(false);
    setTimeout(() => {
      setShowStitchedLine(true);
      // Wait for animation to finish, then hide
      setTimeout(() => setShowStitchedLine(false), 2000);
    }, 50);

    await addItem(activeVariant.id, 1);
  };

  const activeImageUrl = product.images[activeImageIndex]?.url || product.image;

  return (
    <div className="w-full text-white">
      {/* ── Top Section: Split Layout ── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left: Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div 
            className="w-full aspect-[4/5] bg-[#f4f4f4] relative overflow-hidden cursor-crosshair rounded-sm"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {activeImageUrl ? (
              <Image
                src={activeImageUrl}
                alt={product.images[activeImageIndex]?.alt_text || product.name}
                fill
                priority
                className={`object-cover transition-transform duration-200 ${isZoomed ? "scale-150" : "scale-100"}`}
                style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-black/20 text-xs tracking-widest uppercase">
                No Image
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 flex-shrink-0 bg-[#f4f4f4] rounded-sm overflow-hidden border-2 transition-colors ${
                    activeImageIndex === idx ? "border-sz-red" : "border-transparent"
                  }`}
                  data-cuelume-hover="tick"
                >
                  <Image src={img.url} alt={img.alt_text || ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-12">
          <h1 className="font-chillax text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="font-chillax text-2xl text-sz-red font-bold">
              {formatNGN(displayPrice)}
            </span>
            {product.compare_at_price && (
              <span className="text-white/40 line-through text-lg">
                {formatNGN(product.compare_at_price)}
              </span>
            )}
          </div>

          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="mb-8">
              <span className="block text-xs uppercase tracking-widest text-white/50 mb-3">
                Color
              </span>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border text-sm tracking-wide uppercase transition-colors ${
                      selectedColor === color
                        ? "border-sz-red text-sz-red"
                        : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                    }`}
                    data-cuelume-hover="tick"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <span className="block text-xs uppercase tracking-widest text-white/50">
                  Size
                </span>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs uppercase tracking-widest text-white/40 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/100 transition-all"
                  data-cuelume-hover="tick"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  // Determine if this specific size is out of stock (assuming color is selected or there are no colors)
                  const variantForSize = product.variants.find(
                    (v) => v.size === size && (availableColors.length === 0 || v.color === selectedColor)
                  );
                  const outOfStock = variantForSize ? variantForSize.stock_quantity <= 0 : false;

                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`relative px-4 py-2 border text-sm tracking-wide uppercase transition-colors ${
                        selectedSize === size
                          ? "border-sz-red bg-sz-red text-white"
                          : outOfStock
                          ? "border-white/10 text-white/20 cursor-not-allowed opacity-50"
                          : "border-white/20 text-white/80 hover:border-white/50"
                      }`}
                      data-cuelume-hover="tick"
                    >
                      {size}
                      {outOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-white/20 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6 h-6">
            <AnimatePresence mode="wait">
              {activeVariant && (
                <motion.div
                  key={activeVariant.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs uppercase tracking-widest"
                >
                  {isOutOfStock ? (
                    <span className="text-white/40">Out of Stock</span>
                  ) : activeVariant.stock_quantity < 5 ? (
                    <span className="text-sz-red">Low Stock: Only {activeVariant.stock_quantity} left</span>
                  ) : (
                    <span className="text-green-500/80">In Stock</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add to Cart Button */}
          <button
            id="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!isReadyToCart()}
            className="w-full bg-sz-red hover:bg-sz-red-dim text-white font-bold tracking-widest uppercase py-5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-sz-red mb-12"
            data-cuelume-press
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Accordions */}
          <div className="border-t border-white/10">
            {/* Description */}
            <div className="border-b border-white/10">
              <button
                onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                className="w-full flex items-center justify-between py-5 text-sm uppercase tracking-widest font-bold text-white/80 hover:text-white transition-colors"
                data-cuelume-hover="tick"
              >
                Description
                {openAccordion === "description" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {openAccordion === "description" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                      {product.description || "No description provided."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Materials */}
            {product.materials && (
              <div className="border-b border-white/10">
                <button
                  onClick={() => setOpenAccordion(openAccordion === "materials" ? null : "materials")}
                  className="w-full flex items-center justify-between py-5 text-sm uppercase tracking-widest font-bold text-white/80 hover:text-white transition-colors"
                  data-cuelume-hover="tick"
                >
                  Materials
                  {openAccordion === "materials" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {openAccordion === "materials" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                        {product.materials}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Care Instructions */}
            {product.care_instructions && (
              <div className="border-b border-white/10">
                <button
                  onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                  className="w-full flex items-center justify-between py-5 text-sm uppercase tracking-widest font-bold text-white/80 hover:text-white transition-colors"
                  data-cuelume-hover="tick"
                >
                  Care Instructions
                  {openAccordion === "care" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {openAccordion === "care" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                        {product.care_instructions}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Related Products ── */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-white/10 mt-12 py-24 bg-black relative">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 mb-8">
            <h2 className="font-chillax text-2xl font-bold uppercase tracking-widest">
              More from the Loop
            </h2>
          </div>
          <MiniShopCarousel products={relatedProducts} />
        </div>
      )}

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-chillax text-xl font-bold uppercase tracking-widest">Size Guide</h3>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="text-white/40 hover:text-white transition-colors uppercase text-xs tracking-widest"
                data-cuelume-hover="tick"
              >
                Close
              </button>
            </div>
            <div className="text-white/60 text-sm leading-relaxed mb-6">
              [PLACEHOLDER] True size chart data required before launch. Fit is generally oversized and boxy.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest text-xs">
                    <th className="pb-3 pr-6 font-normal">Size</th>
                    <th className="pb-3 pr-6 font-normal">Chest (in)</th>
                    <th className="pb-3 pr-6 font-normal">Length (in)</th>
                    <th className="pb-3 font-normal">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-6">S</td>
                    <td className="py-4 pr-6">22</td>
                    <td className="py-4 pr-6">27</td>
                    <td className="py-4">8.5</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-6">M</td>
                    <td className="py-4 pr-6">23</td>
                    <td className="py-4 pr-6">28</td>
                    <td className="py-4">9</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 pr-6">L</td>
                    <td className="py-4 pr-6">24</td>
                    <td className="py-4 pr-6">29.5</td>
                    <td className="py-4">9.5</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-6">XL</td>
                    <td className="py-4 pr-6">25</td>
                    <td className="py-4 pr-6">30.5</td>
                    <td className="py-4">10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* ── Stitched Line Animation Portal ── */}
      {showStitchedLine && <StitchedLine startId="add-to-cart-btn" endId="navbar-cart-btn" />}
    </div>
  );
}
