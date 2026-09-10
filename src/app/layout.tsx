/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "aos/dist/aos.css";
import "./globals.css";
import AOSProvider from "@/components/AOSProvider";
import CustomCursor from "@/components/CustomCursor";
import IntroSplash from "@/components/IntroSplash";
import CuelumeProvider from "@/components/CuelumeProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steezaverse.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Steezaverse — Streetwear",
  description: "Steezaverse. Drops, limited-run streetwear, and nothing else.",
  openGraph: {
    title: "Steezaverse",
    description: "Drops, limited-run streetwear, and nothing else.",
    url: baseUrl,
    siteName: "Steezaverse",
    type: "website",
    images: [
      {
        url: "/og-fallback.png",
        width: 1200,
        height: 630,
        alt: "Steezaverse",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steezaverse",
    description: "Drops, limited-run streetwear, and nothing else.",
    images: ["/og-fallback.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=synonym@400&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=chillax@600&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=aktura@400&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=bespoke-sans@800&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=zodiak@400,600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@600&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=nunito@801&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased">
        {/* Cuelume sound engine — wires all data-cuelume-* attributes */}
        <CuelumeProvider />
        {/* AOS scroll-reveal engine — drives all data-aos attributes */}
        <AOSProvider />
        {/* Intro splash — shows once per session */}
        <IntroSplash />
        {/* Custom cursor — rendered at root so it works site-wide */}
        <CustomCursor />
        {/* Visitor analytics — beacons public page views, admin pages excluded */}
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
