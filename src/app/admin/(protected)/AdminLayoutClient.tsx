'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Overview', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Customers', href: '/admin/customers' },
    { label: 'Lookbook', href: '/admin/lookbook' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-sz-red selection:text-black">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 z-50 flex items-center justify-between px-6">
        <Link href="/admin">
          <h1 className="font-chillax text-sm font-bold uppercase tracking-widest text-white">
            Steezaverse <span className="text-sz-red">Admin</span>
          </h1>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white/60 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Slide-in Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="w-64 h-full bg-[#0a0a0a] border-r border-white/5 p-8 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-14">
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <h1 className="font-chillax text-lg font-bold uppercase tracking-widest text-white leading-tight">
                  Steezaverse
                  <span className="block text-sz-red text-[10px] tracking-[0.4em] mt-1">Admin</span>
                </h1>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 flex-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
                    pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${
                    pathname === link.href ? 'bg-sz-red scale-100' : 'bg-sz-red scale-0 group-hover:scale-100'
                  }`} />
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0a0a0a] border-r border-white/5 p-8 flex-col sticky top-0 h-screen">
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
              className={`group flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold transition-colors ${
                pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${
                pathname === link.href ? 'bg-sz-red scale-100' : 'bg-sz-red scale-0 group-hover:scale-100'
              }`} />
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
      <main className="flex-1 p-6 pt-24 md:pt-10 lg:p-16 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
