"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    question: "What is today's Udaya Tithi and how is it calculated?",
    answer: "Udaya Tithi is the lunar day active at the exact moment of local sunrise at your coordinates. In Hindu Dharmashastra canons such as the Nirnayasindhu and Dharmasindhu, the Tithi prevailing at sunrise governs the religious observances, fasts (Vrats), and festivals for that entire civil day, regardless of when the Tithi concludes later in the day."
  },
  {
    id: 'faq-2',
    question: "How does this calendar differ from standard Gregorian dates?",
    answer: "Unlike the solar Gregorian calendar which resets at midnight, the Hindu calendar (Panchang) is lunisolar and resets at local sunrise. It tracks the dynamic celestial interplay of the Sun and Moon, calculating time across five sacred limbs (Pancha-Anga): Tithi (lunar day), Vara (solar weekday), Nakshatra (lunar mansion), Yoga (soli-lunar angle), and Karana (half-tithi), alongside Vikram Samvat and Shaka Samvat eras."
  },
  {
    id: 'faq-3',
    question: "What is a Ghati, Pala, and Vipala?",
    answer: "Ghati, Pala, and Vipala are the foundational sexagesimal units of traditional Vedic timekeeping. One civil day (Ahoratra, from sunrise to next sunrise, approximately 24 hours) is divided into 60 Ghatis (24 minutes each). Each Ghati is subdivided into 60 Palas (24 seconds each), and each Pala is subdivided into 60 Vipalas (0.4 seconds each), totaling 216,000 Vipalas per day."
  },
  {
    id: 'faq-4',
    question: "How is dynamic Choghadiya calculated for my specific city?",
    answer: "Dynamic Choghadiya calculates auspicious and inauspicious Muhurats based on your city's exact geographic coordinates. The time between local sunrise and sunset (Dina Mana) is divided into 8 equal daytime segments, and the time between sunset and next sunrise (Ratri Mana) is divided into 8 equal nighttime segments. Each segment is assigned a planetary ruler in a cyclical sequence starting with the day's ruler: Amrit (nectar), Shubh (auspicious), Labh (gain), Char (neutral/motion), Rog (disease), Kaal (loss), and Udveg (anxiety)."
  },
  {
    id: 'faq-5',
    question: "What makes this calculator more accurate than standard online panchangs?",
    answer: "Most generic online panchangs rely on pre-computed lookup tables calculated for a single arbitrary city (often Ujjain or Greenwich) with approximate sunrise times. This micro-tool runs client-side high-precision Swiss Ephemeris astronomical algorithms anchored to the Nirayana (sidereal) zodiac with Lahiri (Chitra Paksha) Ayanamsa. It computes exact topocentric solar and lunar coordinates and true horizon refraction for your selected city in real time, with 100% offline capability."
  }
];

export function FaqAccordion() {
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="mt-16 max-w-5xl mx-auto px-4 sm:px-6 text-left">
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <HelpCircle size={14} className="text-amber-400" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Vedic Astrometry & Panchang FAQ
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          Clear, mathematically verified answers to essential questions regarding Hindu calendar calculations, Udaya Tithi, and dynamic Muhurats.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((faq, index) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-[#090e1a]/90 border border-[#1a2542] overflow-hidden transition-all shadow-md hover:border-[#2a3860]"
            >
              <h3>
                <button
                  id={`faq-btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${faq.id}`}
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer group focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-2xl"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-[#11192e] border border-[#233152] flex items-center justify-center text-xs font-mono text-orange-400 shrink-0">
                      {index + 1}
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
                  />
                </button>
              </h3>

              <div
                id={`faq-panel-${faq.id}`}
                role="region"
                aria-labelledby={`faq-btn-${faq.id}`}
                className={`transition-all duration-300 ease-in-out px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed ${
                  isOpen ? 'block' : 'hidden'
                }`}
              >
                <div className="pt-2 border-t border-[#16213a]">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
