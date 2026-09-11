import Image from "next/image";
import Link from "next/link";

export default function VisionMissionSection() {
  return (
    <section className="bg-black text-white py-32 md:py-48 overflow-hidden">
      <div className="max-w-[90vw] lg:max-w-7xl mx-auto space-y-32 md:space-y-56">
        
        {/* Row 1: Our Mission */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Text Side */}
          <div className="w-full lg:w-1/2 space-y-8 order-2 lg:order-1" data-aos="fade-up" data-aos-duration="1000">
            <h2 className="font-chillax text-5xl md:text-7xl font-extrabold tracking-tighter uppercase">
              Our Mission
            </h2>
            <div className="text-white/70 space-y-6 text-sm md:text-base leading-[2] uppercase tracking-[0.15em] max-w-xl font-medium">
              <p>
                To create statement driven streetwear that carries identity, attitude, and purpose. We push creative boundaries, challenge the norm, and inspire our community to move different, dress different, and TAKE REEKS our code for TAKE RISKS.
              </p>
              <p>
                It is the STEEZAVERSE way of saying TAKE RISKS, which means choosing the unconventional over the expected. It is the mindset of stepping outside your comfort zone, betting on your vision, embracing the unknown, and having the confidence to do what others might not.
              </p>
            </div>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-6 text-white uppercase tracking-[0.2em] font-bold text-sm hover:text-[var(--red)] transition-colors mt-8 group"
            >
              <span>Learn More</span>
              <span className="w-16 h-[2px] bg-white group-hover:bg-[var(--red)] transition-all duration-300"></span>
            </Link>
          </div>
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative h-[60vh] md:h-[80vh] order-1 lg:order-2 rounded-2xl md:rounded-[40px] overflow-hidden group">
            <Image
              src="/Effortless_gravity_Unshaken_energy_💪The_STEEZAVERSE_moves_when_I.jpg"
              alt="STEEZAVERSE Mission"
              fill
              className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Row 2: Our Vision */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative h-[60vh] md:h-[80vh] order-1 rounded-2xl md:rounded-[40px] overflow-hidden group">
            <Image
              src="/One_voice,_three_shades_Style_that_rides_the_wave_of_fire,_calm.jpg"
              alt="STEEZAVERSE Vision"
              fill
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          {/* Text Side */}
          <div className="w-full lg:w-1/2 space-y-8 order-2" data-aos="fade-up" data-aos-duration="1000">
            <h2 className="font-chillax text-5xl md:text-7xl font-extrabold tracking-tighter uppercase">
              Our Vision
            </h2>
            <div className="text-white/70 space-y-6 text-sm md:text-base leading-[2] uppercase tracking-[0.15em] max-w-xl font-medium">
              <p>
                To build a fashion universe for the bold, the different, and the unapologetic. STEEZAVERSE is where street culture meets self expression where originality is the standard and standing out is the whole point.
              </p>
              <p>
                TAKE REEKS is about taking chances, making mistakes, learning, evolving, and coming back sharper. It represents the courage to create your own lane instead of waiting for one to be made for you.
              </p>
              <p>
                In STEEZAVERSE, TAKE REEKS isn’t just something you wear. It’s how you move.
              </p>
              <div className="w-12 h-[2px] bg-[var(--red)] my-8"></div>
              <p className="font-bold text-white text-base md:text-xl tracking-[0.2em] leading-relaxed">
                TAKE REEKS. MOVE DIFFERENT.<br/>FIND YOUR STEEZE.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
