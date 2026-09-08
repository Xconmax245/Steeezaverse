export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-950 p-6 border-r border-gray-800">
        <h1 className="text-xl font-bold mb-8 text-brand-red">Steezaverse Admin</h1>
        <nav className="flex flex-col gap-4">
          <a href="/admin" className="hover:text-brand-red">Dashboard</a>
          <a href="/admin/products" className="hover:text-brand-red">Products</a>
          <a href="/admin/orders" className="hover:text-brand-red">Orders</a>
          {/* Further links scaffolded later */}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
