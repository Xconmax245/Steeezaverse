"use client";

import { useState } from "react";
import { MessageCircle, Ban, ShieldCheck } from "lucide-react";
import { toggleCustomerBan } from "@/app/actions/customer-actions";

type CustomerSummary = {
  customer_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  is_banned: boolean;
  visit_count: number | null;
  account_created_at: string;
  order_count: number;
  lifetime_value: number;
  last_order_date: string | null;
};

export default function CustomerRow({ customer }: { customer: CustomerSummary }) {
  const [isBanned, setIsBanned] = useState(customer.is_banned);
  const [isToggling, setIsToggling] = useState(false);

  async function handleToggleBan() {
    if (!window.confirm(`Are you sure you want to ${isBanned ? "unban" : "ban"} this customer?`)) return;
    
    setIsToggling(true);
    const res = await toggleCustomerBan(customer.customer_id, isBanned);
    if (res.success) {
      setIsBanned(!isBanned);
    } else {
      alert(res.error);
    }
    setIsToggling(false);
  }

  const hasWhatsApp = !!customer.whatsapp_number;
  const contactLink = hasWhatsApp 
    ? `https://wa.me/${customer.whatsapp_number?.replace(/\D/g, '')}`
    : `mailto:${customer.email}`;

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <td className="p-4 align-middle">
        <div className="font-bold text-white uppercase tracking-widest text-sm truncate max-w-[200px]" title={customer.email}>
          {customer.name || customer.email.split("@")[0]}
        </div>
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/80 text-xs font-bold tracking-widest uppercase truncate max-w-[200px]">
          {customer.phone || customer.whatsapp_number || "—"}
        </div>
        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
          {customer.email}
        </div>
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/80 text-sm font-bold font-chillax tracking-widest">
          ₦{Number(customer.lifetime_value).toLocaleString("en-NG")}
        </div>
        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
          {customer.order_count} Orders
        </div>
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/80 text-sm font-bold tracking-widest">
          {customer.visit_count || 0}
        </div>
      </td>
      <td className="p-4 align-middle">
        <div className="text-white/60 text-xs uppercase tracking-widest">
          {customer.last_order_date 
            ? new Date(customer.last_order_date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
            : <span className="text-white/30">—</span>}
        </div>
      </td>
      <td className="p-4 align-middle text-center">
        {isBanned ? (
          <span className="bg-sz-red/20 text-sz-red px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 w-fit mx-auto">
            <Ban size={10} /> Banned
          </span>
        ) : (
          <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 w-fit mx-auto">
            <ShieldCheck size={10} /> Active
          </span>
        )}
      </td>
      <td className="p-4 align-middle text-right">
        <div className="flex justify-end gap-2 items-center">
          <a
            href={contactLink}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-[#25D366] bg-white/5 hover:bg-[#25D366]/10 rounded transition-colors"
            title={hasWhatsApp ? "Message on WhatsApp" : "Send Email"}
          >
            <MessageCircle size={14} />
          </a>
          
          <button
            onClick={handleToggleBan}
            disabled={isToggling}
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
              isBanned 
                ? "text-white/60 hover:text-white bg-white/5 hover:bg-white/10" 
                : "text-sz-red/80 hover:text-white bg-sz-red/10 hover:bg-sz-red"
            }`}
          >
            {isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      </td>
    </tr>
  );
}
