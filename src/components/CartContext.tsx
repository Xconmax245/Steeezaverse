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
    price_override?: number | null;
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
  addItem: (variantId: string, quantity?: number, openDrawer?: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
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
      try {
        if (typeof window === "undefined") return;
        
        let currentCartId = localStorage.getItem("stz_cart_id");
        
        if (!currentCartId) {
          // Create guest cart
          const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          const { data: newCart, error } = await (supabase as any)
            .from("carts")
            .insert({ session_id: sessionId })
            .select("id")
            .single();
            
          if (error) {
            console.error("Cart creation failed:", error);
          }
            
          if (newCart) {
            currentCartId = newCart.id;
            localStorage.setItem("stz_cart_id", currentCartId as string);
          }
        }

        if (active && currentCartId) {
          setCartId(currentCartId);
          await fetchItems(currentCartId);
        }
      } catch (err) {
        console.error("Cart init error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    initCart();
    return () => { active = false; };
  }, []);



  async function fetchItems(cId: string) {
    const { data } = await (supabase as any)
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

  async function addItem(variantId: string, quantity: number = 1, openDrawer: boolean = true) {
    if (!cartId) return;

    if (openDrawer) setIsOpen(true); // Open drawer on add

    const existingItem = items.find(i => i.variant_id === variantId);
    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      const { error } = await (supabase as any)
        .from("cart_items")
        .insert({ cart_id: cartId, variant_id: variantId, quantity });
      if (error) {
        console.error("Failed to add item:", error);
        alert("Failed to add to cart: " + error.message);
      }
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
    await (supabase as any)
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
  }

  async function removeItem(itemId: string) {
    // Optimistic update
    setItems(items.filter(i => i.id !== itemId));

    await (supabase as any)
      .from("cart_items")
      .delete()
      .eq("id", itemId);
  }

  async function clearCart() {
    setItems([]); // Clear in UI immediately
    if (cartId) {
      await (supabase as any).from("cart_items").delete().eq("cart_id", cartId);
      localStorage.removeItem("stz_cart_id");
      setCartId(null);
    }
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.product?.base_price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartId, items, isOpen, setIsOpen, addItem, updateQuantity, removeItem, clearCart, cartCount, subtotal, isLoading
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
