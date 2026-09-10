-- 00008_product_images_rls.sql
-- Explicitly enable RLS and public read access for product_images

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid errors
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public product images viewable by everyone." ON product_images;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

CREATE POLICY "Public product images viewable by everyone." ON product_images FOR SELECT USING (true);
