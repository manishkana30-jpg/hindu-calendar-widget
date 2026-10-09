import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, RefreshCw, Mail, Globe, Cookie } from 'lucide-react';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: "Privacy Policy | Daily Tithi",
  description: "Comprehensive privacy disclosures for Daily Tithi (dailytithi.com) detailing client-side astrometry processing, Google AdSense cookies, Web Storage, and data rights.",
  alternates: {
    canonical: 'https://dailytithi.com/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full" />
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
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Privacy &amp; Compliance</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Compliance &amp; Transparency</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Last Updated: October 2026 • Official Policy for <strong>Daily Tithi</strong> (<code>https://dailytithi.com</code>)
          </p>
        </div>

        <div className="space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1: Introduction & Identity */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Globe size={20} className="text-orange-400" />
              <h2>1. Introduction &amp; Ownership</h2>
            </div>
            <p>
              Welcome to <strong>Daily Tithi</strong>, accessible at <a href="https://dailytithi.com" className="text-orange-400 hover:underline">https://dailytithi.com</a> (&quot;Daily Tithi&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your privacy and providing transparent disclosures regarding how data is processed when you visit our website, install our Progressive Web Application (PWA), or interact with our live Vedic astrometry services.
            </p>
            <p className="mt-3">
              This Privacy Policy explains our practices concerning data collection, client-side computing, cookie usage, third-party advertising partners (including Google AdSense), and your rights under global privacy regulations including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
            </p>
          </section>

          {/* Section 2: Client-Side Geolocation */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Lock size={20} className="text-emerald-400" />
              <h2>2. Client-Side Geolocation &amp; Astrometry Processing</h2>
            </div>
            <p>
              Daily Tithi (<code>dailytithi.com</code>) offers high-precision topocentric astrometric calculations—such as local Sunrise, Sunset, Udaya Tithi, Ishta Kaal, Dina Mana, and dynamic Choghadiya Muhurats. These calculations require geographic latitude and longitude coordinates.
            </p>
            <div className="mt-3 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-xs sm:text-sm text-neutral-300">
              <strong className="text-emerald-300 block mb-1">Zero Remote Location Tracking Guarantee:</strong>
              When you permit browser geolocation or select a city, your coordinates are processed <strong>100% locally within your device&apos;s browser memory</strong> using client-side mathematical algorithms. Daily Tithi never transmits, logs, stores, sells, or monetizes your GPS coordinates or IP-derived location data on any external server.
            </div>
          </section>

          {/* Section 3: Google AdSense & Cookies */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Eye size={20} className="text-amber-400" />
              <h2>3. Google AdSense &amp; Third-Party Advertising Disclosures</h2>
            </div>
            <p>
              Daily Tithi may partner with third-party advertising vendors, including Google AdSense, to display advertisements that help sustain our infrastructure and research operations. To deliver relevant advertisements and measure ad performance, these advertising partners use cookies and web beacons.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <strong>DoubleClick DART Cookie:</strong> Google, as a third-party vendor, uses cookies to serve ads on <code>dailytithi.com</code>. Google&apos;s use of the DART cookie enables it to serve advertisements to our users based on their visit to Daily Tithi and other sites across the Internet.
              </li>
              <li>
                <strong>Third-Party Ad Networks:</strong> Third-party ad networks or ad servers use technologies like cookies, JavaScript, or Web Beacons that are sent directly to your browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize advertising content.
              </li>
              <li>
                Daily Tithi has no access to or control over these cookies that are used by third-party advertisers.
              </li>
            </ul>

            <div className="mt-4 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-xs sm:text-sm">
              <strong className="text-amber-300 block mb-1">How You Can Opt Out of Personalized Advertising:</strong>
              <p className="text-neutral-300 mb-2">
                You may opt out of personalized advertising by visiting:
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-lg bg-[#16213d] border border-[#233152] text-orange-400 hover:text-orange-300 hover:border-orange-400/40 transition-colors"
                >
                  Google Ads Settings →
                </a>
                <a 
                  href="https://www.aboutads.info/choices/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-lg bg-[#16213d] border border-[#233152] text-orange-400 hover:text-orange-300 hover:border-orange-400/40 transition-colors"
                >
                  AboutAds.info Opt-Out Portal →
                </a>
                <a 
                  href="https://www.networkadvertising.org/choices/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-lg bg-[#16213d] border border-[#233152] text-orange-400 hover:text-orange-300 hover:border-orange-400/40 transition-colors"
                >
                  Network Advertising Initiative (NAI) →
                </a>
              </div>
            </div>
          </section>

          {/* Section 4: Web Storage & PWA Caching */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Server size={20} className="text-blue-400" />
              <h2>4. Web Storage, Local Storage &amp; Service Worker Offline Caching</h2>
            </div>
            <p>
              To maintain lightning-fast page delivery and guarantee 100% offline functionality as a Progressive Web App, Daily Tithi uses standard browser client-side storage technologies:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-xs sm:text-sm pl-2">
              <li>
                <code>localStorage</code>: Caches your preferred city coordinate selection (<code>selected_city_location</code>) and UI state preferences locally on your browser.
              </li>
              <li>
                <code>IndexedDB</code>: Caches recent calculated Panchang records locally to power instantaneous instant-launch timekeeping when disconnected from the Internet.
              </li>
              <li>
                <strong>Service Worker (<code>/sw.js</code>)</strong>: Pre-caches core HTML, modern CSS, SVG icons, and application bundles so that Daily Tithi functions reliably under intermittent connectivity or airplane mode.
              </li>
            </ul>
            <p className="mt-3 text-xs sm:text-sm text-neutral-400">
              You can clear these cached items at any time through your browser&apos;s site settings or application storage management console.
            </p>
          </section>

          {/* Section 5: Web Push Notifications */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <RefreshCw size={20} className="text-purple-400" />
              <h2>5. Web Push Notification Architecture</h2>
            </div>
            <p>
              If you explicitly grant notification permissions, your browser creates an anonymous Web Push subscription endpoint. This endpoint does not contain your identity, email, or personal details. It is used solely to deliver optional daily morning Tithi updates and auspicious Muhurat transitions. You may revoke push notification permissions at any time directly through your browser or device operating system settings.
            </p>
          </section>

          {/* Section 6: Children's Privacy */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Cookie size={20} className="text-rose-400" />
              <h2>6. Children&apos;s Privacy &amp; COPPA</h2>
            </div>
            <p>
              Daily Tithi is a general-audience cultural utility and does not knowingly collect or solicit personally identifiable information from children under the age of 13 (or under 16 in the European Union). If you believe a child has provided personal information to us, please contact us immediately so we can promptly delete such records.
            </p>
          </section>

          {/* Section 7: Data Controller & Contact Information */}
          <section className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542]">
            <div className="flex items-center gap-3 mb-3 text-white font-bold text-lg">
              <Mail size={20} className="text-emerald-400" />
              <h2>7. Data Controller &amp; Official Privacy Inquiries</h2>
            </div>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, or our compliance with Google AdSense standards, please reach out to our designated privacy officer:
            </p>
            <div className="mt-4 p-4 rounded-xl bg-[#0e1629] border border-[#233152] text-sm">
              <p className="text-white font-semibold">Daily Tithi Privacy Administration</p>
              <p className="text-neutral-300 mt-1">Official Domain: <code>https://dailytithi.com</code></p>
              <p className="mt-1">
                Official Contact Email:{' '}
                <a href="mailto:contact@dailytithi.com" className="text-orange-400 font-mono font-medium hover:underline">
                  contact@dailytithi.com
                </a>
              </p>
              <p className="text-neutral-400 text-xs mt-2">
                Expected Response Time: All legitimate privacy and data inquiry requests are addressed within 24–48 business hours.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />

    </div>
  );
}
