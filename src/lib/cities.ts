export interface CityData {
  slug: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ianaTimezone: string;
  isMetro?: boolean;
}

export const CITIES: CityData[] = [
  // ── Top Indian Metros (Priority 0.9 in Sitemap) ──
  { slug: 'new-delhi', name: 'New Delhi', state: 'Delhi NCR', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'delhi', name: 'Delhi', state: 'Delhi NCR', country: 'India', latitude: 28.6692, longitude: 77.4538, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },

  // ── High-Volume Cultural, Sacred & Tier-1/2 Indian Cities ──
  { slug: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', latitude: 28.6692, longitude: 77.4538, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'varanasi', name: 'Varanasi (Kashi)', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 5.5, ianaTimezone: 'Asia/Kolkata', isMetro: true },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'patna', name: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Punjab & Haryana', country: 'India', latitude: 30.7333, longitude: 76.7794, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ujjain', name: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', country: 'India', latitude: 27.4924, longitude: 77.6737, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'surat', name: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'guwahati', name: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', latitude: 25.4358, longitude: 81.8463, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'agra', name: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', country: 'India', latitude: 30.9010, longitude: 75.8573, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'faridabad', name: 'Faridabad', state: 'Haryana', country: 'India', latitude: 28.4089, longitude: 77.3178, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', country: 'India', latitude: 28.9845, longitude: 77.7064, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'rajkot', name: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'amritsar', name: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', country: 'India', latitude: 23.3441, longitude: 85.3096, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', latitude: 23.1815, longitude: 79.9864, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh', country: 'India', latitude: 26.2183, longitude: 78.1828, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'madurai', name: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'raipur', name: 'Raipur', state: 'Chhattisgarh', country: 'India', latitude: 21.2514, longitude: 81.6296, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'kota', name: 'Kota', state: 'Rajasthan', country: 'India', latitude: 25.2138, longitude: 75.8648, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'mysuru', name: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.3165, longitude: 78.0322, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', country: 'India', latitude: 30.0869, longitude: 78.2676, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'tirupati', name: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'puri', name: 'Puri', state: 'Odisha', country: 'India', latitude: 19.8135, longitude: 85.8312, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'jammu', name: 'Jammu', state: 'Jammu and Kashmir', country: 'India', latitude: 32.7266, longitude: 74.8570, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'srinagar', name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, timezone: 5.5, ianaTimezone: 'Asia/Kolkata' },

  // ── Global Vedic & Diaspora Metros ──
  { slug: 'kathmandu', name: 'Kathmandu', state: 'Bagmati', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timezone: 5.75, ianaTimezone: 'Asia/Kathmandu' },
  { slug: 'london', name: 'London', state: 'Greater London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 0.0, ianaTimezone: 'Europe/London' },
  { slug: 'new-york', name: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: -5.0, ianaTimezone: 'America/New_York' },
  { slug: 'toronto', name: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: -5.0, ianaTimezone: 'America/Toronto' },
  { slug: 'san-francisco', name: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: -8.0, ianaTimezone: 'America/Los_Angeles' },
  { slug: 'dubai', name: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 4.0, ianaTimezone: 'Asia/Dubai' },
  { slug: 'singapore', name: 'Singapore', state: 'Central', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 8.0, ianaTimezone: 'Asia/Singapore' },
  { slug: 'sydney', name: 'Sydney', state: 'New South Wales', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 10.0, ianaTimezone: 'Australia/Sydney' },
];

export function getCityBySlug(slug: string): CityData | undefined {
  const normalized = slug.toLowerCase().trim();
  const direct = CITIES.find((c) => c.slug.toLowerCase() === normalized);
  if (direct) return direct;

  // Handle common aliases
  if (normalized === 'delhi') return CITIES.find((c) => c.slug === 'new-delhi');
  if (normalized === 'kashi') return CITIES.find((c) => c.slug === 'varanasi');
  if (normalized === 'allahabad') return CITIES.find((c) => c.slug === 'prayagraj');
  if (normalized === 'bangalore') return CITIES.find((c) => c.slug === 'bengaluru');
  if (normalized === 'calcutta') return CITIES.find((c) => c.slug === 'kolkata');
  if (normalized === 'madras') return CITIES.find((c) => c.slug === 'chennai');
  if (normalized === 'gurugram' || normalized === 'gurgaon') return CITIES.find((c) => c.slug === 'delhi');

  return undefined;
}

export function getAllCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}
