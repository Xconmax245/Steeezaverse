import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import IntroSplash from "@/components/IntroSplash";
import CuelumeProvider from "@/components/CuelumeProvider";

export const metadata: Metadata = {
  title: "Steezaverse — Streetwear",
  description: "Steezaverse. Drops, limited-run streetwear, and nothing else.",
  openGraph: {
    title: "Steezaverse",
    description: "Drops, limited-run streetwear, and nothing else.",
    type: "website",
  },
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
      </head>
      <body className="bg-black text-white antialiased">
        {/* Cuelume sound engine — wires all data-cuelume-* attributes */}
        <CuelumeProvider />
        {/* Intro splash — shows once per session */}
        <IntroSplash />
        {/* Custom cursor — rendered at root so it works site-wide */}
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
