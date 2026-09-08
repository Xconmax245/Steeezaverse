import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { MINI_SHOP_TAG } from '@/lib/cache-tags';

// Cache tag used for on-demand revalidation when `is_featured` is toggled in
// admin (e.g. POST /api/admin/revalidate { tag: 'mini-shop' }).

export const dynamic = 'force-dynamic';

export interface MiniShopItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_drop: boolean;
  drop_starts_at: string | null;
  drop_ends_at: string | null;
  image: string | null;
  hover_image: string | null;
  updated_at: string;
}

export const getFeaturedProducts = unstable_cache(
  async (): Promise<MiniShopItem[]> => {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('products')
      .select(
        `id, name, slug, description, base_price, compare_at_price,
         is_drop, drop_starts_at, drop_ends_at, updated_at,
         product_images(url, alt_text, sort_order)`
      )
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    const products = data as any[] | null;
    if (!products) return [];

    return products.map((p) => {
      const images: any[] = p.product_images ?? [];
      // Representative image for the mini-shop card: first by sort order.
      const sortedImages = [...images].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      const primary = sortedImages.length > 0 ? sortedImages[0] : null;
      const secondary = sortedImages.length > 1 ? sortedImages[1] : null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        base_price: Number(p.base_price),
        compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
        is_drop: p.is_drop,
        drop_starts_at: p.drop_starts_at,
        drop_ends_at: p.drop_ends_at,
        image: primary?.url ?? null,
        hover_image: secondary?.url ?? null,
        updated_at: p.updated_at,
      };
    });
  },
  [MINI_SHOP_TAG],
  { revalidate: 300, tags: [MINI_SHOP_TAG] } // 5-minute revalidation + on-demand purge
);

export async function GET() {
  try {
    const products = await getFeaturedProducts();
    return NextResponse.json(
      { success: true, products },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=300' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}