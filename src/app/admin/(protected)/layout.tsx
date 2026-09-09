import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import Link from 'next/link';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/admin/login');
  }

  const navLinks = [
    { label: 'Overview', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Lookbook', href: '/admin/lookbook' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-sz-red selection:text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 p-8 flex flex-col">
        <div className="mb-14">
          <Link href="/admin">
            <h1 className="font-chillax text-lg font-bold uppercase tracking-widest text-white leading-tight">
              Steezaverse
              <span className="block text-sz-red text-[10px] tracking-[0.4em] mt-1">Admin</span>
            </h1>
          </Link>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              href={link.href} 
              className="group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-white/40 transition-colors hover:text-white"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-sz-red scale-0 group-hover:scale-100 transition-transform duration-300" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-white/20">
            System Online
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 lg:p-16 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}