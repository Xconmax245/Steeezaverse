import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";

import AnnouncementBar from "@/components/AnnouncementBar";

// Storefront route group layout
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <AnnouncementBar />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
