"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Monitor, Smartphone,
  ArrowDownToLine, ShieldCheck, Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDirectInstall?: () => void;
  deferredPrompt?: any;
}

export function PWAInstallModal({ isOpen, onClose, onDirectInstall, deferredPrompt }: Props) {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'android' | 'ios'>('windows');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('android')) setActivePlatform('android');
      else if (ua.includes('iphone') || ua.includes('ipad')) setActivePlatform('ios');
      else setActivePlatform('windows');
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else if (onDirectInstall) {
      onDirectInstall();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownToLine size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">
                  Install Hindu Calendar Web App (PWA)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Free & Secure
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Native standalone experience • Zero browser or antivirus warnings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="px-5 pt-3 bg-[#0c1222] border-b border-[#1a233a] flex gap-2 overflow-x-auto">
          {[
            { id: 'windows', label: '🪟 Windows Desktop', icon: Monitor },
            { id: 'android', label: '📱 Android Mobile', icon: Smartphone },
            { id: 'ios', label: '🍎 iOS (iPhone / iPad)', icon: Smartphone },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id as 'windows' | 'android' | 'ios')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activePlatform === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content & Guides */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          {/* Direct Trigger Action Button */}
          {activePlatform !== 'ios' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#0e1629] to-teal-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Direct Browser Installation</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Click to trigger instant native app installation
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-white text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <ArrowDownToLine size={14} />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* 🪟 WINDOWS INSTALLATION GUIDE */}
          {activePlatform === 'windows' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Windows Step-by-Step Installation Guide</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Click &quot;Install Now&quot; or check the Address Bar:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      In Microsoft Edge or Google Chrome, click the <strong>Install App icon (🖥️ or ➕)</strong> located at the right end of the top URL address bar.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Confirm Installation:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Click the <strong>&quot;Install&quot;</strong> button in the browser confirmation prompt.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white">Pin to Windows Taskbar:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      The Hindu Calendar will open in its own standalone window. Right-click its taskbar icon and select <strong>&quot;Pin to taskbar&quot;</strong> for instant 1-click access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📱 ANDROID INSTALLATION GUIDE */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Android Step-by-Step Installation Guide</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Tap &quot;Install Now&quot; or Browser Menu:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Tap the <strong>&quot;Install Now&quot;</strong> button above, or tap the <strong>three dots (⋮)</strong> in Chrome / Samsung Internet.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Select &quot;Install app&quot; / &quot;Add to Home screen&quot;:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong> from the menu.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white">Launch from Home Screen:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      The app icon will be added to your home screen. It opens instantly in full-screen with full offline calculations and zero battery drain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🍎 IOS (IPHONE / IPAD) INSTALLATION GUIDE */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 iPhone & iPad Safari Installation Guide</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Open in Safari:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Make sure you are viewing this page in <strong>Safari</strong> on your iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Tap the Share Button (⎋):</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Tap the <strong>Share icon (square with upward arrow ⎋)</strong> on the Safari bottom navigation bar.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white">Select &quot;Add to Home Screen (➕)&quot;:</strong>
                    <p className="text-neutral-400 mt-0.5">
                      Scroll down in the share sheet and tap <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>&quot;Add&quot;</strong> in the top-right corner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Lightness Note */}
          <div className="p-3.5 rounded-2xl bg-[#0a101f] border border-emerald-500/20 text-[11px] text-neutral-400 flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
            <span>PWAs are native browser web apps with 0 security warnings, &lt; 1MB storage footprint, and full offline caching.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Progressive Web App (PWA) Standard</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
