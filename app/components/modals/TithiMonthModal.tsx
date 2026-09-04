"use client";

import React, { useEffect } from 'react';
import { X, ArrowLeft, Calendar } from 'lucide-react';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';
import { MonthlyVedicCalendar } from '../MonthlyVedicCalendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  onSelectDate?: (date: Date) => void;
}

export function TithiMonthModal({ isOpen, onClose, location, onSelectDate }: Props) {
  // ESC key listener for accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        // Close when clicking the backdrop overlay
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Vedic Monthly Calendar and Udaya Tithi Almanac"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-[#070b16] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Navigation Bar */}
        <div className="p-3.5 px-5 bg-[#090e1a] border-b border-[#1a233a] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11192e] hover:bg-[#1a2544] border border-[#233152] text-neutral-200 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Return to Live Widget"
              aria-label="Return to Live Widget"
            >
              <ArrowLeft size={14} className="text-orange-400" />
              <span>← Back to Live Widget</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <Calendar size={13} />
              <span>Monthly Vedic Calendar & Udaya Tithi Almanac</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-neutral-400 font-medium">
              Location: <strong className="text-neutral-200">{location.name}</strong>
            </span>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close Modal (Esc)"
              aria-label="Close Monthly Calendar Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Monthly Vedic Calendar Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <MonthlyVedicCalendar 
            initialLocation={location} 
            onSelectDate={(d) => {
              if (onSelectDate) onSelectDate(d);
            }}
            embeddedInModal={true}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-6 bg-[#090e1a] border-t border-[#1a233a] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <div>Authority: <strong>Surya Siddhanta & Nirnayasindhu</strong> (Lahiri Sidereal Ayanamsha)</div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer shadow-md shadow-orange-500/20 active:scale-95"
          >
            Done / Close View
          </button>
        </div>

      </div>
    </div>
  );
}
