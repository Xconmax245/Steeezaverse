"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export default function CopyOrderNumber({ orderNumber, email }: { orderNumber: string, email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/10 bg-[#110505] p-6 sm:p-10 mt-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-sz-red/10 rounded-full flex items-center justify-center text-sz-red mb-6 border border-sz-red/20">
        <Copy size={24} />
      </div>
      
      <h3 className="font-chillax text-2xl font-bold uppercase tracking-widest mb-2 text-white">
        Save Your Order Number
      </h3>
      <p className="text-sm text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
        Because you checked out as a guest, you will need your <strong className="text-white">Order Number</strong> and <strong className="text-white">Email Address ({email})</strong> to track your order and receive updates from our team.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-black border border-white/10 p-2 pl-6 rounded-2xl w-full max-w-md mb-8">
        <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wider flex-1 text-center sm:text-left pt-2 sm:pt-0">
          {orderNumber}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-white text-black font-chillax font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-white/90 transition-all w-full sm:w-auto"
        >
          {copied ? (
            <>
              <Check size={16} /> Copied!
            </>
          ) : (
            <>
              <Copy size={16} /> Copy
            </>
          )}
        </button>
      </div>

      <Link 
        href="/track"
        className="inline-block bg-sz-red text-white px-10 py-4 font-chillax font-bold uppercase tracking-widest text-sm hover:bg-sz-red/90 transition-colors shadow-[0_0_20px_rgba(255,42,42,0.3)] hover:shadow-[0_0_30px_rgba(255,42,42,0.5)]"
      >
        Track Order Now
      </Link>
    </div>
  );
}
