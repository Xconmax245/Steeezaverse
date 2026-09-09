import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { data: product, error } = await (getSupabaseAdmin() as any)
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) notFound();

  const { data: variants } = await (getSupabaseAdmin() as any)
    .from('product_variants')
    .select('id, size, color, sku, stock_quantity, price_override')
    .eq('product_id', params.id);

  const { data: images } = await (getSupabaseAdmin() as any)
    .from('product_images')
    .select('id, url, alt_text')
    .eq('product_id', params.id)
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <ProductForm
        mode="edit"
        productId={params.id}
        initial={{ product, variants: variants ?? [], images: images ?? [] }}
      />
    </div>
  );
}