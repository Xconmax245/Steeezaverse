"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/product-actions";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(productId);
    
    if (result.success) {
      setShowModal(false);
      router.refresh();
    } else {
      alert("Failed to delete product: " + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className="inline-block border border-[var(--red)]/20 bg-[var(--red)]/5 hover:bg-[var(--red)]/20 text-[var(--red)] rounded px-4 py-2 text-[10px] uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100 ml-2 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#080808] border border-white/10 rounded-xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-white text-lg font-bold font-chillax uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--red)] rounded-full inline-block" />
              Confirm Deletion
            </h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Are you absolutely sure you want to delete this product? This will permanently remove all associated variants and images. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="px-5 py-3 rounded text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-3 rounded bg-[var(--red)] text-white text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
