"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, X, MapPin, Compass, ChevronRight, Sparkles } from 'lucide-react';
import { TOP_CITIES, CityConfig, getLocalizedCityName, REGIONAL_CITY_NAMES } from '@/src/lib/constants/cities';
import { useLanguage } from '@/src/context/LanguageContext';

const POPULAR_SLUGS = [
  'new-delhi',
  'varanasi',
  'mumbai',
  'ayodhya',
  'ujjain',
  'haridwar',
  'ahmedabad',
  'pune',
  'bengaluru',
  'jaipur',
  'lucknow',
  'kolkata',
];

export function CitySearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname() || '';
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  // Detect current language prefix from route: /hi/, /mr/, /gu/, or default English
  const routeLang = useMemo(() => {
    if (pathname.startsWith('/hi/')) return 'hi';
    if (pathname.startsWith('/mr/')) return 'mr';
    if (pathname.startsWith('/gu/')) return 'gu';
    return language === 'hi' || language === 'mr' || language === 'gu' ? language : 'en';
  }, [pathname, language]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Build target city link based on active language prefix
  const getCityLink = (slug: string) => {
    if (routeLang === 'hi') return `/hi/panchang/${slug}`;
    if (routeLang === 'mr') return `/mr/panchang/${slug}`;
    if (routeLang === 'gu') return `/gu/panchang/${slug}`;
    return `/panchang/${slug}`;
  };

  const citiesList = useMemo(() => Object.values(TOP_CITIES), []);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return citiesList;

    return citiesList.filter((city) => {
      const matchName = city.name.toLowerCase().includes(q);
      const matchHindi = city.hindiName?.toLowerCase().includes(q);
      const matchState = city.state.toLowerCase().includes(q);
      const regional = REGIONAL_CITY_NAMES[city.slug];
      const matchMr = regional?.mr?.toLowerCase().includes(q);
      const matchGu = regional?.gu?.toLowerCase().includes(q);
      return matchName || matchHindi || matchState || matchMr || matchGu;
    });
  }, [citiesList, query]);

  // Popular cities
  const popularCities = useMemo(() => {
    return POPULAR_SLUGS.map((slug) => TOP_CITIES[slug]).filter(Boolean) as CityConfig[];
  }, []);

  const searchButtonLabel = useMemo(() => {
    if (routeLang === 'hi') return 'शहर खोजें';
    if (routeLang === 'mr') return 'शहर शोधा';
    if (routeLang === 'gu') return 'શહેર શોધો';
    return 'Search Cities';
  }, [routeLang]);

  const placeholderLabel = useMemo(() => {
    if (routeLang === 'hi') return '60+ शहर खोजें (वाराणसी, दिल्ली, मुंबई, राज्य)...';
    if (routeLang === 'mr') return '60+ शहरे शोधा (मुंबई, पुणे, वाराणसी)...';
    if (routeLang === 'gu') return '60+ શહેરો શોધો (અમદાવાદ, સુરત, વારાણસી)...';
    return 'Search 60+ cities by name, Hindi, or state...';
  }, [routeLang]);

  return (
    <>
      {/* ── Navbar Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open City Search"
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 hover:from-orange-500/25 hover:to-amber-500/25 border border-amber-500/30 dark:border-orange-500/40 hover:border-amber-500 text-xs font-bold text-stone-800 dark:text-amber-200 hover:text-stone-950 dark:hover:text-white transition-all shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] group active:scale-95"
      >
        <Search size={13} className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="hidden xs:inline">{searchButtonLabel}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-mono border border-amber-500/30 dark:border-amber-500/40 hidden md:inline">
          60+
        </span>
      </button>

      {/* ── Modal Dialog ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search City Panchang"
          className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 sm:pt-20 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#fdfbf7] dark:bg-[#090e1a] border border-[#e2d5bd] dark:border-[#1a2542] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp text-stone-900 dark:text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Search Bar */}
            <div className="p-4 sm:p-5 border-b border-[#e7dac2] dark:border-[#162038] bg-[#f7f0e0] dark:bg-[#070b16]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Compass size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight">
                      {routeLang === 'hi' ? 'दैनिक पंचांग — शहर चुनें' : routeLang === 'mr' ? 'दैनिक पंचांग — शहर निवडा' : routeLang === 'gu' ? 'દૈનિક પંચાંગ — શહેર પસંદ કરો' : 'City Vedic Panchang Matrix'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-600 dark:text-neutral-400">
                      {routeLang === 'hi' ? '60+ भारतीय शहरों के लिए सटीक वैदिक गणना' : routeLang === 'mr' ? '60+ शहरांसाठी अचूक वैदिक पंचांग' : routeLang === 'gu' ? '60+ શહેરો માટે ચોક્કસ વૈદિક પંચાંગ' : 'Exact topocentric ephemeris calculated for 60+ Indian cities'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-[#ede2cb] dark:bg-[#11192e] hover:bg-[#e2d3b5] dark:hover:bg-[#1a2542] text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  aria-label="Close City Search"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholderLabel}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#d8c7a8] dark:border-[#233152] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white p-0.5"
                    aria-label="Clear input"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Language Switcher inside modal */}
              <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#e2d5bd]/60 dark:border-[#162038]/60 overflow-x-auto text-[11px]">
                <span className="text-stone-600 dark:text-neutral-400 text-[10px] uppercase font-mono mr-1">Language:</span>
                {[
                  { code: 'en', label: 'English', pathPrefix: '' },
                  { code: 'hi', label: 'हिन्दी', pathPrefix: '/hi' },
                  { code: 'mr', label: 'मराठी', pathPrefix: '/mr' },
                  { code: 'gu', label: 'ગુજરાતી', pathPrefix: '/gu' },
                ].map((l) => {
                  const isActive = routeLang === l.code;
                  return (
                    <Link
                      key={l.code}
                      href={l.pathPrefix ? `${l.pathPrefix}/panchang/new-delhi` : '/panchang/new-delhi'}
                      onClick={() => setIsOpen(false)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-600 dark:bg-orange-500 text-white shadow-sm'
                          : 'bg-[#ede2cb] dark:bg-[#11192e] text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white hover:bg-[#e2d3b5] dark:hover:bg-[#1a2542] border border-[#d8c7a8] dark:border-[#233152]'
                      }`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Popular Quick-Pick Chips */}
            {!query && (
              <div className="px-4 py-3 bg-[#f5ede0] dark:bg-[#0a101f] border-b border-[#e7dac2] dark:border-[#162038]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  <Sparkles size={12} />
                  <span>
                    {routeLang === 'hi' ? 'लोकप्रिय तीर्थ एवं प्रमुख नगर' : routeLang === 'mr' ? 'लोकप्रिय शहरे व तीर्थक्षेत्रे' : routeLang === 'gu' ? 'લોકપ્રિય શહેરો અને તીર્થધામ' : 'Popular Cultural Hubs & Metros'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularCities.map((c) => {
                    const localizedName = getLocalizedCityName(c, routeLang);
                    return (
                      <Link
                        key={c.slug}
                        href={getCityLink(c.slug)}
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#11192e] hover:bg-orange-500/10 dark:hover:bg-orange-500/20 hover:border-orange-500/50 border border-[#e2d5bd] dark:border-[#233152] text-xs text-stone-700 dark:text-neutral-300 hover:text-orange-900 dark:hover:text-orange-200 transition-colors flex items-center gap-1"
                      >
                        <span>{localizedName}</span>
                        {routeLang !== 'en' && <span className="text-[10px] text-stone-500 dark:text-neutral-500">({c.name})</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* City List Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 divide-y divide-[#162038]/40">
              {filteredCities.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <Compass size={28} className="mx-auto mb-2 opacity-40 text-orange-400" />
                  <p className="text-sm font-semibold">No city found matching &quot;{query}&quot;</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Try searching for state or nearby district.
                  </p>
                </div>
              ) : (
                filteredCities.map((city) => {
                  const localizedName = getLocalizedCityName(city, routeLang);
                  return (
                    <Link
                      key={city.slug}
                      href={getCityLink(city.slug)}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-amber-100/50 dark:hover:bg-[#11192e] border border-transparent hover:border-amber-300 dark:hover:border-[#233152] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0f172a] border border-[#e2d5bd] dark:border-[#233152] flex items-center justify-center text-stone-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:border-orange-500/40 transition-colors shrink-0">
                          <MapPin size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors truncate">
                              {localizedName}
                            </span>
                            {routeLang !== 'en' && (
                              <span className="text-xs text-stone-500 dark:text-neutral-400 truncate">
                                ({city.name})
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ede3cf] dark:bg-[#1a2542] text-stone-700 dark:text-neutral-300 border border-[#ddcca9] dark:border-[#2a3a5e] shrink-0">
                              {city.state}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 dark:text-neutral-500 font-mono block">
                            {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E • {city.timezone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors shrink-0">
                        <span className="hidden sm:inline text-[11px] font-medium">View Panchang</span>
                        <ChevronRight size={14} />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-3.5 bg-[#f7f0e0] dark:bg-[#070b16] border-t border-[#e7dac2] dark:border-[#162038] flex items-center justify-between text-[11px] text-stone-600 dark:text-neutral-400">
              <span className="font-mono text-[10px]">
                Showing {filteredCities.length} of {citiesList.length} cities
              </span>
              <span className="text-stone-500 dark:text-neutral-500 text-[10px]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#ede2cb] dark:bg-[#162038] text-stone-800 dark:text-neutral-300 font-mono text-[9px]">ESC</kbd> to exit
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
