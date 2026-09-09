import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch all and filter out current for related
  const allProducts = await getAllProducts();
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <main className="min-h-screen bg-black pt-20">
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </main>
  );
}
