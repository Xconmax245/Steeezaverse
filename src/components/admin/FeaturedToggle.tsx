'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleProductFeatured } from '@/app/actions/product-actions';

export default function FeaturedToggle({ productId, isFeatured }: { productId: string; isFeatured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleProductFeatured(productId, !isFeatured);
          router.refresh();
        })
      }
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors disabled:opacity-50 ${
        isFeatured
          ? 'bg-sz-red/20 text-sz-red border-sz-red/40 hover:bg-sz-red/30'
          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
      }`}
      title={isFeatured ? 'Click to remove from Mini-Shop' : 'Click to feature in Mini-Shop'}
    >
      {pending ? '…' : isFeatured ? '★ Featured' : '☆ Not featured'}
    </button>
  );
}