"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  variant?: {
    id: string;
    size: string | null;
    color: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      base_price: number;
      product_images: { url: string }[];
    };
  };
}

interface CartContextType {
  cartId: string | null;
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  cartCount: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Cart
  useEffect(() => {
    let active = true;

    async function initCart() {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      const customerId = session?.user?.id;
      
      // Get or create cart
      let currentCartId = localStorage.getItem("stz_cart_id");
      
      // If logged in, fetch customer cart
      if (customerId) {
        const { data: customerCarts } = await supabase
          .from("carts")
          .select("id")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (customerCarts && customerCarts.length > 0) {
          const userCartId = customerCarts[0].id;
          
          // Merge logic if guest cart exists and is different
          if (currentCartId && currentCartId !== userCartId) {
            await mergeGuestCart(currentCartId, userCartId);
            localStorage.removeItem("stz_cart_id");
          }
          
          currentCartId = userCartId;
        } else {
          // Create customer cart
          const { data: newCart } = await supabase
            .from("carts")
            .insert({ customer_id: customerId })
            .select("id")
            .single();
            
          if (newCart) currentCartId = newCart.id;
        }
      } else if (!currentCartId) {
        // Create guest cart
        const sessionId = crypto.randomUUID();
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ session_id: sessionId })
          .select("id")
          .single();
          
        if (newCart) {
          currentCartId = newCart.id;
          localStorage.setItem("stz_cart_id", currentCartId);
        }
      }

      if (active && currentCartId) {
        setCartId(currentCartId);
        await fetchItems(currentCartId);
      }
      if (active) setIsLoading(false);
    }

    initCart();
    return () => { active = false; };
  }, []);

  async function mergeGuestCart(guestCartId: string, userCartId: string) {
    // 1. Fetch guest items
    const { data: guestItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", guestCartId);
      
    if (!guestItems || guestItems.length === 0) return;

    // 2. Fetch user items
    const { data: userItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", userCartId);
      
    const userItemsMap = new Map(userItems?.map(item => [item.variant_id, item]) || []);

    // 3. Merge quantities for matching variants, insert new ones
    for (const gItem of guestItems) {
      const existing = userItemsMap.get(gItem.variant_id);
      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + gItem.quantity })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({
            cart_id: userCartId,
            variant_id: gItem.variant_id,
            quantity: gItem.quantity
          });
      }
    }

    // 4. Delete guest cart
    await supabase.from("carts").delete().eq("id", guestCartId);
  }

  async function fetchItems(cId: string) {
    const { data } = await supabase
      .from("cart_items")
      .select(`
        id, cart_id, variant_id, quantity,
        variant:product_variants (
          id, size, color,
          product:products (
            id, name, slug, base_price,
            product_images (url)
          )
        )
      `)
      .eq("cart_id", cId)
      // Filter out products without images to avoid complex sorting in simple context, 
      // or we can sort them client side. We just take whatever comes back.
      .order('id', { ascending: true });

    if (data) {
      // Clean up the deep join format
      const mapped = data.map((item: any) => ({
        ...item,
        variant: item.variant ? {
          ...item.variant,
          product: {
            ...item.variant.product,
            product_images: item.variant.product.product_images || []
          }
        } : undefined
      }));
      setItems(mapped);
    }
  }

  async function addItem(variantId: string, quantity: number = 1) {
    if (!cartId) return;

    // Optimistic UI could be added here
    setIsOpen(true); // Open drawer on add

    const existingItem = items.find(i => i.variant_id === variantId);
    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, variant_id: variantId, quantity });
      await fetchItems(cartId);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    // Optimistic update
    setItems(items.map(i => i.id === itemId ? { ...i, quantity } : i));

    // Supabase update (should be debounced in a real heavy production, but for now direct is ok)
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
  }

  async function removeItem(itemId: string) {
    // Optimistic update
    setItems(items.filter(i => i.id !== itemId));

    await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.product?.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartId, items, isOpen, setIsOpen, addItem, updateQuantity, removeItem, cartCount, subtotal, isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
