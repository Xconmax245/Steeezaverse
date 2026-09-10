"use client";

import { useState } from "react";
import { toggleDiscountActive, deleteDiscount } from "@/app/actions/discount-actions";
import { Trash2 } from "lucide-react";

type Discount = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_value: number | null;
  times_used: number;
  usage_limit: number | null;
  expires_at: string | null;
  active: boolean;
};

export default function DiscountRow({ discount }: { discount: Discount }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    await toggleDiscountActive(discount.id, discount.active);
    setIsToggling(false);
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this discount?")) return;
    setIsDeleting(true);
    const res = await deleteDiscount(discount.id);
    if (!res.success) {
      alert(res.error);
    }
    setIsDeleting(false);
  }

  const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
  const limitReached = discount.usage_limit && discount.times_used >= discount.usage_limit;
  
  let statusBadge = null;
  if (isExpired) {
    statusBadge = <span className="bg-white/10 text-white/60 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Expired</span>;
  } else if (limitReached) {
    statusBadge = <span className="bg-white/10 text-white/60 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Limit Reached</span>;
  } else if (!discount.active) {
    statusBadge = <span className="bg-sz-red/20 text-sz-red px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Inactive</span>;
  } else {
    statusBadge = <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold">Active</span>;
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="p-4 align-middle">
        <div className="font-bold text-white uppercase tracking-widest text-sm">{discount.code}</div>
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/60 text-sm">
          {discount.discount_type === "percentage" 
            ? `${discount.discount_value}%` 
            : `₦${discount.discount_value.toLocaleString("en-NG")}`}
        </div>
        {discount.min_order_value && (
          <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
            Min ₦{discount.min_order_value.toLocaleString("en-NG")}
          </div>
        )}
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/80 text-sm font-medium">
          {discount.times_used} {discount.usage_limit ? `/ ${discount.usage_limit}` : ""}
        </div>
      </td>
      <td className="p-4 align-middle">
        {discount.expires_at ? new Date(discount.expires_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-white/30">—</span>}
      </td>
      <td className="p-4 align-middle text-center">
        {statusBadge}
      </td>
      <td className="p-4 align-middle text-right">
        <div className="flex justify-end gap-3 items-center">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors disabled:opacity-50"
          >
            {discount.active ? "Pause" : "Activate"}
          </button>
          
          {discount.times_used === 0 && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-sz-red transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
