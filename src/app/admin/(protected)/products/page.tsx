import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import FeaturedToggle from '@/components/admin/FeaturedToggle';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export const dynamic = 'force-dynamic';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  status: string;
  is_featured: boolean;
  is_drop: boolean;
  updated_at: string;
  product_variants: Array<{ stock_quantity: number }>;
  product_images: Array<{ id: string }>;
}

function formatNGN(value: number): string {
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

export default async function AdminProductsPage() {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('products')
    .select(
      `id, name, slug, base_price, compare_at_price, status, is_featured, is_drop, updated_at,
       product_variants(id, stock_quantity), product_images(id)`
    )
    .order('updated_at', { ascending: false });

  if (error) {
    return (
      <div className="bg-sz-red/10 border border-sz-red text-sz-red text-xs uppercase tracking-wider rounded-md px-6 py-4">
        Failed to load products: {error.message}
      </div>
    );
  }

  const products = (data ?? []) as ProductRow[];

  return (
    <div className="w-full relative">
      {/* Background glow effects matching the Steezaverse admin aesthetic */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sz-red/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 flex items-center justify-between mb-8">
        <h2 className="font-chillax uppercase tracking-widest text-2xl font-bold text-white flex items-center gap-4">
          <span className="w-3 h-3 bg-sz-red rounded-full block" />
          Products
        </h2>
        <Link 
          href="/admin/products/new" 
          className="border border-white/20 bg-white/5 rounded-md px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-white/10 hover:border-sz-red transition-all shadow-[0_0_15px_rgba(255,0,0,0)] hover:shadow-[0_0_15px_rgba(255,0,0,0.2)]"
        >
          + Create Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="relative z-10 bg-white/[0.01] border border-dashed border-white/10 rounded-xl p-16 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-6">No products yet. Create your first product to populate the storefront.</p>
          <Link 
            href="/admin/products/new" 
            className="border border-white/20 bg-white/5 rounded-md px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-white/10 hover:border-sz-red transition-all"
          >
            + Create Product
          </Link>
        </div>
      ) : (
        <div className="relative z-10 bg-white/[0.01] border border-white/5 rounded-xl overflow-x-auto shadow-2xl backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-white/40 border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Mini Shop</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold">Updated</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.product_variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
                const imageCount = product.product_images.length;
                return (
                  <tr key={product.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm tracking-wide">{product.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
                        /{product.slug} <span className="mx-2 text-white/10">|</span> {imageCount} image{imageCount === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex flex-col gap-2 items-start">
                      <span className={`inline-block rounded px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                        product.status === 'published'
                          ? 'bg-sz-red/10 text-sz-red border border-sz-red/20'
                          : 'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {product.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      {product.is_drop && (
                        <span className="inline-block rounded px-2 py-1 text-[9px] uppercase tracking-widest font-bold bg-white/10 text-white border border-white/20">
                          Drop
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <FeaturedToggle productId={product.id} isFeatured={product.is_featured} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="text-white/80">{formatNGN(Number(product.base_price))}</span>
                      {product.compare_at_price != null && (
                        <span className="ml-2 text-white/30 line-through block mt-1">{formatNGN(Number(product.compare_at_price))}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-xs ${stock === 0 ? 'text-sz-red font-bold' : 'text-white/60'}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] uppercase tracking-wider text-white/40">
                      {new Date(product.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/products/${product.id}`} 
                        className="inline-block border border-white/10 bg-transparent hover:bg-white/5 rounded px-4 py-2 text-[10px] uppercase tracking-widest text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        Customize
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}