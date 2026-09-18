"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, Github, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Feedback', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

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
            <span>Back to Live Panchang</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Mail size={16} className="text-orange-400" />
            <span>Developer & Research Support</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-left">
        
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">Inquiries & Collaboration</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 tracking-tight">
            Contact & Community Support
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
            Have questions about astronomical algorithms, city coordinates, or want to contribute to the Dharmashastra engine? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left info column */}
          <div className="space-y-4">
            
            <div className="p-5 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-lg">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                <Github size={20} />
              </div>
              <h2 className="text-white font-bold text-base">Open Source GitHub</h2>
              <p className="text-xs text-neutral-400 mt-1 mb-3">
                Inspect calculations, review tests, or open an issue on our public repository.
              </p>
              <a
                href="https://github.com/manishkana30-jpg/hindu-calendar-widget"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>View Repository</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="p-5 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-lg">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-white font-bold text-base">Vedic Astrometry Audits</h2>
              <p className="text-xs text-neutral-400 mt-1">
                We welcome scholarly feedback on regional Panchang variations, Tithi Kshaya, and Adhika Masa reconciliations.
              </p>
            </div>

          </div>

          {/* Right inquiry form */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-3 animate-in fade-in zoom-in duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-xl font-bold text-white">Inquiry Received</h2>
                <p className="text-sm text-neutral-300 max-w-md mx-auto">
                  Thank you for reaching out. Your message has been logged. Our engineering and astrometry team will review your inquiry shortly.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 px-5 py-2 rounded-full bg-[#11192e] border border-[#233152] text-xs font-semibold text-orange-400 hover:bg-[#16213d] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-2">Send an Inquiry or Feedback</h2>
                
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Acharya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Astrometry">Astrometry / Ephemeris Calculation Question</option>
                    <option value="CityRequest">Request City Coordinate Addition</option>
                    <option value="Feedback">General Feedback & Bug Report</option>
                    <option value="Collaboration">Scholarly / Research Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or astrometric observation..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </main>

      <footer className="border-t border-[#162038] py-8 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Hindu Calendar & Live Panchang • All Rights Reserved</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/about" className="hover:text-white">About Methodology</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
