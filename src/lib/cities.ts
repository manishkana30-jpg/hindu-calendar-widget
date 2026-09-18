export interface CityData {
  slug: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ianaTimezone: string;
}

export const CITIES: CityData[] = [
  { slug: 'new-delhi', name: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'patna', name: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ujjain', name: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', country: 'India', latitude: 27.4924, longitude: 77.6737, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'surat', name: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Punjab', country: 'India', latitude: 30.7333, longitude: 76.7794, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'guwahati', name: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'london', name: 'London', state: 'Greater London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, ianaTimezone: 'Europe/London' },
  { slug: 'new-york', name: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: -5.0, ianaTimezone: 'America/New_York' },
  { slug: 'toronto', name: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: -5.0, ianaTimezone: 'America/Toronto' },
  { slug: 'san-francisco', name: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: -8.0, ianaTimezone: 'America/Los_Angeles' },
  { slug: 'dubai', name: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 4.0, ianaTimezone: 'Asia/Dubai' },
  { slug: 'singapore', name: 'Singapore', state: 'Central', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8.0, ianaTimezone: 'Asia/Singapore' },
  { slug: 'sydney', name: 'Sydney', state: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, ianaTimezone: 'Australia/Sydney' },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getAllCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}
