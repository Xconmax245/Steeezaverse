'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await getBrowserClient().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sz-red/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-lg p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-chillax text-2xl font-bold text-white uppercase tracking-widest mb-1">
            Steezaverse <span className="text-sz-red">Admin</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-widest">
            Restricted Access
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-wider text-white/50" htmlFor="email">
              Command Core ID (Email)
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-sz-red focus:bg-white/10"
              placeholder="admin@steezaverse.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-wider text-white/50" htmlFor="password">
              Passcode
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-sz-red focus:bg-white/10"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 text-[11px] text-sz-red uppercase tracking-wider text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          data-cuelume-hover="tick"
          data-cuelume-press
          className="mt-8 w-full rounded-md bg-sz-red py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-sz-red-dim disabled:opacity-50 disabled:hover:bg-sz-red"
        >
          {loading ? 'Authenticating...' : 'Enter System'}
        </button>
      </motion.form>
    </main>
  );
}