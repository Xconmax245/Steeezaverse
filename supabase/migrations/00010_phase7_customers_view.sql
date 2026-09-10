-- 00010_phase7_customers_view.sql

-- 1. Add is_banned column to customers table for server-side enforcement
ALTER TABLE customers ADD COLUMN is_banned BOOLEAN DEFAULT false;

-- 2. Create customer_spend_summary view for Admin Customers Dashboard
-- Calculates total lifetime value, order count, and last order date per customer
CREATE OR REPLACE VIEW customer_spend_summary AS
SELECT 
  c.id as customer_id,
  c.email,
  c.name,
  c.phone,
  c.whatsapp_number,
  c.is_banned,
  c.created_at as account_created_at,
  COUNT(o.id) as order_count,
  COALESCE(SUM(o.total), 0) as lifetime_value,
  MAX(o.created_at) as last_order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.payment_status = 'paid'
GROUP BY c.id;

-- 3. We also need to add an RPC so we can securely ban a user and invalidate their sessions
CREATE OR REPLACE FUNCTION admin_ban_customer(customer_uid UUID, ban_status BOOLEAN)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update custom customer table
  UPDATE customers SET is_banned = ban_status WHERE id = customer_uid;
  
  -- We don't directly manipulate auth.users inside this RPC since we can do it via Supabase Admin API 
  -- if we want to actually prevent them from logging in at the auth level. 
  -- But checking c.is_banned on protected routes is often sufficient.
END;
$$;
