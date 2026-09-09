import { getSupabaseAdmin } from '@/lib/supabase/server';
import LookbookManager, { type LookbookImage } from '@/components/admin/LookbookManager';

export const dynamic = 'force-dynamic';

export default async function AdminLookbookPage() {
  const { data: images, error } = await (getSupabaseAdmin() as any)
    .from('lookbook_images')
    .select(`*, products(name, slug)`)
    .order('sort_order', { ascending: true });

  if (error) {
    return <p className="text-red-400">Failed to load lookbook: {error.message}</p>;
  }

  const { data: products } = await (getSupabaseAdmin() as any)
    .from('products')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Lookbook</h2>
        <span className="text-sm text-gray-500">
          {(images ?? []).filter((img: any) => img.is_published).length} published
        </span>
      </div>

      <LookbookManager
        images={(images ?? []) as LookbookImage[]}
        products={((products ?? []) as Array<{ id: string; name: string }>).map((p) => ({
          id: p.id,
          name: p.name,
        }))}
      />
    </div>
  );
}