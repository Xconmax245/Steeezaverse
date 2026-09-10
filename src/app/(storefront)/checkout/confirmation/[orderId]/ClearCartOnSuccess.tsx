"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartContext";

export default function ClearCartOnSuccess({ cartId }: { cartId?: string }) {
  const { items, removeItem } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    // Only clear once
    if (clearedRef.current) return;
    
    // Only clear if we have an active cart with items
    if (items.length > 0) {
      clearedRef.current = true;
      
      // Wipe the cart items using context
      items.forEach(item => {
        removeItem(item.id);
      });
    }
  }, [items, removeItem]);

  return null;
}
