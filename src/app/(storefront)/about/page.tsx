import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About — Steezaverse",
  description: "Steezaverse. Drops, limited-run streetwear, and nothing else.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <section className="pt-40 pb-32">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <header className="mb-16">
            <h1 className="font-chillax text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">
              About <span className="text-sz-red">Steezaverse</span>
            </h1>
            <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              Built in the shadows of the streets
            </p>
          </header>

          <div className="flex flex-col gap-10 font-sans text-base md:text-lg leading-relaxed text-white/60">
            <p>
              Steezaverse is a streetwear label built around one idea:{" "}
              <span className="text-white">drops, limited runs, and nothing else</span>. No endless
              catalog. No restocks forever. Every piece is produced in a small, deliberate batch —
              and when it sells through, it&apos;s gone.
            </p>
            <p>
              Each drop is designed, sampled, and shot locally. Time-gated releases mean the rack
              opens and closes on a schedule, so the only way in is to be there when it happens.
            </p>
          </div>

          {/* Manifesto-style pull quote — echoes the homepage marquee */}
          <blockquote className="my-20 border-l-2 border-sz-red pl-6 md:pl-10">
            <p
              className="font-chillax uppercase italic text-2xl md:text-4xl font-black leading-snug"
              style={{ color: "var(--red)" }}
            >
              &ldquo;Born in the shadows of the streets&rdquo;
            </p>
          </blockquote>

          <div className="flex flex-col gap-10 font-sans text-base md:text-lg leading-relaxed text-white/60">
            <p>
              What that means practically: heavyweight fabrics, reinforced construction, and prints
              you won&apos;t find anywhere else. We&apos;d rather make one hundred pieces properly
              than ten thousand pieces forgettably.
            </p>
            <p>
              Follow the drop calendar, join waitlists on sold-out pieces, and catch the next
              release the moment it opens.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap gap-4">
            <Link
              href="/drops"
              className="rounded-full border border-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black bg-white hover:bg-transparent hover:text-white transition-colors duration-500"
            >
              See the drops
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white/70 hover:border-white hover:text-white transition-colors duration-500"
            >
              Shop everything
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
