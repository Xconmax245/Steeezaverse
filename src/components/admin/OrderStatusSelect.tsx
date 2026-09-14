'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/app/actions/order-actions';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_COLORS: Record<string, string> = {
  pending:    'text-yellow-300',
  processing: 'text-blue-300',
  shipped:    'text-purple-300',
  delivered:  'text-green-400',
  cancelled:  'text-white/30',
  refunded:   'text-red-300',
};

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await updateOrderStatus(orderId, e.target.value);
          router.refresh();
        })
      }
      className={`bg-transparent border-none outline-none cursor-pointer text-xs font-chillax font-bold uppercase tracking-widest disabled:opacity-50 ${STATUS_COLORS[status] ?? 'text-white'}`}
    >
      {ORDER_STATUSES.map((option) => (
        <option key={option} value={option} className="bg-[#0a0a0a] text-white capitalize">
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  );
}