'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/admin-auth';
import { MINI_SHOP_TAG, PRODUCTS_TAG } from '@/lib/cache-tags';

// Admin product management server actions. All mutations revalidate the
// mini-shop cache tag so homepage changes (featured toggles, publish flips,
// image swaps) appear immediately instead of waiting out the 5-min ISR window.

export interface ProductFormVariant {
  id?: string; // present when editing an existing variant
  size: string;
  color: string;
  sku: string;
  stock_quantity: string; // form sends strings
  price_override: string;
}

export interface ProductFormImage {
  id?: string; // present when editing an existing image
  url: string;
  alt_text: string;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  description: string;
  materials: string;
  care_instructions: string;
  base_price: string;
  compare_at_price: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  is_drop: boolean;
  drop_starts_at: string; // '' | ISO string (from datetime-local)
  drop_ends_at: string;
  variants: ProductFormVariant[];
  images: ProductFormImage[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
  productId?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toIsoOrNull(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface VariantRow {
  id?: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock_quantity: number;
  price_override: number | null;
}

interface ImageRow {
  id?: string;
  url: string;
  alt_text: string | null;
}

type NormalizeResult =
  | { ok: true; product: Record<string, unknown>; variants: VariantRow[]; images: ImageRow[] }
  | { ok: false; error: string };

/** Validates input and normalizes the values written to the DB. */
function normalizeInput(input: ProductFormInput): NormalizeResult {
  const name = input.name.trim();
  if (!name) return { ok: false, error: 'Product name is required.' };

  const basePrice = toNumber(input.base_price);
  if (basePrice === null || basePrice <= 0) {
    return { ok: false, error: 'Base price is required and must be greater than 0.' };
  }

  const compareAt = toNumber(input.compare_at_price);
  if (compareAt !== null && compareAt <= 0) {
    return { ok: false, error: 'Compare-at price must be greater than 0.' };
  }

  const slug = (input.slug.trim() || slugify(name)).toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!slug) return { ok: false, error: 'Slug is required (or it could not be derived from the name).' };

  const variants = input.variants
    .filter((v) => v.size.trim() || v.color.trim() || v.sku.trim() || v.stock_quantity.trim() !== '' || v.price_override.trim() !== '')
    .map((v) => ({
      id: v.id || undefined,
      size: v.size.trim() || null,
      color: v.color.trim() || null,
      sku: v.sku.trim() || null,
      stock_quantity: Math.max(0, Math.floor(toNumber(v.stock_quantity) ?? 0)),
      price_override: toNumber(v.price_override),
    }));

  const images = input.images
    .filter((img) => img.url.trim() !== '')
    .map((img) => ({ id: img.id || undefined, url: img.url.trim(), alt_text: img.alt_text.trim() || null }));

  // A published product must be purchasable: at least one variant with stock.
  if (input.status === 'published') {
    if (variants.length === 0) {
      return { ok: false, error: 'A published product needs at least one variant (size/color + stock) before it can go live.' };
    }
    if (!variants.some((v) => v.stock_quantity > 0)) {
      return { ok: false, error: 'A published product needs at least one variant with stock greater than 0.' };
    }
  }

  return {
    ok: true,
    product: {
      name,
      slug,
      description: input.description.trim() || null,
      materials: input.materials.trim() || null,
      care_instructions: input.care_instructions.trim() || null,
      base_price: basePrice,
      compare_at_price: compareAt,
      status: input.status,
      is_featured: input.is_featured,
      is_drop: input.is_drop,
      drop_starts_at: toIsoOrNull(input.drop_starts_at),
      drop_ends_at: toIsoOrNull(input.drop_ends_at),
    },
    variants,
    images,
  };
}

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const normalized = normalizeInput(input);
  if (!normalized.ok) return { success: false, error: normalized.error };

  const { data: product, error: productError } = await (getSupabaseAdmin() as any)
    .from('products')
    .insert([{ ...normalized.product, updated_at: new Date().toISOString() }])
    .select('id')
    .single();

  if (productError) {
    if (/duplicate key.*products_slug_key/i.test(productError.message)) {
      return { success: false, error: `Slug "${input.slug}" is already in use — pick a different one.` };
    }
    return { success: false, error: productError.message };
  }

  const productId = (product as any).id;

  const variantRows = normalized.variants.map((v) => ({
    product_id: productId,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock_quantity: v.stock_quantity,
    price_override: v.price_override,
  }));

  const imageRows = normalized.images.map((img, index) => ({
    product_id: productId,
    url: img.url,
    alt_text: img.alt_text,
    sort_order: index, // 0 = primary card image, 1 = hover-swap image
  }));

  const { error: childError } = await (getSupabaseAdmin() as any)
    .from('product_variants')
    .insert(variantRows);

  if (childError) {
    await (getSupabaseAdmin() as any).from('products').delete().eq('id', productId);
    return { success: false, error: childError.message };
  }

  if (imageRows.length > 0) {
    const { error: imageError } = await (getSupabaseAdmin() as any)
      .from('product_images')
      .insert(imageRows);
    if (imageError) {
      return { success: false, error: imageError.message };
    }
  }

  revalidateTag(MINI_SHOP_TAG);
  revalidateTag(PRODUCTS_TAG);
  revalidatePath('/');
  return { success: true, productId };
}

export async function updateProduct(productId: string, input: ProductFormInput): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const normalized = normalizeInput(input);
  if (!normalized.ok) return { success: false, error: normalized.error };

  const { error: productError } = await (getSupabaseAdmin() as any)
    .from('products')
    .update({ ...normalized.product, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (productError) {
    if (/duplicate key.*products_slug_key/i.test(productError.message)) {
      return { success: false, error: `Slug "${input.slug}" is already in use — pick a different one.` };
    }
    return { success: false, error: productError.message };
  }

  // ── Variant sync (diff by id: update kept, insert new, delete removed) ──
  const { data: existingVariants } = await (getSupabaseAdmin() as any)
    .from('product_variants')
    .select('id, stock_quantity')
    .eq('product_id', productId);
  const existingVariantMap = new Map<string, number>(
    (existingVariants ?? []).map((v: any) => [v.id, v.stock_quantity])
  );

  const incomingIds = new Set<string>();
  for (const v of normalized.variants) {
    if (v.id && existingVariantMap.has(v.id)) {
      incomingIds.add(v.id);
      const { error } = await (getSupabaseAdmin() as any)
        .from('product_variants')
        .update({
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock_quantity: v.stock_quantity,
          price_override: v.price_override,
        })
        .eq('id', v.id);
      if (error) return { success: false, error: error.message };

      // Audit manual stock changes in inventory_log.
      const oldStock = existingVariantMap.get(v.id)!;
      const delta = v.stock_quantity - oldStock;
      if (delta !== 0) {
        await (getSupabaseAdmin() as any).from('inventory_log').insert({
          variant_id: v.id,
          change_qty: delta,
          reason: 'manual',
          admin_id: admin.id,
        });
      }
    } else {
      const { data: created, error } = await (getSupabaseAdmin() as any)
        .from('product_variants')
        .insert({
          product_id: productId,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock_quantity: v.stock_quantity,
          price_override: v.price_override,
        })
        .select('id')
        .single();
      if (error) return { success: false, error: error.message };
      incomingIds.add((created as any).id);
    }
  }

  const removedIds = Array.from(existingVariantMap.keys()).filter((id) => !incomingIds.has(id));
  if (removedIds.length > 0) {
    const { error } = await (getSupabaseAdmin() as any)
      .from('product_variants')
      .delete()
      .in('id', removedIds);
    if (error) return { success: false, error: error.message };
  }

  // ── Image sync (same diff-by-id approach) ──
  const { data: existingImages } = await (getSupabaseAdmin() as any)
    .from('product_images')
    .select('id')
    .eq('product_id', productId);
  const existingImageIds = new Set<string>((existingImages ?? []).map((img: any) => img.id));

  const keptImageIds = new Set<string>();
  for (let index = 0; index < normalized.images.length; index++) {
    const img = normalized.images[index];
    if (img.id && existingImageIds.has(img.id)) {
      keptImageIds.add(img.id);
      const { error } = await (getSupabaseAdmin() as any)
        .from('product_images')
        .update({ url: img.url, alt_text: img.alt_text, sort_order: index })
        .eq('id', img.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await (getSupabaseAdmin() as any)
        .from('product_images')
        .insert({ product_id: productId, url: img.url, alt_text: img.alt_text, sort_order: index });
      if (error) return { success: false, error: error.message };
    }
  }

  const removedImageIds = Array.from(existingImageIds).filter((id) => !keptImageIds.has(id));
  if (removedImageIds.length > 0) {
    const { error } = await (getSupabaseAdmin() as any)
      .from('product_images')
      .delete()
      .in('id', removedImageIds);
    if (error) return { success: false, error: error.message };
  }

  revalidateTag(MINI_SHOP_TAG);
  revalidateTag(PRODUCTS_TAG);
  revalidatePath('/');
  return { success: true, productId };
}

export async function toggleProductFeatured(productId: string, isFeatured: boolean): Promise<ActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { success: false, error: 'Unauthorized' };

  const { error } = await (getSupabaseAdmin() as any)
    .from('products')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) return { success: false, error: error.message };

  revalidateTag(MINI_SHOP_TAG);
  revalidatePath('/');
  return { success: true };
}