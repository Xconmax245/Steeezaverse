import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";

// Storefront route group layout
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
