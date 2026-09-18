import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Scale, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: "Terms of Service & Astrometric Disclaimers | Hindu Calendar & Live Panchang",
  description: "Terms of Service, computational astrometry accuracy disclaimers, and warranty limitations for Hindu Calendar & Live Panchang.",
  alternates: {
    canonical: 'https://vikram-samvat-widget.vercel.app/terms'
  }
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-600/10 blur-[140px] rounded-full" />
      </div>

      <nav className="border-b border-[#162038] bg-[#070b16]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Live Panchang</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Scale size={16} className="text-amber-400" />
            <span>Terms & Conditions</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Legal Framework</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Effective Date: September 18, 2026 • Governing Astrometric Computation & Public Use
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Scale size={20} className="text-amber-400" />
              <h2>1. Acceptance of Terms & Non-Commercial Educational Utility</h2>
            </div>
            <p>
              By accessing, browsing, or utilizing the Progressive Web Application hosted at <code>vikram-samvat-widget.vercel.app</code>, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. This platform is provided free of charge for devotional, cultural, educational, and chronological research purposes.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <AlertTriangle size={20} className="text-rose-400" />
              <h2>2. Astrometric Precision & Religious Timing Disclaimers</h2>
            </div>
            <p>
              While all calculations are generated using rigorous high-precision astronomical algorithms anchored to the Swiss Ephemeris and Lahiri (Chitra Paksha) Ayanamsa:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li><strong>Local Horizon Differences:</strong> Actual apparent sunrise can fluctuate slightly based on local elevation, atmospheric refraction, temperature, and local geographic topography (e.g. mountainous horizons).</li>
              <li><strong>Sampradaya & Sectarian Variations:</strong> Specific Hindu lineages (e.g., Smartha vs. Vaishnava Ekadashi rules, Gaudiya Sampradaya, or local regional Panchang traditions like Drikgalita vs. Surya Siddhanta Vakya) may calculate Parana or Udaya Vyapti with minor canonical variations.</li>
              <li><strong>No Astrological Liability:</strong> The developers and contributors shall not be held liable for any decisions, rituals, or actions taken on the basis of Muhurat, Panchak, or Choghadiya timings rendered by this tool.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h2>3. Intellectual Property & Open Source Heritage</h2>
            </div>
            <p>
              The code powering this Vedic astrometry engine is maintained under open-source licenses. The underlying Swiss Ephemeris library is subject to its respective GNU AGPL-v3 / public licensing guidelines. You may inspect the public repository, audit algorithms, or contribute improvements in accordance with our project guidelines.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <h2 className="text-white font-bold text-lg mb-2">4. Modifications to Service</h2>
            <p className="text-xs sm:text-sm">
              We reserve the right to refine astronomical algorithms, expand city databases, or update compliance frameworks at any time without prior notice. Continued use of the platform after modifications constitutes acceptance of the amended terms.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#162038] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Hindu Calendar & Live Panchang • All Rights Reserved</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white">About Methodology</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
