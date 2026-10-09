import React from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

interface FooterProps {
  cityName?: string;
}

export function Footer({ cityName }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-12 border-t border-[#162038] bg-[#050811] text-xs text-neutral-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[#162038]">
          
          {/* Column 1: Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🕉️</span>
              <span className="font-bold text-white text-sm">Daily Tithi</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              High-precision, ad-light Vedic astrometry platform delivering live Ghati/Pala timekeeping, Udaya Tithi, dynamic Choghadiya Muhurats, and Dharmashastra-compliant festival calculations.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#11192e] border border-emerald-500/30 text-[11px] text-emerald-300 font-mono w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Offline PWA Ready</span>
              </div>
              <a 
                href="mailto:contact@dailytithi.com"
                className="inline-flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Mail size={13} />
                <span>contact@dailytithi.com</span>
              </a>
            </div>
          </div>

          {/* Column 2: Astrometric Foundation */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Astrometric Science</span>
            </h3>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li>• Swiss Ephemeris (DE431 Engine)</li>
              <li>• Lahiri (Chitra Paksha) Ayanamsa</li>
              <li>• Sidereal Zodiac (Nirayana System)</li>
              <li>• Nirnayasindhu &amp; Dharmasindhu Canons</li>
              <li>• Dynamic Topocentric Refraction</li>
            </ul>
          </div>

          {/* Column 3: Trust & Compliance */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Compliance &amp; Trust</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Us &amp; Methodology
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact &amp; Inquiries
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy (AdSense &amp; GDPR)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service &amp; Disclaimers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Open Architecture & Community */}
          <div className="space-y-3">
            <h3 className="font-bold text-white uppercase font-mono tracking-wider text-xs flex items-center gap-1.5">
              <BookOpen size={14} className="text-blue-400" />
              <span>Publisher Information</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Published by Daily Tithi. Dedicated to the global diaspora with Next.js 15, React 19, and Tailwind CSS. Open-source calculations verifiable on GitHub.
            </p>
            <div>
              <a
                href="https://github.com/manishkana30-jpg/hindu-calendar-widget"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>Inspect Source Code</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-neutral-400 text-xs">
          <div>
            © {currentYear} Daily Tithi. All rights reserved.{cityName ? ` • ${cityName} Edition` : ''}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-neutral-400">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
