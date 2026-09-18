import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getCityBySlug } from '@/src/lib/cities';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citySlug = searchParams.get('city');

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

    const tithiName = panchang.tithi.name || 'Shukla Saptami';
    const pakshaName = panchang.tithi.paksha || 'Shukla Paksha';
    const samvatYear = panchang.vikramSamvat || '2083';
    const choghadiya = panchang.currentChoghadiya 
      ? `${panchang.currentChoghadiya.name} (${panchang.currentChoghadiya.nature})`
      : 'Amrit (Auspicious)';

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
            padding: '50px 60px',
            backgroundColor: '#050811',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.15), transparent 70%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.12), transparent 70%)',
            fontFamily: 'sans-serif',
            color: '#ffffff',
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '38px' }}>🕉️</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Hindu Calendar & Live Panchang
                </span>
                <span style={{ fontSize: '14px', color: '#fb923c', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Vedic Astrometry Engine • Live Panchang
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
                fontSize: '14px',
                fontWeight: 600,
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
              <span>100% Offline PWA • Swiss Ephemeris Precision</span>
            </div>
          </div>

          {/* Main Card Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '36px 40px',
              borderRadius: '24px',
              backgroundColor: 'rgba(9, 14, 26, 0.85)',
              border: '1px solid rgba(35, 49, 82, 0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', color: '#94a3b8' }}>
                📍 {cityName} • {formattedDate}
              </span>
              <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 600 }}>
                Vikram Samvat {samvatYear}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <span style={{ fontSize: '46px', fontWeight: 900, color: '#f8fafc' }}>
                {tithiName}
              </span>
              <span style={{ fontSize: '24px', color: '#fb923c', fontWeight: 600 }}>
                ({pakshaName})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase' }}>Active Muhurat</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#34d399' }}>{choghadiya}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase' }}>Udaya Tithi</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>Until {panchang.tithi.endTime}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase' }}>Nakshatra</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#cbd5e1' }}>{panchang.nakshatra.name}</span>
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#64748b' }}>
            <span>https://vikram-samvat-widget.vercel.app/</span>
            <span>Real-time Ghati • Pala • Vipala • Dynamic Choghadiya</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
