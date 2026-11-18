Live Demo: https://dailytithi.com — Most online Hindu calendars treat an entire country as a single static timestamp, even though a 40-minute sunrise shift across Indian longitudes can change a festival date or auspicious window completely. To solve this without hammering serverless compute, I built **Daily Tithi**, a real-time Vedic Panchang and Muhurat engine powered by **Next.js 15 Incremental Static Regeneration (ISR)** with `generateStaticParams`, topocentric astronomical math, and **sticky-column mobile tables** tuned for 320px–390px screens.

---

## The Engineering Problem: Why Static Calendars Break Across Longitudes

India operates on a single civil timezone—IST (`UTC+5:30`)—spanning nearly 30 degrees of longitude. Yet Vedic timekeeping is strictly **topocentric**, anchored to local sunrise and sunset rather than civil midnight.

Compare two major cities in the same timezone: **Varanasi** (`25.32°N, 82.97°E`) and **Mumbai** (`19.08°N, 72.88°E`). Because Varanasi lies more than 10 degrees east of Mumbai, the Sun rises roughly 40 minutes earlier there. That offset breaks static calendars in two critical ways:

1. **Udaya Tithi Shifts:** Under Dharma Shastra rules (*Nirnayasindhu* and *Surya Siddhanta*), the civil day's prevailing lunar day (*Udaya Tithi*) is whichever 12-degree Moon–Sun elongation segment is active at **local sunrise**. If a Tithi ends at 6:30 AM IST, Varanasi (sunrise ~6:15 AM) observes that Tithi all day, whereas Mumbai (sunrise ~6:47 AM) wakes up in the next Tithi. You can see how local solar coordinates govern the live calculation on the [Varanasi city Panchang page](https://dailytithi.com/panchang/varanasi), and how strict sunrise-anchored rules like *Dashami Vedha* determine fasting and *Parana* (fast-breaking) windows on our [Ekadashi Vrat schedule](https://dailytithi.com/vrat/ekadashi-vrat).
2. **Dynamic 1/8th Daytime *Rahu Kaal*:** Many legacy apps hardcode *Rahu Kaal* as a flat 90-minute block. In reality, daytime length (*Dina Mana* = local sunset minus local sunrise) expands in summer and contracts in winter. Authentic *Rahu Kaal* divides *Dina Mana* into **8 equal segments**, picking a weekday-specific slot:

```ts
// src/lib/vedic-astronomy.ts
const sunriseJd = getJulianDay(sunTimes.sunriseDate);
const sunriseElongation = getElongationAngle(sunriseJd);
const udayaTithiIndex = Math.min(
  30,
  Math.max(1, Math.floor(sunriseElongation / 12) + 1)
); // 1 to 30
const endTimeUtc = findTithiEndTime(sunTimes.sunriseDate, udayaTithiIndex, currentTz);

// Dynamic 1/8th Dina Mana segmentation for Rahu Kaal
const partLength = sunTimes.dayLengthMinutes / 8;
const rahuDayParts = [8, 2, 7, 5, 6, 4, 3]; // Sun..Sat
const rahuPart = rahuDayParts[dayOfWeek] - 1;
const rahuStart = sunTimes.sunriseMinutes + rahuPart * partLength;
const rahuEnd = rahuStart + partLength;
```

Instead of pulling pre-baked JSON tables from a database, our calculation engine evaluates Julian Day, Lahiri Ayanamsa, solar/lunar longitudes, and *Dina Mana* intervals directly from each city's latitude, longitude, and IANA timezone.

---

## Architecture & Next.js 15 ISR (`generateStaticParams`)

Running pure-TypeScript astronomical math on every request is fast, but rendering 60+ city pages dynamically on every crawler hit wastes serverless invocations and hurts TTFB.

With **Next.js 15 App Router**, we combine `generateStaticParams` with hourly **Incremental Static Regeneration (`revalidate = 3600`)** and `dynamicParams = true`. At build time, Next.js pre-renders static HTML and JSON-LD structured data for every registered city; in production, edge caches serve instant responses while silently refreshing once per hour so Tithi transitions, sunrise/sunset, and *Rahu Kaal* stay fresh.

Notice also Next.js 15's async `params` signature (`Promise<{ city: string }>`):

```tsx
// app/panchang/[city]/page.tsx
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TOP_CITIES).map((slug) => ({
    city: slug,
  }));
}

export default async function CityPanchangPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityConfig(citySlug);
  if (!city) notFound();

  const cityLocation: LocationCoordinates = {
    name: `${city.name}, ${city.state}`,
    country: 'India',
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: 5.5,
    ianaTimezone: city.timezone || 'Asia/Kolkata',
    regionName: city.state,
  };

  const panchang = calculatePanchang(new Date(), cityLocation);

  return (
    <HinduPanchangWidget
      initialCity={city}
      initialLocation={cityLocation}
      initialData={panchang}
      isCityPage={true}
      initialLanguage="en"
    />
  );
}
```

Passing `initialData={panchang}` directly from the Server Component eliminates client-side loading spinners, delivers zero Cumulative Layout Shift (`CLS = 0`), and lets the client widget take over seamlessly for live second-by-second clocks, GPS auto-detection, and instant English/Hindi switching.

---

## Responsive Astronomical Tables on 360px Screens

Over 80% of Panchang lookups happen on mobile phones first thing in the morning. Rendering a 4-column monthly almanac—Date & Vara, Paksha & Tithi with exact end-times, Lunar Masa, and Dharma Shastra observance rules—on a `360px` viewport usually collapses into unreadable wrapped text or causes horizontal page overflow.

To keep dense tables effortless on narrow screens, we use three targeted Tailwind CSS patterns in `MonthlyVedicCalendar.tsx`:

1. **Isolated Horizontal Scroll Context:** `overflow-x-auto overscroll-x-contain touch-pan-x` prevents table swipes from triggering browser back-navigation gestures or breaking outer page width.
2. **Pinned First Column (`sticky left-0`):** Locking the `76px` Date column with an opaque background (`bg-[#090e1a]`) and elevated `z-index` (`z-30` on the corner `<th>`, `z-10` on body `<td>`) lets readers pan across Tithi end-times and Vrat notes without losing track of which day they are inspecting.
3. **Tabular Numerals (`tabular-nums` + `whitespace-nowrap`):** Applying `tabular-nums` on every live clock, Sunrise/Sunset badge, and Muhurat window ensures equal-width glyphs so timestamps align vertically and never jitter as seconds tick.

```tsx
// app/components/MonthlyVedicCalendar.tsx
<div className="relative w-full overflow-x-auto overscroll-x-contain touch-pan-x rounded-2xl border border-[#1a2542] bg-[#090e1a]">
  <table className="w-full min-w-[640px] sm:min-w-full border-collapse text-left">
    <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-[#1e2d4f] text-[11px] uppercase">
      <tr>
        <th
          scope="col"
          className="sticky left-0 z-30 bg-[#0d1424] border-r border-[#1e2d4f] p-2.5 min-w-[76px] whitespace-nowrap"
        >
          Date &amp; Day
        </th>
        <th scope="col" className="p-2.5 min-w-[170px] whitespace-nowrap">
          Paksha &amp; Tithi
        </th>
        <th scope="col" className="p-2.5 min-w-[110px] whitespace-nowrap">
          Masa
        </th>
        <th scope="col" className="p-2.5 min-w-[240px] whitespace-nowrap">
          Vrat &amp; Dharma Shastra
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#162038]">
      {displayedDays.map((day) => (
        <tr key={day.dayNumber} className="group hover:bg-[#10192e]">
          <td className="sticky left-0 z-10 bg-[#090e1a] group-hover:bg-[#10192e] border-r border-[#162038] p-2 text-center min-w-[76px]">
            <span className="text-lg font-extrabold tabular-nums">
              {day.dayNumber}
            </span>
          </td>
          <td className="p-2.5 border-r border-[#162038] whitespace-nowrap">
            <div className="font-bold text-xs">{day.udayaTithi.name}</div>
            <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
              {day.tithiEndTime}
            </div>
          </td>
          {/* Masa & Dharma Shastra columns */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Key Takeaways

Combining pure-TypeScript topocentric astronomy with Next.js 15 ISR (`generateStaticParams` + hourly revalidation) gave us city-accurate Vedic timings at static-site speed, while `sticky left-0` columns and `tabular-nums` made dense almanac data genuinely comfortable on 360px phones.

If you're building localized time-sensitive apps in Next.js 15—or want to inspect how we handle *Udaya Tithi*, *Rahu Kaal*, and *Parana* edge cases—feel free to test the live app at https://dailytithi.com and drop your questions in the comments!
