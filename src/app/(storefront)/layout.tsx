// Storefront route group layout — passthrough only.
// Navbar and global chrome are managed per-page or via root layout.
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
