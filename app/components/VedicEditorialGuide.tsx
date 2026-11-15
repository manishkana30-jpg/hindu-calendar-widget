import React from 'react';
import { BookOpen, Compass, Sun, Moon, Calculator } from 'lucide-react';

export function VedicEditorialGuide() {
  return (
    <article className="mt-16 text-left max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-3">
          <BookOpen size={14} className="text-orange-400" />
          <span>Authoritative Vedic Astrometry Compendium</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          The Mathematical Science of <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500">
            Vedic Timekeeping & Astrometry
          </span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto mt-3">
          A definitive computational analysis of solar-lunar mechanics, Ghati sexagesimal division, Udaya Tithi canonical determination, and dynamic city-specific Muhurat calculations.
        </p>
      </div>

      <div className="space-y-10">

        {/* Chapter 1: Mathematical Foundations of Vedic Time */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-orange-400 tracking-wider uppercase">Section 1.0 • Mathematical Division</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Sexagesimal Timekeeping: 60 Ghati, 3,600 Pala, 216,000 Vipala
              </h3>
            </div>
          </div>

          <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Unlike the contemporary Gregorian civil clock which divides the 24-hour mean solar day into 86,400 seconds (base-10 / base-60 hybrid), classic Vedic astrometry—codified in the <em>Surya Siddhanta</em> and <em>Vedanga Jyotisha</em>—operates on a pure sexagesimal (base-60) division of the <strong>Ahoratra</strong> (the complete day-night cycle from sunrise to next sunrise).
            </p>

            <div className="overflow-x-auto my-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#233152] text-neutral-400 font-mono">
                    <th className="py-2.5 px-3">Vedic Unit</th>
                    <th className="py-2.5 px-3">Sexagesimal Sub-division</th>
                    <th className="py-2.5 px-3">Standard Equivalent</th>
                    <th className="py-2.5 px-3">Daily Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16213a] text-neutral-200">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-orange-300">1 Ahoratra (Day-Night)</td>
                    <td className="py-2.5 px-3 font-mono">Fundamental Cycle</td>
                    <td className="py-2.5 px-3">24 Hours (Mean Solar)</td>
                    <td className="py-2.5 px-3 font-mono">1 Cycle</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-orange-300">1 Ghati (Nadi)</td>
                    <td className="py-2.5 px-3 font-mono">1/60th of Ahoratra</td>
                    <td className="py-2.5 px-3">24 Minutes</td>
                    <td className="py-2.5 px-3 font-mono">60 Ghatis</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-orange-300">1 Pala (Vighati)</td>
                    <td className="py-2.5 px-3 font-mono">1/60th of Ghati</td>
                    <td className="py-2.5 px-3">24 Seconds</td>
                    <td className="py-2.5 px-3 font-mono">3,600 Palas</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-orange-300">1 Vipala</td>
                    <td className="py-2.5 px-3 font-mono">1/60th of Pala</td>
                    <td className="py-2.5 px-3">0.4 Seconds (400 ms)</td>
                    <td className="py-2.5 px-3 font-mono">216,000 Vipalas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              In our live widget, the <strong>Ishta Kaal</strong> represents the exact elapsed sacred duration since the morning's local astronomical sunrise. Because the Earth's orbital velocity and axial tilt fluctuate throughout the tropical year (producing changing day lengths), the Ishta Kaal continuously computes real-time topocentric coordinates for absolute fidelity.
            </p>
          </div>
        </section>

        {/* Chapter 2: Astronomical Definition of a Tithi & Udaya Tithi */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Moon size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Section 2.0 • Soli-Lunar Geometry</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                The 12° Lunar Separation & The Canon of Udaya Tithi
              </h3>
            </div>
          </div>

          <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Astronomically, a <strong>Tithi</strong> is defined as the longitudinal angle traversed by the Moon in excess of the Sun by exactly <strong>12 degrees</strong>:
            </p>

            <div className="p-4 rounded-2xl bg-[#0e1629] border border-[#233152] font-mono text-xs sm:text-sm text-center text-amber-300">
              Tithi Number = Floor( (Apparent Lunar Longitude − Apparent Solar Longitude) / 12° ) + 1
            </div>

            <p>
              Because the Moon moves along an elliptical orbit governed by Kepler's laws of planetary motion, its apparent daily speed varies from approximately 11°48′ to 15°12′ per solar day. Consequently, the actual physical duration of a single Tithi is dynamic: it can span anywhere from <strong>19 to 26 hours</strong>.
            </p>

            <div className="bg-[#11192e] p-5 rounded-2xl border-l-4 border-amber-500 space-y-2">
              <h4 className="text-white font-bold text-sm sm:text-base">Why Udaya Tithi Dictates Hindu Observances</h4>
              <p className="text-xs sm:text-sm text-neutral-300">
                In classical <em>Dharmashastra</em> jurisprudence (notably <em>Nirnayasindhu</em> and <em>Dharmasindhu</em>), a civil day is sanctified by the <strong>Udaya Tithi</strong>—the specific Tithi active at the precise mathematical instant the Sun's upper limb touches the local horizon. Even if the Tithi terminates minutes after sunrise, the ritual merit, vrat, or festival associated with that Udaya Tithi rules the entire Hindu calendar day.
              </p>
            </div>
          </div>
        </section>

        {/* Chapter 3: Dynamic City-Specific Choghadiya Muhurats */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sun size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">Section 3.0 • Dynamic Muhurat Science</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Dina Mana & Ratri Mana: Computing 8-Fold Choghadiya
              </h3>
            </div>
          </div>

          <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Generic calendars erroneously assume fixed 90-minute Choghadiya intervals. In authentic Vedic astrometry, daytime and nighttime durations are never uniform across distinct latitudes or seasons:
            </p>

            <ul className="list-disc list-inside space-y-2 pl-2 text-neutral-300 text-xs sm:text-sm">
              <li><strong className="text-white">Dina Mana:</strong> Exact duration from local Sunrise to local Sunset, segmented into 8 equal daytime Muhurats.</li>
              <li><strong className="text-white">Ratri Mana:</strong> Exact duration from local Sunset to next morning's Sunrise, segmented into 8 equal nighttime Muhurats.</li>
            </ul>

            <p>
              Each segment is governed by one of the 7 classic rulers in an ancient planetary cycle anchored to the lord of the weekday:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold block text-sm">Amrit (अमृत)</span>
                Auspicious (Nectar)
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold block text-sm">Shubh (शुभ)</span>
                Auspicious (Fortunate)
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold block text-sm">Labh (लाभ)</span>
                Auspicious (Gain)
              </div>
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300">
                <span className="font-bold block text-sm">Char (चर)</span>
                Neutral (Movement)
              </div>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                <span className="font-bold block text-sm">Rog (रोग)</span>
                Inauspicious (Disease)
              </div>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                <span className="font-bold block text-sm">Kaal (काल)</span>
                Inauspicious (Loss)
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                <span className="font-bold block text-sm">Udveg (उद्वेग)</span>
                Inauspicious (Anxiety)
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 4: Amanta vs. Purnimanta & Adhika Masa Derivation */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#090e1a]/90 border border-[#1a2542] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider uppercase">Section 4.0 • Lunisolar Synchronization</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Amanta vs. Purnimanta Month Systems & Adhika Masa
              </h3>
            </div>
          </div>

          <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              The Hindu calendar synthesizes both lunar months and solar transit cycles (Sankrantis). Across the Indian subcontinent, two complementary reckoning systems exist:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="p-5 rounded-2xl bg-[#0e1629] border border-[#233152]">
                <h4 className="font-bold text-orange-400 text-sm mb-2">Amanta (अमान्त) Calendar</h4>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Prevails in Southern and Western India (Maharashtra, Gujarat, Karnataka, Andhra Pradesh, Tamil Nadu). The lunar month begins after the New Moon (Amavasya) and culminates with the subsequent Amavasya.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0e1629] border border-[#233152]">
                <h4 className="font-bold text-amber-400 text-sm mb-2">Purnimanta (पूर्णिमान्त) Calendar</h4>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Prevails in Northern India (Uttar Pradesh, Rajasthan, Bihar, Madhya Pradesh, Punjab). The month begins after the Full Moon (Purnima) with Krishna Paksha and culminates on the subsequent Purnima.
                </p>
              </div>
            </div>

            <h4 className="text-white font-bold text-sm sm:text-base pt-2">How Adhika Masa (Leap Month) is Derived</h4>
            <p>
              A solar year consists of ~365.25 days, whereas 12 lunar months comprise approximately 354.36 days—yielding an annual discrepancy of ~11 days. To prevent seasonal drift of sacred festivals like Diwali and Holi, ancient astronomers introduced <strong>Adhika Masa</strong> (Purushottama Masa). When a lunar month elapses without a single <em>Surya Sankranti</em> (solar ingress into a new Rashi zodiac sign), that lunar month is declared an intercalary Adhika Masa, occurring roughly once every 32.5 months.
            </p>
          </div>
        </section>

      </div>

    </article>
  );
}
