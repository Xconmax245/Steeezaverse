'use client';

import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/lookbook', label: 'Lookbook' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <a
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              active
                ? 'bg-sz-red/10 text-sz-red font-semibold'
                : 'text-gray-300 hover:text-sz-red hover:bg-gray-900'
            }`}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}