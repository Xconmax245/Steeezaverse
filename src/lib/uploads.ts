import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const ALLOWED_IMAGE_BUCKETS = new Set(['product-images', 'lookbook']);

/**
 * Validates an uploaded image file and stores it in the given bucket.
 * Returns the public URL. Throws on invalid input / storage failure — callers
 * turn the message into a response. Shared by the lookbook + product upload
 * routes so both admin flows use identical upload logic.
 */
export async function uploadImageFile(file: File, bucket: string): Promise<{ url: string }> {
  if (!ALLOWED_IMAGE_BUCKETS.has(bucket)) {
    throw new Error(`Unknown bucket. Allowed: ${Array.from(ALLOWED_IMAGE_BUCKETS).join(', ')}`);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('File exceeds 5MB limit');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${bucket}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;

  const { error } = await getSupabaseAdmin()
    .storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}