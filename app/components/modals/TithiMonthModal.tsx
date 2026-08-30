"use client";

import React from 'react';
import { X } from 'lucide-react';
import { LocationCoordinates } from '../../../src/lib/vedic-astronomy';
import { MonthlyVedicCalendar } from '../MonthlyVedicCalendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: LocationCoordinates;
  onSelectDate?: (date: Date) => void;
}

export function TithiMonthModal({ isOpen, onClose, location, onSelectDate }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-[#070b16] border border-[#233152] rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Modal Top Close Bar */}
        <div className="p-3 px-5 bg-[#090e1a] border-b border-[#1a233a] flex items-center justify-between">
          <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-2">
            <span>🕉️ High-Precision Vedic Ephemeris</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300 font-normal">Udaya Tithi Canonical View</span>
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#11192e] hover:bg-[#1f2c4d] border border-[#233152] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Monthly Calendar Modal"
          >
            <X size={16} />
          </button>
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
        <div className="p-3 px-6 bg-[#090e1a] border-t border-[#1a233a] flex items-center justify-between text-xs text-neutral-400">
          <div>Authority: <strong>Surya Siddhanta &amp; Nirnayasindhu</strong> (Lahiri Sidereal Ayanamsha)</div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
