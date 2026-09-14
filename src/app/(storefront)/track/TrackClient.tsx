"use client";

import React, { useState } from 'react';
import { trackOrderAction } from '@/app/actions/trackOrder';
import { Loader2, Search, Package, MapPin, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

export default function TrackClient() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await trackOrderAction(orderNumber, email);
    
    if (res.error) {
      setError(res.error);
    } else {
      setOrderData(res.order);
      setCustomerData(res.customer);
    }
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'processing': return 'text-blue-500 bg-blue-500/10';
      case 'shipped': return 'text-purple-500 bg-purple-500/10';
      case 'delivered': return 'text-green-500 bg-green-500/10';
      case 'cancelled': return 'text-red-500 bg-red-500/10';
      default: return 'text-white/60 bg-white/5';
    }
  };

  if (orderData) {
    return (
      <div className="w-full bg-[#110505]/80 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => { setOrderData(null); setOrderNumber(''); }}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Track Another Order
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold font-chillax">{orderData.order_number}</h2>
            <p className="text-white/50 text-sm mt-1">Placed on {format(new Date(orderData.created_at), 'MMMM d, yyyy')}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(orderData.status)}`}>
            {orderData.status}
          </span>
        </div>

        {/* Notifications Timeline */}
        {orderData.order_notifications && orderData.order_notifications.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-bold font-chillax mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-sz-red" /> 
              Updates & Notifications
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
              {orderData.order_notifications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((note: any, i: number) => (
                <div key={note.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#110505] text-white/50 group-[.is-active]:text-sz-red group-[.is-active]:border-sz-red shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Clock size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</div>
                    <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{note.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-lg font-bold font-chillax mb-4 flex items-center gap-2">
            <Package size={18} /> 
            Items
          </h3>
          <div className="space-y-4">
            {orderData.order_items.map((item: any) => {
              const image = item.variant?.product?.product_images?.[0]?.url;
              const name = item.variant?.product?.name;
              return (
                <div key={item.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="relative w-16 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0">
                    {image ? (
                      <Image src={image} alt={name || 'Product'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{name}</h4>
                    <div className="text-xs text-white/50 mt-1 flex gap-2">
                      {item.variant?.size && <span>Size: {item.variant.size}</span>}
                      {item.variant?.color && <span>Color: {item.variant.color}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">₦{item.unit_price}</div>
                    <div className="text-xs text-white/50">Qty: {item.quantity}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-5 rounded-xl border border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white/60 mb-2 flex items-center gap-2">
              <MapPin size={14} /> Shipping Info
            </h3>
            <p className="text-sm font-medium">{customerData.name}</p>
            <p className="text-sm text-white/70">{customerData.email}</p>
            {/* Note: Full shipping address is on the order table but we may not have it loaded in the query. For now, this suffices to show it's their order. */}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>₦{orderData.subtotal}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
              <span>Total</span>
              <span>₦{orderData.total}</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-transparent rounded-2xl border border-white/5 p-6 md:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
          <span className="font-chillax">{error}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-chillax font-bold text-white/50 uppercase tracking-widest mb-2">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. STZ-123456"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-white font-chillax placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors uppercase"
            required
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-chillax font-bold text-white/50 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Used at checkout"
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3.5 text-white font-chillax placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !orderNumber || !email}
          className="w-full h-12 bg-white text-black font-chillax font-bold uppercase tracking-widest text-xs rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Search size={16} /> Track Order
            </>
          )}
        </button>
      </div>
    </form>
  );
}
