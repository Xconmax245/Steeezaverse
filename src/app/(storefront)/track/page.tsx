import TrackClient from './TrackClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | Steezaverse',
  description: 'Track your Steezaverse order status and updates.',
};

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="relative z-10 w-full max-w-[500px] px-6 flex-1 flex flex-col justify-center mt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl tracking-widest text-white uppercase font-chillax font-bold">
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
