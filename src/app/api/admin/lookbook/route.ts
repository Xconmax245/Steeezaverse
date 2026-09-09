import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';
import { LOOKBOOK_TAG } from '@/lib/cache-tags';

// Admin lookbook CRUD. All mutations purge the public /api/lookbook cache tag.
// Page UI is frontend scope; this is the backend contract:
//   GET    /api/admin/lookbook          → list all (incl. unpublished)
//   POST   /api/admin/lookbook          → { image_url, caption?, sort_order?, is_published?, linked_product_id? }
//   PATCH  /api/admin/lookbook?id=...   → partial update (caption, sort_order, is_published, linked_product_id)
//   DELETE /api/admin/lookbook?id=...   → remove image

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, error } = await (getSupabaseAdmin() as any)
    .from('lookbook_images')
    .select(`*, products(name, slug)`)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, images: data });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { image_url, caption, sort_order, is_published, linked_product_id } = body;

  if (!image_url || typeof image_url !== 'string') {
    return NextResponse.json(
      { success: false, error: 'image_url is required' },
      { status: 400 }
    );
  }

  const { data, error } = await (getSupabaseAdmin() as any)
    .from('lookbook_images')
    .insert([
      {
        image_url,
        caption: caption ?? null,
        sort_order: typeof sort_order === 'number' ? sort_order : 0,
        is_published: is_published ?? false,
        linked_product_id: linked_product_id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  revalidateTag(LOOKBOOK_TAG);
  return NextResponse.json({ success: true, image: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing id query param' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  for (const field of ['caption', 'sort_order', 'is_published', 'linked_product_id']) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, error: 'No updatable fields provided' },
      { status: 400 }
    );
  }

  const { data, error } = await (getSupabaseAdmin() as any)
    .from('lookbook_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  revalidateTag(LOOKBOOK_TAG);
  return NextResponse.json({ success: true, image: data });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing id query param' },
      { status: 400 }
    );
  }

  const { error } = await (getSupabaseAdmin() as any)
    .from('lookbook_images')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  revalidateTag(LOOKBOOK_TAG);
  return NextResponse.json({ success: true, message: 'Lookbook image deleted' });
}