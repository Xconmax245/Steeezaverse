import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin-auth';
import { ALLOWED_CACHE_TAGS } from '@/lib/cache-tags';

// On-demand purge for the public cached routes. Call after toggling
// `is_featured` on a product (tag: 'mini-shop') or editing lookbook images.
// Usage: POST /api/admin/revalidate { "tag": "mini-shop" }
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { tag } = await request.json();

  if (typeof tag !== 'string' || !ALLOWED_CACHE_TAGS.has(tag)) {
    return NextResponse.json(
      { success: false, error: `Unknown tag. Allowed: ${Array.from(ALLOWED_CACHE_TAGS).join(', ')}` },
      { status: 400 }
    );
  }

  revalidateTag(tag);
  return NextResponse.json({ success: true, message: `Revalidated: ${tag}` });
}