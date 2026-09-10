import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login — Steezaverse",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="pt-32 pb-24 min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-chillax text-4xl font-bold uppercase tracking-widest text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-white/50 text-sm tracking-widest uppercase">
              Enter your email to receive a secure login link.
            </p>
          </div>

          <LoginClient />
          
          <div className="text-center mt-6">
            <p className="text-white/30 text-xs uppercase tracking-widest">
              No password required. Secure magic link sent instantly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
