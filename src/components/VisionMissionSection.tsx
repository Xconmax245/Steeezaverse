import Image from "next/image";
import Link from "next/link";

export default function VisionMissionSection() {
  return (
    <section className="bg-black text-white py-0">
      {/* Row 1: Our Mission */}
      <div className="flex flex-col md:flex-row w-full min-h-[60vh]">
        {/* Text Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 order-2 md:order-1">
          <div className="max-w-md w-full space-y-6">
            <h2 className="font-chillax text-4xl md:text-5xl font-bold tracking-tight">Our Mission</h2>
            <div className="text-white/70 space-y-4 text-sm leading-relaxed uppercase tracking-widest">
              <p>
                To create statement driven streetwear that carries identity, attitude, and purpose. We push creative boundaries, challenge the norm, and inspire our community to move different, dress different, and TAKE REEKS our code for TAKE RISKS.
              </p>
              <p>
                It is the STEEZAVERSE way of saying TAKE RISKS, which means choosing the unconventional over the expected. It is the mindset of stepping outside your comfort zone, betting on your vision, embracing the unknown, and having the confidence to do what others might not.
              </p>
            </div>
            <Link 
              href="/about" 
              className="inline-block mt-8 bg-white text-black font-bold uppercase tracking-widest px-8 py-3 hover:bg-white/90 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
        {/* Image Side */}
        <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto order-1 md:order-2">
          <Image
            src="/fashionable-man-woman-posing-with-copy-space.jpg"
            alt="STEEZAVERSE Mission"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Row 2: Our Vision */}
      <div className="flex flex-col md:flex-row w-full min-h-[60vh]">
        {/* Image Side */}
        <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto order-1">
          <Image
            src="/One_voice,_three_shades_Style_that_rides_the_wave_of_fire,_calm (3).jpg"
            alt="STEEZAVERSE Vision"
            fill
            className="object-cover"
          />
        </div>
        {/* Text Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 order-2">
          <div className="max-w-md w-full space-y-6">
            <h2 className="font-chillax text-4xl md:text-5xl font-bold tracking-tight">Our Vision</h2>
            <div className="text-white/70 space-y-4 text-sm leading-relaxed uppercase tracking-widest">
              <p>
                To build a fashion universe for the bold, the different, and the unapologetic. STEEZAVERSE is where street culture meets self expression where originality is the standard and standing out is the whole point.
              </p>
              <p>
                TAKE REEKS is about taking chances, making mistakes, learning, evolving, and coming back sharper. It represents the courage to create your own lane instead of waiting for one to be made for you.
              </p>
              <p>
                In STEEZAVERSE, TAKE REEKS isn’t just something you wear. It’s how you move.
              </p>
              <p className="font-bold text-white pt-2">
                TAKE REEKS. MOVE DIFFERENT. FIND YOUR STEEZE.
              </p>
            </div>
            <Link 
              href="/about" 
              className="inline-block mt-8 bg-white text-black font-bold uppercase tracking-widest px-8 py-3 hover:bg-white/90 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
