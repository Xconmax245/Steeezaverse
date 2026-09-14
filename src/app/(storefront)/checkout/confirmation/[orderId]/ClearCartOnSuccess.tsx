"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabase/client";

export default function ClearCartOnSuccess({ cartId }: { cartId?: string }) {
  const { items, removeItem } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;

    // Always clear directly from Supabase by cartId — this is the reliable path
    // regardless of whether CartContext has loaded its items yet.
    if (cartId) {
      (supabase as any)
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .then(() => {
          // Also clear localStorage cart reference so a new cart is created next visit
          localStorage.removeItem("stz_cart_id");
        });
    }

    // Belt-and-suspenders: also remove via context for immediate UI update
    if (items.length > 0) {
      items.forEach((item) => removeItem(item.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  return null;
}
