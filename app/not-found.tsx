import React from 'react';
import Link from 'next/link';
import { Home, Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Decorative ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-md w-full p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-2xl space-y-6">
        
        <div className="w-16 h-16 rounded-3xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
          <Compass size={32} className="animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        <div>
          <span className="font-mono text-xs text-orange-400 uppercase tracking-widest block mb-1">
            404 • Celestial Coordinate Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lost in the Cosmic Spheres
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed">
            The requested page does not correspond to any known celestial longitude or astrological route. Return to the live dashboard for real-time Vedic calculations.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold transition-all shadow-lg cursor-pointer"
          >
            <Home size={16} />
            <span>Return to Live Panchang</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

    </div>
  );
}
