'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';

export interface LookbookImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_published: boolean;
  linked_product_id: string | null;
  products: { id: string; name: string; slug: string } | null;
}

interface LookbookManagerProps {
  images: LookbookImage[];
  products: Array<{ id: string; name: string }>;
}

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sz-red';

export default function LookbookManager({ images, products }: LookbookManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function api(
    path: string,
    init?: RequestInit
  ): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(path, init);
    const json = await res.json();
    return json as { success: boolean; error?: string };
  }

  async function handleUploaded(url: string) {
    setUploading(true);
    setError(null);
    try {
      const result = await api('/api/admin/lookbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, sort_order: images.length }),
      });
      if (!result.success) throw new Error(result.error || 'Failed to add image');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add image');
    } finally {
      setUploading(false);
    }
  }

  async function patch(id: string, updates: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const result = await api(`/api/admin/lookbook?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!result.success) throw new Error(result.error || 'Update failed');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function saveCaption(id: string, caption: string) {
    await patch(id, { caption: caption.trim() === '' ? null : caption.trim() });
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const a = images[index];
    const b = images[target];
    // Swap sort orders via two PATCHes, then re-fetch.
    await patch(a.id, { sort_order: b.sort_order });
    await patch(b.id, { sort_order: a.sort_order });
    router.refresh();
  }

  async function removeImage(image: LookbookImage) {
    if (!window.confirm(`Delete this lookbook image${image.caption ? ` (“${image.caption}”)` : ''}?`)) return;
    setBusyId(image.id);
    setError(null);
    try {
      const result = await api(`/api/admin/lookbook?id=${image.id}`, { method: 'DELETE' });
      if (!result.success) throw new Error(result.error || 'Delete failed');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Upload */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 border border-gray-800 rounded-lg">
        <p className="text-sm text-gray-400">Add a new image to the lookbook.</p>
        <ImageUploader bucket="lookbook" onUploaded={handleUploaded} />
      </div>

      {error && (
        <div className="mb-6 bg-red-950 border border-red-800 text-red-300 text-sm rounded px-4 py-3">{error}</div>
      )}

      {images.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-800 rounded p-10 text-center">
          <p className="text-gray-400">No lookbook images yet. Upload the first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={image.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="relative aspect-[3/4] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt={image.caption ?? `Lookbook image ${index + 1}`} className="w-full h-full object-cover" />
                {image.is_published && (
                  <span className="absolute top-3 left-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-900/80 text-green-300 border border-green-700">
                    Published
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Caption</label>
                  <input
                    className={inputClass}
                    defaultValue={image.caption ?? ''}
                    placeholder="No caption"
                    disabled={busyId === image.id}
                    onBlur={(e) => {
                      if ((e.target.value.trim() || null) !== image.caption) {
                        saveCaption(image.id, e.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Linked product</label>
                  <select
                    className={inputClass}
                    value={image.linked_product_id ?? ''}
                    disabled={busyId === image.id}
                    onChange={(e) => patch(image.id, { linked_product_id: e.target.value || null })}
                  >
                    <option value="">— None —</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0 || busyId === image.id}
                      onClick={() => moveImage(index, -1)}
                      className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 text-sm"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1 || busyId === image.id}
                      onClick={() => moveImage(index, 1)}
                      className="text-gray-400 hover:text-white disabled:opacity-30 px-2 py-1 text-sm"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <span className="text-xs text-gray-600 ml-1">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === image.id}
                      onClick={() => patch(image.id, { is_published: !image.is_published })}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors disabled:opacity-50 ${
                        image.is_published
                          ? 'bg-green-900/40 text-green-400 border-green-800 hover:bg-green-900/60'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      {image.is_published ? 'Published' : 'Unpublished'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === image.id}
                      onClick={() => removeImage(image)}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 disabled:opacity-50"
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="text-sm text-gray-500 mt-4">Adding image…</p>}
    </div>
  );
}