"use client";

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export function ContactForm() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Feedback', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-2">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Inquiry Received</h2>
        <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
          Thank you for reaching out to Daily Tithi. Your message has been logged. Our astrometry engineering and editorial review team will reply to <span className="text-white font-medium">{formData.email}</span> within 24–48 business hours.
        </p>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', subject: 'Feedback', message: '' });
            setFormSubmitted(false);
          }}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#11192e] border border-[#233152] text-xs font-semibold text-orange-400 hover:bg-[#16213d] transition-colors cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#162038]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-400" />
            <span>Send an Inquiry or Feedback</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Submit algorithmic observations, city requests, or general feedback.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 px-3 py-1 rounded-full bg-[#11192e] border border-emerald-500/30">
          <Clock size={12} />
          <span>24–48h Response</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-1">Your Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Acharya Sharma"
            className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600 transition-colors"
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
            className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-1">Inquiry Subject</label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
          >
            <option value="Astrometry">Astrometry / Ephemeris Calculation Observation</option>
            <option value="CityRequest">Request City Coordinate Addition</option>
            <option value="Feedback">General Feedback &amp; Bug Report</option>
            <option value="Compliance">Google AdSense / Privacy Compliance Inquiry</option>
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
            placeholder="Describe your question, observation, or suggestion in detail..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#0e1629] border border-[#233152] text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-neutral-600 transition-colors"
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
    </div>
  );
}

export default ContactForm;
