import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Mail, MessageSquare, Github, ExternalLink, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { ContactForm } from '@/src/components/ContactForm';
import { Footer } from '@/src/components/Footer';

export const metadata: Metadata = {
  title: "Contact Us & Astrometry Support | Daily Tithi",
  description: "Get in touch with the Daily Tithi engineering and astrometry research team at contact@dailytithi.com for feedback, bug reports, and data inquiries.",
  alternates: {
    canonical: 'https://www.dailytithi.com/contact'
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050811] text-neutral-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      <nav className="border-b border-[#162038] bg-[#070b16]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Daily Tithi</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Mail size={16} className="text-orange-400" />
            <span>Support &amp; Inquiries</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Communication &amp; Support</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Contact Daily Tithi
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Have questions about astronomical algorithms, city coordinates, compliance, or want to contribute to the Vedic calculation engine? Our engineering and editorial team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left info cards */}
          <div className="space-y-4">
            
            {/* Primary Email Card */}
            <div className="p-6 rounded-3xl bg-[#090e1a]/90 border border-orange-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                <Mail size={20} />
              </div>
              <h2 className="text-white font-bold text-base">Official Contact Email</h2>
              <p className="text-xs text-neutral-400 mt-1 mb-3">
                Direct channel for editorial inquiries, technical support, and compliance requests:
              </p>
              <a
                href="mailto:contact@dailytithi.com"
                className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-orange-400 hover:text-orange-300 break-all transition-colors"
              >
                contact@dailytithi.com
              </a>
              <div className="mt-3 pt-3 border-t border-[#1a2542] flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <Clock size={12} />
                <span>Response SLA: 24–48 Business Hours</span>
              </div>
            </div>

            {/* GitHub Open Source */}
            <div className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-lg">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white mb-3">
                <Github size={20} />
              </div>
              <h2 className="text-white font-bold text-base">Open-Source Codebase</h2>
              <p className="text-xs text-neutral-400 mt-1 mb-3">
                Inspect calculations, review unit tests, or file an issue on GitHub.
              </p>
              <a
                href="https://github.com/manishkana30-jpg/hindu-calendar-widget"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>github.com/manishkana30-jpg →</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Astrometric Verification */}
            <div className="p-6 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-lg">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-white font-bold text-base">Vedic Astrometry Audits</h2>
              <p className="text-xs text-neutral-400 mt-1">
                We welcome scholarly peer reviews on regional Panchang nuances, Tithi Kshaya/Vriddhi, and Dharmashastra determinations.
              </p>
            </div>

          </div>

          {/* Right inquiry form */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}
