import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Story — Steezaverse",
  description:
    "The Steezaverse story — where it started, what we stand for, and where we're going. Take Reeks. Move Different.",
};

export default function OurStoryPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative w-full h-[70vh] min-h-[480px] overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <Image
            src="/Effortless_gravity_Unshaken_energy_💪The_STEEZAVERSE_moves_when_I.jpg"
            alt="Steezaverse — Our Story"
            fill
            priority
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        </div>
        <div className="relative z-10 max-w-[90vw] lg:max-w-5xl mx-auto px-6 pb-16 md:pb-24">
          <p
            className="font-archivo font-semibold text-white/40 text-xs sm:text-sm tracking-[0.3em] uppercase mb-4"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            Steezaverse
          </p>
          <h1
            className="font-chillax font-extrabold text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.9]"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="80"
          >
            Our<br />
            <span className="text-sz-red">Story</span>
          </h1>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="max-w-[90vw] lg:max-w-4xl mx-auto px-6 py-20 md:py-28">
        <p
          className="text-xl md:text-2xl lg:text-3xl font-chillax font-medium text-white/85 leading-relaxed"
          data-aos="fade-up"
          data-aos-duration="900"
        >
          Steezaverse was built for the ones who move different — who choose the
          unconventional over the expected, and who have the confidence to bet on
          their own vision even when the lane isn&apos;t made yet.
        </p>
        <div className="w-16 h-[2px] bg-sz-red mt-10" data-aos="fade-right" data-aos-delay="200" />
      </section>

      {/* ── Our Mission ── */}
      <section className="max-w-[90vw] lg:max-w-7xl mx-auto px-6 pb-24 md:pb-40">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text */}
          <div className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1" data-aos="fade-up" data-aos-duration="1000">
            <span className="text-[11px] uppercase tracking-[0.3em] text-sz-red font-semibold font-archivo">
              Our Mission
            </span>
            <h2 className="font-chillax text-4xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.95]">
              Statement Driven Streetwear
            </h2>
            <div className="text-white/65 space-y-5 text-sm md:text-base leading-[1.9] max-w-xl font-medium">
              <p>
                To create statement driven streetwear that carries identity, attitude, and purpose.
                We push creative boundaries, challenge the norm, and inspire our community to move
                different, dress different, and <strong className="text-white">TAKE REEKS</strong> —
                our code for TAKE RISKS.
              </p>
              <p>
                It is the STEEZAVERSE way of saying take risks — choosing the unconventional over
                the expected. Stepping outside your comfort zone, betting on your vision, embracing
                the unknown, and having the confidence to do what others might not.
              </p>
            </div>
          </div>
          {/* Image */}
          <div
            className="w-full lg:w-1/2 relative h-[55vh] md:h-[70vh] order-1 lg:order-2 rounded-2xl md:rounded-3xl overflow-hidden group"
            data-aos="fade-left"
            data-aos-duration="1000"
          >
            <Image
              src="/Effortless_gravity_Unshaken_energy_💪The_STEEZAVERSE_moves_when_I.jpg"
              alt="Steezaverse Mission"
              fill
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* ── Our Vision ── */}
      <section className="max-w-[90vw] lg:max-w-7xl mx-auto px-6 pb-24 md:pb-40">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Image */}
          <div
            className="w-full lg:w-1/2 relative h-[55vh] md:h-[70vh] order-1 rounded-2xl md:rounded-3xl overflow-hidden group"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <Image
              src="/One_voice,_three_shades_Style_that_rides_the_wave_of_fire,_calm.jpg"
              alt="Steezaverse Vision"
              fill
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          {/* Text */}
          <div className="w-full lg:w-1/2 space-y-8 order-2" data-aos="fade-up" data-aos-duration="1000">
            <span className="text-[11px] uppercase tracking-[0.3em] text-sz-red font-semibold font-archivo">
              Our Vision
            </span>
            <h2 className="font-chillax text-4xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.95]">
              A Universe For the Bold
            </h2>
            <div className="text-white/65 space-y-5 text-sm md:text-base leading-[1.9] max-w-xl font-medium">
              <p>
                To build a fashion universe for the bold, the different, and the unapologetic.
                STEEZAVERSE is where street culture meets self-expression — where originality is
                the standard and standing out is the whole point.
              </p>
              <p>
                TAKE REEKS is about taking chances, making mistakes, learning, evolving, and coming
                back sharper. It represents the courage to create your own lane instead of waiting
                for one to be made for you.
              </p>
              <div className="w-12 h-[2px] bg-sz-red my-4" />
              <p className="font-bold text-white text-base md:text-xl tracking-[0.2em] leading-relaxed uppercase">
                Take Reeks. Move Different.<br />Find Your Steeze.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[90vw] lg:max-w-5xl mx-auto px-6 pb-32 md:pb-48 text-center">
        <div className="border-t border-white/10 pt-20">
          <p
            className="text-xs uppercase tracking-[0.35em] text-white/40 font-semibold mb-6 font-archivo"
            data-aos="fade-up"
          >
            Ready?
          </p>
          <h3
            className="font-chillax text-4xl md:text-6xl font-extrabold uppercase tracking-tight mb-10"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Take Your Reeks.
          </h3>
          <Link
            href="/shop"
            data-aos="fade-up"
            data-aos-delay="200"
            className="inline-block bg-sz-red text-white px-12 py-4 rounded text-sm font-bold tracking-widest uppercase transition-colors hover:bg-red-600"
          >
            SHOP NOW →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
