/**
 * Client-Side Location & Geolocation Service for Vedic Panchang
 * 
 * Capabilities:
 * 1. Explicit user-tap GPS acquisition via navigator.geolocation.
 * 2. Automatic IANA timezone resolution (Intl.DateTimeFormat).
 * 3. Graceful fallback hierarchy: GPS -> Dropdown City -> Last Known Location -> New Delhi baseline.
 * 4. Movement detection: checks if distance moved > 50 km (Haversine formula) or timezone changed.
 * 5. Local storage persistence & sync to backend subscription.
 */

import { LocationCoordinates, PRESET_LOCATIONS } from './vedic-astronomy';
import { CITIES } from './cities';

export type LocationSource = 'gps' | 'dropdown' | 'fallback';

export interface UserLocationState {
  location: LocationCoordinates;
  source: LocationSource;
  gpsActive: boolean;
  accuracyMeters?: number;
  lastUpdated: number;
}

const STORAGE_KEY_LOCATION = 'panchang_user_location';
const STORAGE_KEY_SOURCE = 'panchang_location_source';

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula (in kilometers).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest registered city from the catalog if within 50 km.
 */
function findNearestCity(lat: number, lon: number): { name: string; country: string; state?: string } | null {
  let closestDist = Infinity;
  let closestCity: (typeof CITIES)[0] | null = null;

  for (const c of CITIES) {
    const d = calculateHaversineDistanceKm(lat, lon, c.latitude, c.longitude);
    if (d < closestDist) {
      closestDist = d;
      closestCity = c;
    }
  }

  if (closestCity && closestDist <= 60) {
    return {
      name: closestCity.name,
      country: closestCity.country,
      state: closestCity.state
    };
  }

  return null;
}

/**
 * Resolves current IANA timezone and UTC numeric offset.
 */
export function resolveCurrentTimezone(): { ianaTimezone: string; numericOffset: number } {
  let ianaTimezone = 'Asia/Kolkata';
  try {
    ianaTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    // fallback
  }

  const now = new Date();
  const numericOffset = -now.getTimezoneOffset() / 60;

  return { ianaTimezone, numericOffset };
}

/**
 * Retrieves the currently saved location from localStorage, or defaults to New Delhi.
 */
export function getSavedLocationState(): UserLocationState {
  if (typeof window === 'undefined') {
    return {
      location: PRESET_LOCATIONS[0],
      source: 'fallback',
      gpsActive: false,
      lastUpdated: Date.now()
    };
  }

  try {
    const rawLoc = localStorage.getItem(STORAGE_KEY_LOCATION);
    const source = (localStorage.getItem(STORAGE_KEY_SOURCE) as LocationSource) || 'fallback';

    if (rawLoc) {
      const parsedLoc = JSON.parse(rawLoc) as LocationCoordinates;
      return {
        location: parsedLoc,
        source,
        gpsActive: source === 'gps',
        lastUpdated: Date.now()
      };
    }
  } catch (err) {
    console.warn('Error reading saved location:', err);
  }

  return {
    location: PRESET_LOCATIONS[0],
    source: 'fallback',
    gpsActive: false,
    lastUpdated: Date.now()
  };
}

/**
 * Saves location to localStorage and optionally syncs to server subscription.
 */
export function persistLocationState(loc: LocationCoordinates, source: LocationSource): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    localStorage.setItem(STORAGE_KEY_SOURCE, source);
  } catch (err) {
    console.warn('Error saving location:', err);
  }
}

/**
 * Explicit User-Tap GPS Location Request.
 * Must only be called following a direct user interaction.
 */
export async function requestGpsLocation(): Promise<{
  success: boolean;
  location?: LocationCoordinates;
  source: LocationSource;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      success: false,
      source: 'dropdown',
      error: 'Geolocation is not supported by your browser.'
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        const accuracy = pos.coords.accuracy;

        const { ianaTimezone, numericOffset } = resolveCurrentTimezone();
        const nearest = findNearestCity(lat, lon);

        const displayName = nearest
          ? `${nearest.name} (GPS)`
          : `GPS (${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'})`;

        const location: LocationCoordinates = {
          name: displayName,
          country: nearest?.country || 'Local Coordinates',
          latitude: lat,
          longitude: lon,
          timezone: numericOffset,
          ianaTimezone,
          regionName: nearest?.state || 'GPS Location'
        };

        persistLocationState(location, 'gps');

        resolve({
          success: true,
          location,
          source: 'gps'
        });
      },
      (err) => {
        let errorMsg = 'Failed to get location.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Using city dropdown fallback.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable. Using city dropdown fallback.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Location request timed out. Using city dropdown fallback.';
        }

        // Keep current saved or fallback location
        const current = getSavedLocationState();
        persistLocationState(current.location, 'dropdown');

        resolve({
          success: false,
          location: current.location,
          source: 'dropdown',
          error: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Checks if the user has moved > 50 km or changed timezone compared to saved location.
 * If yes, returns true so the client can recompute the schedule.
 */
export function checkHasMovedSignificantly(
  currentLoc: LocationCoordinates,
  newLat: number,
  newLon: number,
  newIanaTz?: string
): boolean {
  const distKm = calculateHaversineDistanceKm(currentLoc.latitude, currentLoc.longitude, newLat, newLon);
  if (distKm > 50) {
    return true;
  }

  if (newIanaTz && currentLoc.ianaTimezone && newIanaTz !== currentLoc.ianaTimezone) {
    return true;
  }

  return false;
}
