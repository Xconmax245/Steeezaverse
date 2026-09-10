-- 00007_checkout_schema_updates.sql
-- Add full_name to addresses table to support proper shipping address handling for guests and logged-in users

ALTER TABLE addresses ADD COLUMN full_name TEXT;

-- For existing records (if any), populate full_name from customer if possible, or leave null
-- We'll just leave it nullable since we might have legacy records, or we can make it NOT NULL later.
