'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProduct,
  updateProduct,
  type ProductFormInput,
} from '@/app/actions/product-actions';
import ImageUploader from '@/components/admin/ImageUploader';
import { motion } from 'framer-motion';

interface InitialProduct {
  product: {
    name: string;
    slug: string;
    description: string | null;
    materials: string | null;
    care_instructions: string | null;
    base_price: number;
    compare_at_price: number | null;
    status: string;
    is_featured: boolean;
    is_drop: boolean;
    drop_starts_at: string | null;
    drop_ends_at: string | null;
  };
  variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    sku: string | null;
    stock_quantity: number;
    price_override: number | null;
  }>;
  images: Array<{ id: string; url: string; alt_text: string | null }>;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initial?: InitialProduct | null;
}

interface VariantDraft {
  id?: string;
  size: string;
  color: string;
  sku: string;
  stock_quantity: string;
  price_override: string;
}

interface ImageDraft {
  id?: string;
  url: string;
  alt_text: string;
}

function toInputValue(v: number | null | undefined): string {
  return v === null || v === undefined || Number.isNaN(v) ? '' : String(v);
}

function toDateTimeLocal(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 16) : '';
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSkuPlaceholder(name: string, size: string, color: string): string {
  const prefix = name
    ? name.split(/[\s-]+/).map(w => w[0]).join('').substring(0, 3).toUpperCase()
    : 'SZ';
  const s = size ? size.toUpperCase().replace(/\s+/g, '') : 'SIZE';
  const c = color ? color.toUpperCase().replace(/[AEIOU\s]+/g, '').substring(0, 3) : 'CLR';
  return `${prefix || 'SZ'}-${s}-${c}`;
}

const inputClass =
  'w-full bg-white/[0.02] border border-white/10 rounded-md px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sz-red focus:bg-white/[0.05] transition-all duration-300';
const labelClass = 'block text-[10px] uppercase tracking-wider text-white/50 mb-2';
const sectionClass = 'bg-white/[0.01] border border-white/5 p-8 rounded-xl relative overflow-hidden';
const sectionHeaderClass = 'font-chillax uppercase tracking-widest text-lg font-bold mb-8 text-white flex items-center gap-4';

export default function ProductForm({ mode, productId, initial }: ProductFormProps) {
  const router = useRouter();
  const p = initial?.product;

  const [name, setName] = useState(p?.name ?? '');
  const [slug, setSlug] = useState(p?.slug ?? '');
  const slugTouched = useRef(Boolean(p?.slug));
  const [description, setDescription] = useState(p?.description ?? '');
  const [materials, setMaterials] = useState(p?.materials ?? '');
  const [careInstructions, setCareInstructions] = useState(p?.care_instructions ?? '');
  const [basePrice, setBasePrice] = useState(toInputValue(p?.base_price));
  const [compareAtPrice, setCompareAtPrice] = useState(toInputValue(p?.compare_at_price));
  const [status, setStatus] = useState<'draft' | 'published'>((p?.status as 'draft' | 'published') ?? 'draft');
  const [isFeatured, setIsFeatured] = useState(p?.is_featured ?? false);
  const [isDrop, setIsDrop] = useState(p?.is_drop ?? false);
  const [dropStartsAt, setDropStartsAt] = useState(toDateTimeLocal(p?.drop_starts_at));
  const [dropEndsAt, setDropEndsAt] = useState(toDateTimeLocal(p?.drop_ends_at));

  const [variants, setVariants] = useState<VariantDraft[]>(
    (initial?.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size ?? '',
      color: v.color ?? '',
      sku: v.sku ?? '',
      stock_quantity: toInputValue(v.stock_quantity),
      price_override: toInputValue(v.price_override),
    }))
  );

  const [images, setImages] = useState<ImageDraft[]>(
    (initial?.images ?? []).map((img) => ({ id: img.id, url: img.url, alt_text: img.alt_text ?? '' }))
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched.current) setSlug(slugify(value));
  }

  function updateVariant(index: number, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function updateImage(index: number, patch: Partial<ImageDraft>) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: ProductFormInput = {
      name,
      slug,
      description,
      materials,
      care_instructions: careInstructions,
      base_price: basePrice,
      compare_at_price: compareAtPrice,
      status,
      is_featured: isFeatured,
      is_drop: isDrop,
      drop_starts_at: dropStartsAt,
      drop_ends_at: dropEndsAt,
      variants,
      images,
    };

    const result =
      mode === 'edit' && productId ? await updateProduct(productId, input) : await createProduct(input);

    if (!result.success) {
      setError(result.error || 'Something went wrong saving the product.');
      setSubmitting(false);
      return;
    }

    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 w-full pb-20">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sz-red/10 border border-sz-red text-sz-red text-xs uppercase tracking-wider rounded-md px-6 py-4"
        >
          {error}
        </motion.div>
      )}

      {/* ── Basic details ── */}
      <section className={sectionClass}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        <h3 className={sectionHeaderClass}>
          <span className="w-2 h-2 bg-sz-red rounded-full block" />
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="name">Name *</label>
            <input id="name" className={inputClass} value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Oversized Hoodie — Midnight" required />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="slug">Slug</label>
            <input id="slug" className={inputClass} value={slug} onChange={(e) => { setSlug(e.target.value); slugTouched.current = true; }} placeholder="auto-generated from name" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea id="description" className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." />
          </div>
          <div>
            <label className={labelClass} htmlFor="materials">Materials</label>
            <input id="materials" className={inputClass} value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="e.g. 100% heavyweight cotton" />
          </div>
          <div>
            <label className={labelClass} htmlFor="care">Care Instructions</label>
            <input id="care" className={inputClass} value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} placeholder="e.g. Machine wash cold" />
          </div>
          <div>
            <label className={labelClass} htmlFor="base_price">Base Price (NGN) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₦</span>
              <input id="base_price" type="number" min="0" step="0.01" className={`${inputClass} pl-8`} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="compare_at_price">Compare-at Price (NGN)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">₦</span>
              <input id="compare_at_price" type="number" min="0" step="0.01" className={`${inputClass} pl-8`} value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Optional discount reference" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Status & visibility ── */}
      <section className={sectionClass}>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sz-red/5 rounded-full blur-[100px] pointer-events-none" />
        <h3 className={sectionHeaderClass}>
          <span className="w-2 h-2 bg-sz-red rounded-full block" />
          Status &amp; Visibility
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="bg-white/[0.02] border border-white/10 p-5 rounded-md">
            <label className={labelClass}>Publication Status</label>
            <div className="flex gap-3 mt-3">
              <button 
                type="button" 
                onClick={() => setStatus('draft')} 
                className={`flex-1 rounded-md px-4 py-2.5 text-xs uppercase tracking-wider border transition-all duration-300 ${status === 'draft' ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'}`}
              >
                Draft
              </button>
              <button 
                type="button" 
                onClick={() => setStatus('published')} 
                className={`flex-1 rounded-md px-4 py-2.5 text-xs uppercase tracking-wider border transition-all duration-300 ${status === 'published' ? 'bg-sz-red/10 border-sz-red text-sz-red' : 'bg-transparent border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'}`}
              >
                Published
              </button>
            </div>
            {status === 'published' && (
              <p className="text-[10px] uppercase tracking-wider text-sz-red mt-3">Requires at least one variant with stock.</p>
            )}
          </div>
          
          <div className="flex flex-col gap-4 justify-center bg-white/[0.02] border border-white/10 p-5 rounded-md">
            <label className="flex items-center gap-3 text-xs uppercase tracking-wider text-white/70 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isFeatured ? 'bg-sz-red border-sz-red' : 'bg-white/5 border-white/10 group-hover:border-white/30'}`}>
                {isFeatured && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="hidden" />
              Featured <span className="text-white/30 text-[9px]">(Homepage Mini-Shop)</span>
            </label>
            
            <label className="flex items-center gap-3 text-xs uppercase tracking-wider text-white/70 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDrop ? 'bg-sz-red border-sz-red' : 'bg-white/5 border-white/10 group-hover:border-white/30'}`}>
                {isDrop && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="checkbox" checked={isDrop} onChange={(e) => setIsDrop(e.target.checked)} className="hidden" />
              Time-gated Drop
            </label>
          </div>

          {isDrop && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-sz-red/5 border border-sz-red/10 p-5 rounded-md mt-[-10px]">
              <div>
                <label className={labelClass} htmlFor="drop_starts_at">Drop Starts At</label>
                <input id="drop_starts_at" type="datetime-local" className={inputClass} value={dropStartsAt} onChange={(e) => setDropStartsAt(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="drop_ends_at">Drop Ends At</label>
                <input id="drop_ends_at" type="datetime-local" className={inputClass} value={dropEndsAt} onChange={(e) => setDropEndsAt(e.target.value)} />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Variants ── */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={`${sectionHeaderClass} !mb-0`}>
            <span className="w-2 h-2 bg-sz-red rounded-full block" />
            Variants
          </h3>
          <button 
            type="button" 
            onClick={() => setVariants((prev) => [...prev, { size: '', color: '', sku: '', stock_quantity: '', price_override: '' }])} 
            className="border border-white/20 bg-white/5 rounded-md px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/40 transition-all"
            data-cuelume-hover="tick"
          >
            + Add Variant
          </button>
        </div>
        
        {variants.length === 0 && (
          <div className="border border-dashed border-white/10 rounded-lg p-10 flex items-center justify-center bg-white/[0.02]">
            <p className="text-xs uppercase tracking-widest text-white/30">No variants yet — fine while drafting.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {variants.map((v, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              key={index} 
              className="grid grid-cols-2 md:grid-cols-6 gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors relative group"
            >
              <div>
                <label className={labelClass}>Size</label>
                <input className={inputClass} value={v.size} onChange={(e) => updateVariant(index, { size: e.target.value })} placeholder="M" />
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <input className={inputClass} value={v.color} onChange={(e) => updateVariant(index, { color: e.target.value })} placeholder="Black" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>SKU</label>
                <input className={inputClass} value={v.sku} onChange={(e) => updateVariant(index, { sku: e.target.value })} placeholder={generateSkuPlaceholder(name, v.size, v.color)} />
              </div>
              <div>
                <label className={labelClass}>Stock</label>
                <input type="number" min="0" className={inputClass} value={v.stock_quantity} onChange={(e) => updateVariant(index, { stock_quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="relative">
                <label className={labelClass}>Price override</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={v.price_override} onChange={(e) => updateVariant(index, { price_override: e.target.value })} placeholder="optional" />
                <button 
                  type="button" 
                  onClick={() => setVariants((prev) => prev.filter((_, i) => i !== index))} 
                  className="absolute -right-3 -top-3 bg-red-950 border border-sz-red text-sz-red rounded-full w-6 h-6 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sz-red hover:text-white"
                  title="Remove variant"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Images ── */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`${sectionHeaderClass} !mb-2`}>
              <span className="w-2 h-2 bg-sz-red rounded-full block" />
              Media
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              Primary image (1st) | Hover-swap image (2nd)
            </p>
          </div>
          <ImageUploader onUploaded={(url) => setImages((prev) => [...prev, { url, alt_text: '' }])} />
        </div>
        
        {images.length === 0 && (
          <div className="border border-dashed border-white/10 rounded-lg p-10 flex items-center justify-center bg-white/[0.02]">
            <p className="text-xs uppercase tracking-widest text-white/30">No images yet.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {images.map((img, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              key={index} 
              className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:border-white/10 transition-colors"
            >
              <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt_text || `Product image ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-wider">No Img</div>
                )}
                <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white/80 font-bold">
                  {index === 0 ? 'PRIMARY' : index === 1 ? 'HOVER' : `#${index + 1}`}
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>URL</label>
                  <input className={inputClass} value={img.url} onChange={(e) => updateImage(index, { url: e.target.value })} placeholder="Image URL (or upload above)" />
                </div>
                <div>
                  <label className={labelClass}>Alt Text</label>
                  <input className={inputClass} value={img.alt_text} onChange={(e) => updateImage(index, { alt_text: e.target.value })} placeholder="Describe the image" />
                </div>
              </div>
              
              <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
                <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="text-white/30 hover:text-white disabled:opacity-20 transition-colors" title="Move up">▲</button>
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))} className="text-sz-red/50 hover:text-sz-red transition-colors my-1" title="Remove">✕</button>
                <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} className="text-white/30 hover:text-white disabled:opacity-20 transition-colors" title="Move down">▼</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="fixed bottom-0 left-64 right-0 p-6 bg-black/80 backdrop-blur-xl border-t border-white/10 flex gap-4 justify-end z-50">
        <button 
          type="button" 
          onClick={() => router.push('/admin/products')} 
          className="border border-white/10 bg-transparent py-3 px-8 text-xs font-bold uppercase tracking-widest rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          data-cuelume-hover="tick"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={submitting} 
          className="bg-sz-red text-white py-3 px-8 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-sz-red-dim disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(255,51,51,0.2)] hover:shadow-[0_0_30px_rgba(255,51,51,0.4)]"
          data-cuelume-hover="tick"
          data-cuelume-press
        >
          {submitting ? 'Authenticating...' : mode === 'edit' ? 'Save Changes' : 'Initialize Product'}
        </button>
      </div>
    </form>
  );
}