'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '@/components/admin/ImageUploader';
import { ArrowUp, ArrowDown, Trash2, Link as LinkIcon, Edit2, ChevronDown } from 'lucide-react';

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
  'w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors';

export default function LookbookManager({ images, products }: LookbookManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<LookbookImage | null>(null);

  async function api(
    path: string,
    init?: RequestInit
  ): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(path, init);
    const json = await res.json();
    return json as { success: boolean; error?: string };
  }

  async function handleUploadedMultiple(urls: string[]) {
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const result = await api('/api/admin/lookbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: url, sort_order: images.length + i }),
        });
        if (!result.success) throw new Error(result.error || 'Failed to add image');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add images');
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

  async function confirmRemoveImage() {
    if (!imageToDelete) return;
    setBusyId(imageToDelete.id);
    setError(null);
    try {
      const result = await api(`/api/admin/lookbook?id=${imageToDelete.id}`, { method: 'DELETE' });
      if (!result.success) throw new Error(result.error || 'Delete failed');
      setImageToDelete(null);
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
        <p className="text-sm text-gray-400">Add new images to the lookbook. You can select multiple files.</p>
        <ImageUploader bucket="lookbook" multiple={true} onUploadedMultiple={handleUploadedMultiple} />
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
            <div key={image.id} className="group flex flex-col bg-[#0a0a0a] border border-white/[0.04] hover:border-white/[0.08] transition-colors rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[3/4] bg-black overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.image_url} alt={image.caption ?? `Lookbook image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
                {image.is_published && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    Live
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-1 p-5 space-y-5">
                <div className="space-y-4 flex-1">
                  {/* Caption */}
                  <div className="relative">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2">
                      <Edit2 size={12} /> Caption
                    </label>
                    <input
                      className="w-full bg-transparent border-b border-white/10 focus:border-white/40 pb-2 px-0 text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
                      defaultValue={image.caption ?? ''}
                      placeholder="Add an editorial caption..."
                      disabled={busyId === image.id}
                      onBlur={(e) => {
                        if ((e.target.value.trim() || null) !== image.caption) {
                          saveCaption(image.id, e.target.value);
                        }
                      }}
                    />
                  </div>

                  {/* Linked Product */}
                  <div className="relative">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-white/40 mb-2">
                      <LinkIcon size={12} /> Linked Product
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                        value={image.linked_product_id ?? ''}
                        disabled={busyId === image.id}
                        onChange={(e) => patch(image.id, { linked_product_id: e.target.value || null })}
                      >
                        <option value="">— No product linked —</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.05] rounded-lg p-1">
                    <button
                      type="button"
                      disabled={index === 0 || busyId === image.id}
                      onClick={() => moveImage(index, -1)}
                      className="text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded px-1.5 py-1 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <span className="text-[10px] font-mono text-white/30 px-1">{(index + 1).toString().padStart(2, '0')}</span>
                    <button
                      type="button"
                      disabled={index === images.length - 1 || busyId === image.id}
                      onClick={() => moveImage(index, 1)}
                      className="text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded px-1.5 py-1 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === image.id}
                      onClick={() => patch(image.id, { is_published: !image.is_published })}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
                        image.is_published
                          ? 'bg-transparent text-white/50 border border-white/10 hover:border-white/30 hover:text-white'
                          : 'bg-white text-black hover:bg-gray-200'
                      }`}
                    >
                      {image.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === image.id}
                      onClick={() => setImageToDelete(image)}
                      className="text-sz-red hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && <p className="text-sm text-gray-500 mt-4">Adding images…</p>}

      {/* Deletion Modal */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#080808] border border-white/10 rounded-xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-white text-lg font-bold font-chillax uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--red)] rounded-full inline-block" />
              Confirm Deletion
            </h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this lookbook image{imageToDelete.caption ? ` ("${imageToDelete.caption}")` : ''}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setImageToDelete(null)}
                disabled={busyId === imageToDelete.id}
                className="px-5 py-3 rounded text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveImage}
                disabled={busyId === imageToDelete.id}
                className="px-5 py-3 rounded bg-[var(--red)] text-white text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
              >
                {busyId === imageToDelete.id ? "Deleting..." : "Yes, Delete Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}