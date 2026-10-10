"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { PanchangData } from '@/src/lib/vedic-astronomy';
import { ActiveMuhuratState } from '@/src/hooks/usePanchang';
import { 
  sharePanchang, 
  buildShareDataFromPanchang, 
  PanchangShareData 
} from '@/src/lib/utils/sharePanchang';

export function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.488-8.482z"/>
    </svg>
  );
}

export interface WhatsAppShareButtonProps {
  date: Date;
  panchang: PanchangData;
  activeMuhurat?: ActiveMuhuratState | null;
  panchakStatus?: string;
  customData?: Partial<PanchangShareData>;
  className?: string;
  compactText?: boolean;
}

export function WhatsAppShareButton({
  date,
  panchang,
  activeMuhurat,
  panchakStatus,
  customData,
  className,
  compactText = false
}: WhatsAppShareButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const handleShare = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent parent card clicks (e.g. opening monthly calendar modal)
      e.stopPropagation();
      e.preventDefault();

      const baseData = buildShareDataFromPanchang(
        date,
        panchang,
        activeMuhurat,
        panchakStatus
      );

      const finalData: PanchangShareData = {
        ...baseData,
        ...customData
      };

      await sharePanchang(finalData, {
        onToast: (msg) => showToast(msg)
      });
    },
    [date, panchang, activeMuhurat, panchakStatus, customData, showToast]
  );

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        className={
          className ||
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer"
        }
        title="Share today's Panchang on WhatsApp"
        aria-label="Share today's Panchang on WhatsApp"
      >
        <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
        <span className="hidden min-[380px]:inline">
          {compactText ? "Share Tithi" : "Share Today's Tithi"}
        </span>
        <span className="min-[380px]:hidden">
          Share
        </span>
      </button>

      {/* Ephemeral Feedback Toast */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="absolute left-1/2 -bottom-9 -translate-x-1/2 z-50 whitespace-nowrap px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-[11px] font-medium shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none"
        >
          <Check className="w-3 h-3 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
