import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LoginClient from "./LoginClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login — Steezaverse",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* LEFT SIDE: Image (Hidden on very small screens, or at top) */}
      <div className="relative w-full md:w-1/2 h-64 md:h-screen p-4 md:p-6 lg:p-8">
        <div className="relative w-full h-full rounded-3xl md:rounded-[40px] overflow-hidden">
          <Image
            src="/INTRODUCING_STV_TRACKSUITS_WITH_LOUD_COLOURS_AND_BOLD_ENERGY_STEEZAVERSE.jpg"
            alt="Steezaverse Tracksuits"
            fill
            priority
            className="object-cover"
          />
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Logo overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <Link href="/">
              <Image 
                src="/STV_mini_logo-removebg-preview.png" 
                alt="STV Logo" 
                width={80} 
                height={40} 
                className="opacity-90"
                style={{ filter: "brightness(2)" }}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 relative bg-white">
        {/* Back Link */}
        <Link href="/" className="absolute top-8 md:top-12 left-8 md:left-12 text-black/60 hover:text-black transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>

        <div className="w-full max-w-md">
          <h1 className="font-chillax text-4xl md:text-5xl font-bold mb-4 text-black tracking-tight">
            Welcome Back
          </h1>
          <p className="text-black/60 text-sm mb-12">
            Enter your email to receive a secure login link.
          </p>

          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginClient />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

