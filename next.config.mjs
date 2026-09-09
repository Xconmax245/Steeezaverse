/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Admin-uploaded product/lookbook images live in Supabase Storage
      // (*.supabase.co). http+localhost:54321 covers a local Supabase dev stack.
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "http", hostname: "localhost", port: "54321" },
    ],
  },
};

export default nextConfig;
