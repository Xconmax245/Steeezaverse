import TrackClient from './TrackClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | Steezaverse',
  description: 'Track your Steezaverse order status and updates.',
};

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#0a0303] text-white pt-32 pb-20 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff2a2a]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#ff2a2a]/5 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-[500px] px-6 flex-1 flex flex-col justify-center mt-8">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-5xl tracking-tighter text-white uppercase"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}
          >
            Track Order
          </h1>
          <p className="text-white/60 text-sm mt-4">
            Enter your order number and email address to view your order status and updates.
          </p>
        </div>

        <TrackClient />
      </div>
    </div>
  );
}
