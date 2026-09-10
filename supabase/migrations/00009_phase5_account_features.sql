-- 00009_phase5_account_features.sql

-- 1. Add whatsapp_number to customers
ALTER TABLE customers ADD COLUMN whatsapp_number TEXT;

-- 2. Create customer_notifications table
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS for customer_notifications
ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;

-- Customers can only SELECT their own notifications
CREATE POLICY "Customers can view their own notifications"
ON customer_notifications
FOR SELECT
USING (customer_id = auth.uid());

-- Prevent all client-side inserts, updates, and deletes
-- (They are handled by server actions / service role which bypass RLS)
-- No policies for INSERT, UPDATE, DELETE are created, so they default to blocked.

-- We also need a way for customers to mark notifications as read.
-- We can create an RPC to mark a specific notification as read to prevent generic UPDATEs.
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customer_notifications
  SET is_read = true
  WHERE id = notification_id
    AND customer_id = auth.uid();
END;
$$;
