-- 00011_customer_visits_lightweight.sql

-- 1. Drop the heavy page_views table if it exists (it wasn't applied to prod but keeping this for safety)
DROP TABLE IF EXISTS page_views CASCADE;

-- 2. Add lightweight visit_count to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;

-- 3. Update the customer_spend_summary view to include visit_count
CREATE OR REPLACE VIEW customer_spend_summary AS
SELECT 
  c.id as customer_id,
  c.email,
  c.name,
  c.phone,
  c.whatsapp_number,
  c.is_banned,
  c.visit_count,
  c.created_at as account_created_at,
  COUNT(o.id) as order_count,
  COALESCE(SUM(o.total), 0) as lifetime_value,
  MAX(o.created_at) as last_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.payment_status = 'paid'
GROUP BY c.id;

-- 4. RPC to atomically increment visit_count without needing full table update access
CREATE OR REPLACE FUNCTION increment_customer_visit(customer_uid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customers SET visit_count = COALESCE(visit_count, 0) + 1 WHERE id = customer_uid;
END;
$$;
