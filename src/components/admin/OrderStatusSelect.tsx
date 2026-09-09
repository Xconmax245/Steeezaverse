'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus, ORDER_STATUSES } from '@/app/actions/order-actions';

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
      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sz-red disabled:opacity-50"
    >
      {ORDER_STATUSES.map((option) => (
        <option key={option} value={option} className="capitalize">
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  );
}