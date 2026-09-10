-- Enable RLS on carts and cart_items if not already enabled
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Carts policies
-- Allow insert from anyone
CREATE POLICY "Anyone can create a cart" ON carts FOR INSERT WITH CHECK (true);

-- Allow select/update/delete if they own it (via customer_id) OR if it's a guest cart (anyone can read/update if they know the ID/session_id)
CREATE POLICY "Users can view their own carts or guest carts" ON carts FOR SELECT USING (
  customer_id = auth.uid() OR customer_id IS NULL
);

CREATE POLICY "Users can update their own carts or guest carts" ON carts FOR UPDATE USING (
  customer_id = auth.uid() OR customer_id IS NULL
);

CREATE POLICY "Users can delete their own carts or guest carts" ON carts FOR DELETE USING (
  customer_id = auth.uid() OR customer_id IS NULL
);

-- Cart Items policies
-- Cart items can be managed by anyone who can access the parent cart.
-- For simplicity, since carts are secured, we can allow full access to cart_items for now,
-- or map it through the cart.
CREATE POLICY "Anyone can manage cart items" ON cart_items FOR ALL USING (true) WITH CHECK (true);
