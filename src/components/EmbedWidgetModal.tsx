"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Code2, Check, Copy, Sparkles, ExternalLink, Moon } from 'lucide-react';
import { CITIES } from '@/src/lib/cities';

export interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
}

export function EmbedWidgetModal({
  isOpen,
  onClose,
  defaultCity = 'new-delhi',
}: EmbedWidgetModalProps) {
  // Find matching city slug or fallback to new-delhi
  const initialSlug = CITIES.find(
    (c) => c.name.toLowerCase() === defaultCity.toLowerCase() || c.slug === defaultCity.toLowerCase()
  )?.slug || 'new-delhi';

  const [selectedCity, setSelectedCity] = useState<string>(initialSlug);
  const [theme, setTheme] = useState<'dark' | 'minimal'>('dark');
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync defaultCity when opened
  useEffect(() => {
    if (isOpen) {
      const slug = CITIES.find(
        (c) => c.name.toLowerCase() === defaultCity.toLowerCase() || c.slug === defaultCity.toLowerCase()
      )?.slug || 'new-delhi';
      setSelectedCity(slug);
    }
  }, [isOpen, defaultCity]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Construct embed iframe code snippet
  const embedSnippet = `<div style="max-width:340px; margin:auto;">
  <iframe 
    src="https://dailytithi.com/embed?city=${selectedCity}&theme=${theme}" 
    width="100%" 
    height="320" 
    style="border:1px solid rgba(255,255,255,0.12); border-radius:18px; overflow:hidden;" 
    title="Live Vedic Panchang Widget"
    loading="lazy">
  </iframe>
  <div style="font-size:11px; text-align:center; padding-top:4px;">
    <a href="https://dailytithi.com" target="_blank" rel="noopener" style="color:#f59e0b; text-decoration:none;">
      Powered by Daily Tithi
    </a>
  </div>
</div>`;

  const handleCopy = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(embedSnippet);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = embedSnippet;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setToastMessage('Embed code copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
  }, [embedSnippet]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
    >
      <div 
        className="w-full max-w-3xl bg-[#090e1a] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Code2 size={20} />
            </div>
            <div>
              <h2 id="embed-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Embed Live Panchang Widget</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold">
                  Free
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Embed a compact, real-time Vedic Tithi &amp; Muhurat card on your website or blog.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-amber-500/40 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── BODY: CONFIG & PREVIEW ── */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[75vh]">
          
          {/* LEFT: Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles size={12} /> Live Preview
              </span>
              <a
                href={`/embed?city=${selectedCity}&theme=${theme}`}
                target="_blank"
                rel="noopener"
                className="text-[11px] text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>Open in Tab</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="p-3 rounded-2xl bg-[#060913] border border-white/10 flex items-center justify-center min-h-[340px]">
              <iframe
                key={`${selectedCity}-${theme}`}
                src={`/embed?city=${selectedCity}&theme=${theme}`}
                width="100%"
                height="320"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  maxWidth: '340px'
                }}
                title="Live Vedic Panchang Widget Preview"
                loading="eager"
              />
            </div>
          </div>

          {/* RIGHT: Customization & Snippet */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* City Customization */}
              <div>
                <label htmlFor="embed-city-select" className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Default City:
                </label>
                <select
                  id="embed-city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs font-medium bg-[#0f172a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      📍 {c.name} ({c.state ? `${c.state}, ` : ''}{c.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme Customization */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Visual Theme:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-[#0f172a] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Moon size={13} />
                    <span>Dark Cosmic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('minimal')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'minimal'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-[#0f172a] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Minimal Dark</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="embed-code-box" className="text-xs font-semibold text-neutral-300">
                    HTML Embed Code:
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Responsive (300px–360px)
                  </span>
                </div>
                <textarea
                  id="embed-code-box"
                  readOnly
                  value={embedSnippet}
                  rows={6}
                  className="w-full text-[11px] font-mono bg-[#050811] border border-white/10 rounded-xl p-3 text-amber-200/90 focus:outline-none focus:border-amber-400/50 resize-none selection:bg-amber-500/30"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
            </div>

            {/* Copy Button & Toast */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold font-outfit uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Embed Code</span>
                  </>
                )}
              </button>

              {toastMessage && (
                <p className="text-[11px] text-emerald-400 font-medium text-center mt-2 animate-in fade-in">
                  ✓ {toastMessage}
                </p>
              )}
            </div>

          </div>

        </div>

        {/* ── FOOTER NOTICE ── */}
        <div className="px-6 py-3 bg-[#070b16] border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
          <span>✓ Works 100% offline via Swiss Ephemeris astrometry.</span>
          <span className="text-amber-400/90 font-mono">Free for bloggers &amp; media</span>
        </div>
      </div>
    </div>
  );
}
