import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Scale, AlertTriangle, ShieldCheck, Mail, BookOpen, Compass } from 'lucide-react';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: "Terms of Service & Astrometric Disclaimers | Daily Tithi",
  description: "Terms of Service, computational astrometry accuracy disclaimers, and warranty limitations for Daily Tithi (dailytithi.com).",
  alternates: {
    canonical: 'https://www.dailytithi.com/terms'
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
            <span>Back to Daily Tithi</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Scale size={16} className="text-amber-400" />
            <span>Terms &amp; Disclaimers</span>
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
            Effective Date: October 2026 • Governing Astrometric Computation &amp; Public Use for <strong>Daily Tithi</strong> (<code>https://dailytithi.com</code>)
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1: Acceptance of Terms */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Scale size={20} className="text-amber-400" />
              <h2>1. Acceptance of Terms &amp; Scope of Service</h2>
            </div>
            <p>
              By accessing, browsing, installing, or otherwise utilizing the services provided on <strong>Daily Tithi</strong> (hosted at <code>https://dailytithi.com</code>), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the site immediately.
            </p>
            <p className="mt-3">
              Daily Tithi is an independent astronomical, chronological, and cultural information utility engineered for educational, devotional, and chronological research purposes.
            </p>
          </section>

          {/* Section 2: Astrometric Precision & Religious Disclaimer */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <AlertTriangle size={20} className="text-rose-400" />
              <h2>2. Astrometric Precision &amp; Religious Timing Disclaimers</h2>
            </div>
            <p>
              Daily Tithi generates topocentric ephemeris calculations anchored to the renowned <strong>Swiss Ephemeris (Drik Ganita system)</strong> and the <em>Lahiri (Chitra Paksha) Ayanamsa</em>. While our algorithms provide second-level computational fidelity:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>Critical Religious Samskaras:</strong> For momentous life events, Vedic sacraments, marriages (Vivaha), initiation (Upanayana), or housewarming (Griha Pravesha), calculated timings should always be cross-verified with qualified local priests (Purohits) and authoritative regional tradition.
              </li>
              <li>
                <strong>Topographical &amp; Horizon Fluctuations:</strong> True apparent sunrise and sunset can exhibit minor variations influenced by local elevation above sea level, atmospheric temperature inversions, barometric pressure, and physical horizons (such as mountain ranges).
              </li>
              <li>
                <strong>Sampradaya &amp; Sectarian Variations:</strong> Different Vedic lineages—including Smartha versus Vaishnava traditions, Gaudiya Sampradaya, and regional calendars (e.g., Tamil Solar, Bengali, Gujarati, Amanta versus Purnimanta systems)—may apply distinct theological interpretation rules for fast observances (such as Ekadashi Parana or Janmashtami midnight Nishita Vyapti).
              </li>
              <li>
                <strong>Limitation of Astrological Liability:</strong> Daily Tithi, its creators, engineers, and contributors provide these astronomical computations without warranties of any kind. We accept no liability or responsibility for any personal, spiritual, financial, or legal decisions undertaken based on the Choghadiya, Rahu Kalam, Panchak, or Muhurat timings displayed.
              </li>
            </ul>
          </section>

          {/* Section 3: Intellectual Property */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <ShieldCheck size={20} className="text-emerald-400" />
              <h2>3. Intellectual Property &amp; Open Architecture</h2>
            </div>
            <p>
              The user interface, design systems, and original software algorithms of Daily Tithi are protected by applicable copyright and intellectual property laws. The underlying Swiss Ephemeris astronomical tables and ephemeris algorithms adhere to their respective GNU AGPL-v3 and public domain software licensing models. You may review and audit calculation algorithms on our public repository in accordance with open-source guidelines.
            </p>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Compass size={20} className="text-blue-400" />
              <h2>4. Acceptable Use &amp; Automated Scraping</h2>
            </div>
            <p>
              You agree not to misuse Daily Tithi or attempt to disrupt the platform through denial-of-service attacks, abusive high-frequency automated scraping of our serverless endpoints, or reverse engineering proprietary compiled assets. Automated scraping must respect the directives specified in our <Link href="/robots.txt" className="text-orange-400 hover:underline">robots.txt</Link> file.
            </p>
          </section>

          {/* Section 5: Modifications to Service & Terms */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <BookOpen size={20} className="text-purple-400" />
              <h2>5. Modifications to Service &amp; Terms</h2>
            </div>
            <p>
              We reserve the right to modify, refine, or temporarily suspend portions of Daily Tithi at any time to upgrade computational models, expand city coordinate tables, or comply with changing regulatory requirements. Any modifications to these Terms of Service will be posted on this page with an updated effective date. Continued use constitutes full agreement to the updated terms.
            </p>
          </section>

          {/* Section 6: Contact Information */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Mail size={20} className="text-orange-400" />
              <h2>6. Contact &amp; Legal Notices</h2>
            </div>
            <p>
              For legal inquiries, formal notices, or questions regarding these Terms of Service, please contact our team:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-sm">
              <p className="text-white font-semibold">Daily Tithi Legal &amp; Compliance Team</p>
              <p className="text-neutral-300 mt-1">Official Domain: <code>https://dailytithi.com</code></p>
              <p className="mt-1">
                Official Contact Email:{' '}
                <a href="mailto:contact@dailytithi.com" className="text-orange-400 font-mono font-medium hover:underline">
                  contact@dailytithi.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />

    </div>
  );
}
