import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import FeaturedToggle from '@/components/admin/FeaturedToggle';

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
    return <p className="text-red-400">Failed to load products: {error.message}</p>;
  }

  const products = (data ?? []) as ProductRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/admin/products/new" className="bg-sz-red text-white rounded px-4 py-2 text-sm font-semibold hover:opacity-90">
          + Create product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-800 rounded p-10 text-center">
          <p className="text-gray-400 mb-4">No products yet. Create your first product to populate the storefront.</p>
          <Link href="/admin/products/new" className="bg-sz-red text-white rounded px-4 py-2 text-sm font-semibold hover:opacity-90">
            + Create product
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Mini-Shop</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.product_variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
                const imageCount = product.product_images.length;
                return (
                  <tr key={product.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        /{product.slug} · {imageCount} image{imageCount === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === 'published'
                          ? 'bg-green-900/40 text-green-400 border border-green-800'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {product.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      {product.is_drop && (
                        <span className="ml-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-800">
                          Drop
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <FeaturedToggle productId={product.id} isFeatured={product.is_featured} />
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {formatNGN(Number(product.base_price))}
                      {product.compare_at_price != null && (
                        <span className="ml-2 text-xs text-gray-500 line-through">{formatNGN(Number(product.compare_at_price))}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={stock === 0 ? 'text-red-400' : 'text-gray-300'}>{stock}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(product.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product.id}`} className="text-sz-red hover:underline text-sm">
                        Edit
                      </Link>
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