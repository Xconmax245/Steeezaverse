import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { LOOKBOOK_TAG } from '@/lib/cache-tags';

// Published-lookbook getter for the homepage Lookbook section. Lives in lib
// (not the route module) because Next.js route modules may only export
// handlers/config.

export interface LookbookItem {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  linked_product: {
    id: string;
    name: string;
    slug: string;
    images: { id: string; url: string; sort_order: number }[];
  } | null;
}

export const getPublishedLookbook = unstable_cache(
  async (): Promise<LookbookItem[]> => {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('lookbook_images')
      .select(`
        id, 
        image_url, 
        caption, 
        sort_order, 
        linked_product_id, 
        products(
          id,
          name, 
          slug,
          product_images(id, url, sort_order)
        )
      `)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const images = data as any[] | null;
    if (!images) return [];

    return images.map((img) => {
      // Sort product images to ensure we get the correct secondary image
      const productImages = img.products?.product_images
        ? [...img.products.product_images].sort((a, b) => a.sort_order - b.sort_order)
        : [];

      return {
        id: img.id,
        image_url: img.image_url,
        caption: img.caption,
        sort_order: img.sort_order,
        linked_product: img.products
          ? {
              id: img.products.id,
              name: img.products.name,
              slug: img.products.slug,
              images: productImages,
            }
          : null,
      };
    });
  },
  [LOOKBOOK_TAG],
  { revalidate: 300, tags: [LOOKBOOK_TAG] } // 5-minute revalidation + on-demand purge
);