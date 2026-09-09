"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/product-actions";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    const result = await deleteProduct(productId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to delete product: " + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-block border border-[var(--red)]/20 bg-[var(--red)]/5 hover:bg-[var(--red)]/20 text-[var(--red)] rounded px-4 py-2 text-[10px] uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 ml-2 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
