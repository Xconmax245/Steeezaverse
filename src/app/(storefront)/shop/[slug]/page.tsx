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
    return {
      title: `${product.name} — Steezaverse`,
      description: product.description ?? undefined,
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
          {/* Breadcrumb */}
          <nav data-aos="fade-in" className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30">
            <Link href="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-white/60">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ── Gallery ── */}
            <div className="lg:col-span-3 flex flex-col gap-4" data-aos="fade-up" data-aos-duration="900">
              {gallery ? (
                <>
                  <div className="relative w-full aspect-[4/5] bg-[#111] rounded-lg overflow-hidden">
                    <Image
                      src={gallery[0].url}
                      alt={gallery[0].alt_text ?? product.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                    {product.is_drop && (
                      <div className="absolute top-4 left-4 bg-sz-red text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        Drop{dropLabel ? ` · ${dropLabel}` : ""}
                      </div>
                    )}
                  </div>
                  {gallery.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {gallery.slice(1, 5).map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square bg-[#111] rounded-md overflow-hidden"
                        >
                          <Image
                            src={img.url}
                            alt={img.alt_text ?? `${product.name} view`}
                            fill
                            sizes="20vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full aspect-[4/5] bg-[#111] rounded-lg flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">
                  No imagery yet
                </div>
              )}
            </div>

            {/* ── Details ── */}
            <div className="lg:col-span-2 flex flex-col gap-8 lg:sticky lg:top-32 self-start" data-aos="fade-up" data-aos-delay="120" data-aos-duration="900">
              <header>
                <h1 className="font-chillax text-3xl md:text-4xl font-bold uppercase tracking-tight text-white">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="mt-4 font-sans text-sm leading-relaxed text-white/50">
                    {product.description}
                  </p>
                )}
              </header>

              <ProductPurchasePanel product={product} />

              {/* Materials / care */}
              {(product.materials || product.care_instructions) && (
                <div className="border-t border-white/10 pt-6 flex flex-col gap-4">
                  {product.materials && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                        Materials
                      </p>
                      <p className="text-sm text-white/60">{product.materials}</p>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">
                        Care
                      </p>
                      <p className="text-sm text-white/60">{product.care_instructions}</p>
                    </div>
                  )}
                  {product.compare_at_price != null && product.compare_at_price > product.base_price && (
                    <p className="text-[10px] uppercase tracking-wider text-white/30">
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
