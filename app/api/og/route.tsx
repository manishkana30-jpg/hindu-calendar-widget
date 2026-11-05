import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getCityBySlug } from '@/src/lib/cities';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get('city');
    const titleParam = searchParams.get('title');
    const quoteParam = searchParams.get('quote');

    let cityName = 'New Delhi';
    let location = PRESET_LOCATIONS[0];

    if (citySlug) {
      const city = getCityBySlug(citySlug);
      if (city) {
        cityName = `${city.name}, ${city.country}`;
        location = {
          name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
          timezone: city.timezone,
          ianaTimezone: city.ianaTimezone,
          regionName: city.state || city.name,
        };
      }
    }

    const now = new Date();
    const panchang = calculatePanchang(now, location);

    const tithiName = titleParam || panchang.udayaTithi?.name || panchang.tithi?.name || 'Shukla Saptami';
    const pakshaName = panchang.udayaTithi?.paksha || panchang.tithi?.paksha || 'Shukla Paksha';
    const samvatYear = panchang.vikramSamvat || '2083';
    const sunrise = panchang.sunrise || '06:30 AM';
    const sunset = panchang.sunset || '06:15 PM';
    const rahuKaal = panchang.muhurats?.rahuKaal ? `${panchang.muhurats.rahuKaal.start} – ${panchang.muhurats.rahuKaal.end}` : '09:00 AM – 10:30 AM';
    const abhijit = panchang.muhurats?.abhijitMuhurat ? `${panchang.muhurats.abhijitMuhurat.start} – ${panchang.muhurats.abhijitMuhurat.end}` : '11:45 AM – 12:35 PM';
    const quote = quoteParam || 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्';

    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 56px',
            backgroundColor: '#050811',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.2), transparent 70%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.15), transparent 70%)',
            fontFamily: 'sans-serif',
            color: '#ffffff',
          }}
        >
          {/* Top Brand Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '38px' }}>🕉️</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', color: '#f8fafc' }}>
                  Daily Tithi
                </span>
                <span style={{ fontSize: '13px', color: '#fb923c', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Live Vedic Astrometry • Swiss Ephemeris Precision
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: '#10b981',
                }}
              />
              <span>100% Free • Verified Dharmashastra</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '30px 36px',
              borderRadius: '24px',
              backgroundColor: 'rgba(9, 14, 26, 0.9)',
              border: '1px solid rgba(35, 49, 82, 0.9)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '17px', color: '#94a3b8', fontWeight: 600 }}>
                📍 {cityName} • {formattedDate}
              </span>
              <span style={{ fontSize: '15px', color: '#fbbf24', fontWeight: 700 }}>
                Vikram Samvat {samvatYear}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ fontSize: '44px', fontWeight: 900, color: '#f8fafc' }}>
                {tithiName}
              </span>
              <span style={{ fontSize: '22px', color: '#fb923c', fontWeight: 700 }}>
                ({pakshaName})
              </span>
            </div>

            {/* Sacred Quote / Subhashitam */}
            <div
              style={{
                display: 'flex',
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.25)',
                color: '#fef08a',
                fontSize: '15px',
                fontStyle: 'italic',
              }}
            >
              🌸 {quote}
            </div>

            {/* Timings Grid */}
            <div style={{ display: 'flex', gap: '20px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>🌅 Sunrise / Sunset</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{sunrise} | {sunset}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>⚡ Shubh Abhijit</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>{abhijit}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>⚠️ Rahu Kaal (Avoid)</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#f87171' }}>{rahuKaal}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>✨ Nakshatra</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#cbd5e1' }}>{panchang.nakshatra?.name || 'Ashwini'}</span>
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <span>https://dailytithi.com</span>
            <span>Accurate Nirayana Lahiri Ayanamsa • Real-time Choghadiya</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate the image: ${errorMsg}`, {
      status: 500,
    });
  }
}
