import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { MINI_SHOP_TAG, PRODUCTS_TAG } from '@/lib/cache-tags';

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

// ─── Shop / Drops / Product detail getters (public storefront) ──────────────

function toCard(row: any): MiniShopItem {
  const images: any[] = row.product_images ?? [];
  const sortedImages = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    base_price: Number(row.base_price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    is_drop: row.is_drop,
    drop_starts_at: row.drop_starts_at,
    drop_ends_at: row.drop_ends_at,
    image: sortedImages[0]?.url ?? null,
    hover_image: sortedImages[1]?.url ?? null,
    updated_at: row.updated_at,
  };
}

const CARD_SELECT = `id, name, slug, description, base_price, compare_at_price,
  is_drop, drop_starts_at, drop_ends_at, updated_at,
  product_images(url, alt_text, sort_order)`;

/** All published products for /shop — newest first. */
export const getAllProducts = unstable_cache(
  async (): Promise<MiniShopItem[]> => {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('products')
      .select(CARD_SELECT)
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return ((data as any[]) ?? []).map(toCard);
  },
  [PRODUCTS_TAG],
  { revalidate: 300, tags: [PRODUCTS_TAG] }
);

export interface ShopFilterParams {
  categorySlug?: string;
  sizes?: string[];
  colors?: string[];
  sort?: "featured" | "newest" | "price-asc" | "price-desc";
  cursorId?: string;
  cursorValue?: string | number;
  limit?: number;
}

export async function getFilteredProducts(params: ShopFilterParams): Promise<MiniShopItem[]> {
  const limit = params.limit ?? 12;
  const sort = params.sort ?? "featured";
  
  let query = (getSupabaseAdmin() as any)
    .from('products')
    .select(`
      id, name, slug, description, base_price, compare_at_price,
      is_drop, drop_starts_at, drop_ends_at, updated_at,
      product_images(url, alt_text, sort_order)
      ${params.categorySlug ? ', categories!inner(slug)' : ''}
      ${params.sizes?.length || params.colors?.length ? ', product_variants!inner(size, color)' : ''}
    `)
    .eq('status', 'published');

  // Filters
  if (params.categorySlug) {
    query = query.eq('categories.slug', params.categorySlug);
  }
  if (params.sizes && params.sizes.length > 0) {
    query = query.in('product_variants.size', params.sizes);
  }
  if (params.colors && params.colors.length > 0) {
    query = query.in('product_variants.color', params.colors);
  }

  // Sorting & Cursor logic
  if (sort === "price-asc") {
    query = query.order('base_price', { ascending: true }).order('id', { ascending: true });
    if (params.cursorId && params.cursorValue !== undefined) {
      query = query.or(`base_price.gt.${params.cursorValue},and(base_price.eq.${params.cursorValue},id.gt.${params.cursorId})`);
    }
  } else if (sort === "price-desc") {
    query = query.order('base_price', { ascending: false }).order('id', { ascending: false });
    if (params.cursorId && params.cursorValue !== undefined) {
      query = query.or(`base_price.lt.${params.cursorValue},and(base_price.eq.${params.cursorValue},id.lt.${params.cursorId})`);
    }
  } else {
    // newest / featured
    query = query.order('updated_at', { ascending: false }).order('id', { ascending: false });
    if (params.cursorId && params.cursorValue !== undefined) {
      query = query.or(`updated_at.lt.${params.cursorValue},and(updated_at.eq.${params.cursorValue},id.lt.${params.cursorId})`);
    }
  }

  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return ((data as any[]) ?? []).map(toCard);
}

export const getShopFacets = unstable_cache(
  async () => {
    const { data: sizes } = await (getSupabaseAdmin() as any)
      .from('product_variants')
      .select('size')
      .not('size', 'is', null);
    
    const { data: colors } = await (getSupabaseAdmin() as any)
      .from('product_variants')
      .select('color')
      .not('color', 'is', null);

    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    
    sizes?.forEach((v: any) => v.size && sizeSet.add(v.size));
    colors?.forEach((v: any) => v.color && colorSet.add(v.color));

    return {
      sizes: Array.from(sizeSet).sort(),
      colors: Array.from(colorSet).sort()
    };
  },
  ['SHOP_FACETS'],
  { revalidate: 3600, tags: ['SHOP_FACETS'] } // Cache for 1 hour
);

/** Time-gated drop products for /drops. */
export const getDropProducts = unstable_cache(
  async (): Promise<MiniShopItem[]> => {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('products')
      .select(CARD_SELECT)
      .eq('status', 'published')
      .eq('is_drop', true)
      .order('drop_starts_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return ((data as any[]) ?? []).map(toCard);
  },
  [PRODUCTS_TAG],
  { revalidate: 300, tags: [PRODUCTS_TAG] }
);

export interface ShopProduct extends MiniShopItem {
  materials: string | null;
  care_instructions: string | null;
  images: Array<{ id: string; url: string; alt_text: string | null }>;
  variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    sku: string | null;
    stock_quantity: number;
    price_override: number | null;
  }>;
}

/** Single published product with variants + full gallery, for /shop/[slug]. */
export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ShopProduct | null> => {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('products')
      .select(
        `id, name, slug, description, materials, care_instructions,
         base_price, compare_at_price, is_drop, drop_starts_at, drop_ends_at, updated_at,
         product_images(id, url, alt_text, sort_order),
         product_variants(id, size, color, sku, stock_quantity, price_override)`
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const images = ((data.product_images as any[]) ?? [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((img) => ({ id: img.id, url: img.url, alt_text: img.alt_text }));

    const variants = ((data.product_variants as any[]) ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock_quantity: v.stock_quantity ?? 0,
      price_override: v.price_override != null ? Number(v.price_override) : null,
    }));

    const card = toCard(data);
    return {
      ...card,
      materials: data.materials,
      care_instructions: data.care_instructions,
      images,
      variants,
    };
  },
  [PRODUCTS_TAG],
  { revalidate: 300, tags: [PRODUCTS_TAG] }
);
