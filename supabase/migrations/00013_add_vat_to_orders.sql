-- 00013_add_vat_to_orders.sql
-- Add compulsory 500 Naira VAT charge to orders table

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS vat NUMERIC(10, 2) DEFAULT 500.00;

COMMENT ON COLUMN orders.vat IS 'Compulsory VAT charge in NGN applied to all orders';
