import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import { getProductBySlug } from "@/lib/products";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product) return { title: "Not found — Steezaverse" };
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steezaverse.com';
    const primaryImage = product.images?.[0]?.url || `${baseUrl}/og-fallback.png`;
    const title = `${product.name} — Steezaverse`;
    const description = product.description || `Available now at Steezaverse. ${product.is_drop ? 'Limited release.' : ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/product/${product.slug}`,
        siteName: 'Steezaverse',
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ],
        type: 'website', // using 'website' for generic sharing, but we can add custom product tags
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [primaryImage],
      },
      other: {
        'product:price:amount': product.base_price.toString(),
        'product:price:currency': 'NGN',
      }
    };
  } catch {
    return { title: "Steezaverse" };
  }
}

function formatNGN(value: number): string {
  return `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function dropWindowLabel(startsAt: string | null, endsAt: string | null): string | null {
  if (!startsAt) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  if (endsAt) return `${fmt(startsAt)} — ${fmt(endsAt)}`;
  return `From ${fmt(startsAt)}`;
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  const gallery = product.images.length > 0 ? product.images : null;
  const dropLabel = product.is_drop ? dropWindowLabel(product.drop_starts_at, product.drop_ends_at) : null;

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-[95vw] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* ── Gallery ── */}
            <div className="lg:col-span-5 flex flex-col gap-6" data-aos="fade-up" data-aos-duration="900">
              {gallery ? (
                <>
                  <div className="relative w-full aspect-[4/5] bg-[#0a0a0a] border border-white/[0.04] rounded-[32px] p-4 md:p-8 flex items-center justify-center overflow-hidden group">
                    <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                      <Image
                        src={gallery[0].url}
                        alt={gallery[0].alt_text ?? product.name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                  {gallery.length > 1 && (
                    <div className="grid grid-cols-4 gap-4">
                      {gallery.slice(1, 5).map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square bg-[#0a0a0a] border border-white/[0.04] p-2 rounded-2xl overflow-hidden hover:border-white/20 transition-colors cursor-pointer"
                        >
                          <div className="relative w-full h-full rounded-xl overflow-hidden">
                            <Image
                              src={img.url}
                              alt={img.alt_text ?? `${product.name} view`}
                              fill
                              sizes="15vw"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full aspect-[4/5] bg-[#0a0a0a] rounded-[32px] flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
                  No imagery yet
                </div>
              )}
            </div>

            {/* ── Details ── */}
            <div className="lg:col-span-7 flex flex-col gap-8 lg:sticky lg:top-32 py-4" data-aos="fade-up" data-aos-delay="120" data-aos-duration="900">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 font-chillax">
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop
                </Link>
                <span>/</span>
                <span className="text-white/80">{product.name}</span>
              </nav>

              <header className="flex flex-col gap-3">
                {product.is_drop && (
                  <div className="text-[12px] font-chillax font-bold uppercase tracking-widest text-sz-red">
                    Drop{dropLabel ? ` · ${dropLabel}` : ""}
                  </div>
                )}
                <h1 className="font-chillax text-4xl md:text-5xl font-bold tracking-wide text-white leading-tight">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="font-chillax text-[15px] leading-relaxed text-white/50 max-w-xl">
                    {product.description}
                  </p>
                )}
              </header>

              <ProductPurchasePanel product={product} />

              {/* Materials / care */}
              {(product.materials || product.care_instructions) && (
                <div className="border-t border-white/[0.05] pt-8 flex flex-col gap-6 font-chillax">
                  {product.materials && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                        Materials
                      </p>
                      <p className="text-[14px] font-medium text-white/80">{product.materials}</p>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                        Care
                      </p>
                      <p className="text-[14px] font-medium text-white/80">{product.care_instructions}</p>
                    </div>
                  )}
                  {product.compare_at_price != null && product.compare_at_price > product.base_price && (
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mt-2">
                      Compare at {formatNGN(product.compare_at_price)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
