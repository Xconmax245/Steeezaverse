import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h2 className="font-chillax text-3xl font-bold uppercase tracking-widest text-white mb-2">
            Create <span className="text-sz-red">Product</span>
          </h2>
          <p className="text-white/40 text-xs uppercase tracking-wider">
            Add a new item to the Steezaverse catalog
          </p>
        </div>
        <Link 
          href="/admin/products"
          className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-md hover:bg-white/5"
        >
          ← Back to Catalog
        </Link>
      </header>
      
      <ProductForm mode="create" />
    </div>
  );
}