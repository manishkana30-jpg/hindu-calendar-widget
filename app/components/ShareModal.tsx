"use client";

import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, MessageSquare, 
  Send, Mail, Smartphone, Bluetooth
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareTitle = "Hindu Calendar & Live Panchang";
  const shareText = "Experience high-precision Vedic Panchang with live Ishta Kaal, 8-Pahar, real-time Muhurats & Dharmashastra rules. Install directly as a 100% warning-free Web App (PWA):";
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vikram-samvat-widget.vercel.app';

  const fullShareText = `${shareTitle}\n\n${shareText}\n${shareUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.log("Share cancelled or not supported", err);
      }
    }
  };

  // Direct app sharing links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(fullShareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(fullShareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090e1a] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#11192e] via-[#0e1629] to-[#11192e] border-b border-[#1e2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Share Hindu Calendar &amp; Panchang
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Share via Bluetooth, WhatsApp, LINE, Telegram &amp; more
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

        {/* Share Options */}
        <div className="p-5 space-y-4">
          
          {/* Native Device Share Sheet Trigger */}
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 font-extrabold text-white text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            <Smartphone size={16} />
            <span>Open Device Sharing Menu (Bluetooth, AirDrop, etc.)</span>
          </button>

          {/* Social / Messaging Direct Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-[#0c1222] hover:bg-[#131e36] border border-[#1e2942] hover:border-emerald-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={16} />
              </div>
              <span className="text-[11px] font-bold text-neutral-200">WhatsApp</span>
            </a>

            {/* LINE */}
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-[#0c1222] hover:bg-[#131e36] border border-[#1e2942] hover:border-emerald-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#06C755]/15 text-[#06C755] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={16} />
              </div>
              <span className="text-[11px] font-bold text-neutral-200">LINE</span>
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-[#0c1222] hover:bg-[#131e36] border border-[#1e2942] hover:border-sky-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send size={16} />
              </div>
              <span className="text-[11px] font-bold text-neutral-200">Telegram</span>
            </a>

            {/* Email */}
            <a
              href={mailUrl}
              className="p-3 rounded-2xl bg-[#0c1222] hover:bg-[#131e36] border border-[#1e2942] hover:border-orange-500/40 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={16} />
              </div>
              <span className="text-[11px] font-bold text-neutral-200">Email</span>
            </a>

          </div>

          {/* Copy Link Box */}
          <div className="p-3 rounded-2xl bg-[#0c1222] border border-[#1e2942] flex items-center justify-between gap-2">
            <div className="text-xs text-neutral-300 font-mono truncate flex-1 pl-1">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] text-xs font-bold text-white flex items-center gap-1.5 transition-colors flex-shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-neutral-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Bluetooth & Secure Nearby Note */}
          <div className="p-3 rounded-xl bg-[#0a101f] border border-[#1a2542] text-[11px] text-neutral-400 flex items-center gap-2">
            <Bluetooth size={16} className="text-blue-400 flex-shrink-0" />
            <span>To share via <strong>Bluetooth / Quick Share / AirDrop</strong>, tap the orange button above to use your device&apos;s native share sheet.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0c1222] border-t border-[#1e2942] flex items-center justify-between text-xs text-neutral-400">
          <div>Instant PWA Installation Link</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2542] border border-[#233152] font-bold text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
