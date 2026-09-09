-- Steezaverse Migration 00004
-- `product-images` storage bucket for admin product images (mirrors the
-- lookbook bucket: public read + admin upload). Product images are uploaded by
-- /api/admin/upload (service role) and served directly from storage URLs.

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read of product images served from storage.
CREATE POLICY "Public read of product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated (admin) uploads to the product-images bucket.
CREATE POLICY "Admin upload to product-images bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');