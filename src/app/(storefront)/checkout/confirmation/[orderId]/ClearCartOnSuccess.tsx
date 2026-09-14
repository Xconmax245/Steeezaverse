"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabase/client";

export default function ClearCartOnSuccess({ cartId }: { cartId?: string }) {
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
