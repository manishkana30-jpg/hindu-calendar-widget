import { NextRequest, NextResponse } from 'next/server';
import { LocationCoordinates, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { compute48HourForecast } from '@/src/lib/notifications/morning-push';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const tzParam = searchParams.get('tz');
    const ianaTzParam = searchParams.get('ianaTz');

    const targetDate = dateParam ? new Date(`${dateParam}T06:00:00Z`) : new Date();

    const location: LocationCoordinates = (latParam && lonParam)
      ? {
          name: 'Target Location',
          latitude: parseFloat(latParam),
          longitude: parseFloat(lonParam),
          timezone: tzParam ? parseFloat(tzParam) : 5.5,
          ianaTimezone: ianaTzParam || undefined,
          country: 'India',
          regionName: 'Custom Region'
        }
      : PRESET_LOCATIONS[0];

    const forecast = compute48HourForecast(targetDate, location);

    return NextResponse.json(forecast, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
        'Content-Type': 'application/json'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ephemeris schedule error';
    return NextResponse.json(
      { error: 'Failed to compute 48-hour panchang schedule', details: message },
      { status: 500 }
    );
  }
}
