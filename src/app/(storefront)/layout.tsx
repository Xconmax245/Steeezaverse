import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { getDropProducts } from "@/lib/products";

// Storefront route group layout
export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let dropStartsAt: string | null = null;
  try {
    const drops = await getDropProducts();
    dropStartsAt = drops[0]?.drop_starts_at || null;
  } catch {}

  return (
    <CartProvider>
      <AnnouncementBar dropStartsAt={dropStartsAt} />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
