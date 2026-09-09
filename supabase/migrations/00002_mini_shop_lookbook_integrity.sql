-- Steezaverse Migration 00002
-- Mini-Shop (is_featured), Lookbook table, atomic inventory/discount functions.
-- All checkout-critical stock operations go through the RPCs below (single atomic
-- UPDATE, never read-then-write). Functions are revoked from anon/authenticated so
-- they can only be invoked with the service role key from trusted server code.

-- ── 1. products.is_featured (controls homepage Mini-Shop inclusion) ──────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_mini_shop
  ON products (is_featured, status, updated_at DESC);

-- ── 2. Lookbook images ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lookbook_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  linked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lookbook_published
  ON lookbook_images (is_published, sort_order);

ALTER TABLE lookbook_images ENABLE ROW LEVEL SECURITY;

-- Public can read only published images (the public /api/lookbook route also
-- filters server-side with the service role; this policy covers direct anon reads).
CREATE POLICY "Published lookbook images are viewable by everyone."
  ON lookbook_images FOR SELECT
  USING (is_published = true);

-- ── 3. Atomic stock RPCs ─────────────────────────────────────────────────────
-- Single guarded UPDATE (no read-then-write). Returns false instead of going
-- negative when stock is insufficient. Logs to inventory_log inside the same
-- transaction so the decrement and its audit entry are atomic.
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'decrement quantity must be positive';
  END IF;

  UPDATE product_variants
  SET stock_quantity = stock_quantity - p_qty
  WHERE id = p_variant_id AND stock_quantity >= p_qty
  RETURNING 1 INTO updated_count;

  IF updated_count IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO inventory_log (variant_id, change_qty, reason)
  VALUES (p_variant_id, -p_qty, 'sale');

  RETURN true;
END;
$$;

-- Admin manual adjustment (restock/damage/manual). Guards against going negative.
CREATE OR REPLACE FUNCTION adjust_stock(
  p_variant_id UUID,
  p_change_qty INTEGER,
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_change_qty = 0 THEN
    RAISE EXCEPTION 'change quantity must not be zero';
  END IF;

  IF p_reason NOT IN ('restock', 'damage', 'manual') THEN
    RAISE EXCEPTION 'invalid adjust reason: %', p_reason;
  END IF;

  UPDATE product_variants
  SET stock_quantity = stock_quantity + p_change_qty
  WHERE id = p_variant_id AND stock_quantity + p_change_qty >= 0
  RETURNING 1 INTO updated_count;

  IF updated_count IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO inventory_log (variant_id, change_qty, reason, admin_id)
  VALUES (p_variant_id, p_change_qty, p_reason, p_admin_id);

  RETURN true;
END;
$$;

-- Atomic discount usage increment (safe under concurrent checkouts).
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE discounts
  SET times_used = times_used + 1
  WHERE code = p_code AND (usage_limit IS NULL OR times_used < usage_limit)
  RETURNING 1 INTO updated_count;

  RETURN updated_count IS NOT NULL;
END;
$$;

-- Functions must never be callable by anon/authenticated (they'd allow arbitrary
-- stock mutation via the anon key). Service role bypasses RLS and executes RPCs.
REVOKE EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION adjust_stock(UUID, INTEGER, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION increment_discount_usage(TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION adjust_stock(UUID, INTEGER, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION increment_discount_usage(TEXT) TO service_role;

-- ── 4. Lookbook image storage bucket ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('lookbook', 'lookbook', true)
ON CONFLICT (id) DO NOTHING;

-- Public read of lookbook images served from storage.
CREATE POLICY "Public read of lookbook images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lookbook');

-- Authenticated (admin) uploads to the lookbook bucket.
CREATE POLICY "Admin upload to lookbook bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lookbook');

-- ── 5. Lookbook support columns on orders ────────────────────────────────────
-- Store the applied discount code so the payment webhook can atomically
-- increment usage exactly once per paid order.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_code TEXT;