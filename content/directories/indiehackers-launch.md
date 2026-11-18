# Indie Hackers Launch & Milestone Kit — Daily Tithi

> **Verified Codebase Metrics (inspected directly from source):**
> - **Pre-configured Cities:** `64` cities total (`56` Indian cities + `8` global cities) pre-rendered via Next.js 15 `generateStaticParams` + hourly ISR (`revalidate = 3600`, `dynamicParams = true`)
> - **Programmatic Hubs:** `10` Vrat & Festival hubs (`/vrat/[slug]`) + `7` Life-Event Muhurat hubs (`/muhurat/[category]`)
> - **Core Engine & Features:** Swiss Ephemeris (`DE431`) + Lahiri Ayanamsa astronomy, Dharma Shastra rules (*Udaya Tithi*, *Dashami Vedha*, *Parana* windows), Rahu Kaal, Abhijit Muhurat, Choghadiya computation, bilingual English & Hindi (`hi`) routes, and 6:00 AM IST daily lock-screen alerts via Supabase + Vercel Cron (`30 0 * * *` UTC)
> - **Square Product Logo:** `public/launch/indiehackers/logo-400.png` (`400×400` PNG)

---

## 1. Product Profile Fields (Indie Hackers Products DB)

- **Product Name:** `Daily Tithi`
- **Tagline:** `Live sunrise-adjusted Vedic Panchang, Rahu Kaal & Muhurat web app`
- **Website URL:** `https://dailytithi.com`
- **Stage / Revenue Status:** `Growing / Pre-revenue`
- **Business Model:** `Free (Ad-supported / SaaS roadmap)`
- **Product Logo:** `public/launch/indiehackers/logo-400.png` (`400×400` PNG)

### Product Summary

```text
Daily Tithi is a fast, clutter-free Vedic Panchang and Hindu calendar web app built with Next.js 15 and Swiss Ephemeris astronomy. Because Vedic Tithis, Rahu Kaal, and Ekadashi Parana windows shift by 45+ minutes with local sunrise across longitudes, Daily Tithi calculates city-accurate timings for 64 cities (56 Indian + 8 global), with Dharma Shastra rules, Hindi/English support, and 6 AM daily alerts.
```

---

## 2. Product Milestone Update (Product Page → New Milestone / Update)

- **Milestone Title:** `Launched city-specific Vedic Panchang and Muhurat pages for 20+ Indian cities using Next.js 15`

### Milestone Body

```markdown
Just shipped city-specific Vedic Panchang and Muhurat pages on [Daily Tithi](https://dailytithi.com)—scaling from a single default view to **64 pre-configured cities (56 across India + 8 global hubs)** powered by Next.js 15!

### Why static Hindu calendars break
India runs on one timezone (IST), yet spans nearly 30 degrees of longitude. Sunrise can shift by 45+ minutes between eastern and western cities. In Vedic astronomy, the prevailing lunar day (*Udaya Tithi*), 1/8th daytime *Rahu Kaal*, *Abhijit Muhurat*, and *Choghadiya* slots are all anchored to **local sunrise and sunset**. A single static chart routinely shifts festival dates or fasting windows for millions of people.

### What we shipped
- **Next.js 15 `generateStaticParams` + Hourly ISR (`revalidate = 3600`):** Pre-renders fast, SEO-indexed city pages at build time and refreshes astronomical data every hour without spiking serverless compute—see our live [Varanasi Panchang page](https://dailytithi.com/panchang/varanasi).
- **Swiss Ephemeris + Dharma Shastra Rules:** Computes exact Tithi end-times, Nakshatra, Rahu Kaal, and scriptural rules like *Dashami Vedha* and *Parana* fast-breaking windows (live on our [Ekadashi Vrat schedule](https://dailytithi.com/vrat/ekadashi-vrat)).
- **Zero-Clutter Bilingual UX:** Instant English/Hindi switching, sticky-column mobile tables, and 1-tap 6:00 AM daily lock-screen alerts.

For fellow indie hackers building programmatic SEO apps: how do you balance hourly ISR freshness with crawl budget, and what makes dense mobile data tables feel effortless on 360px screens? Would love your feedback!
```

---

## 3. Main Community Feed Post (`indiehackers.com/new-post`)

- **Post Title:** `Show IH: I built a sunrise-adjusted Vedic Panchang & Muhurat engine for 20+ Indian cities with Next.js 15`

### Post Body

```markdown
Hey Indie Hackers! 👋 I'm Manish, solo founder building [Daily Tithi](https://dailytithi.com)—a fast, clutter-free Vedic Panchang and Muhurat web app.

Most online Hindu calendars suffer from two issues: heavy ad popups that wreck mobile usability, and static timings copied from a single reference city. Because India shares one civil timezone (IST) across ~30° of longitude, sunrise can differ by 45+ minutes between cities—shifting *Udaya Tithi*, *Rahu Kaal*, *Choghadiya*, and Ekadashi *Parana* (fast-breaking) windows completely.

Here's the technical + growth breakdown of how I built and launched it:

### Tech Stack
- **Next.js 15 (App Router + ISR):** Every city route uses `generateStaticParams` with hourly Incremental Static Regeneration (`revalidate = 3600`) and `dynamicParams = true`. We pre-render **64 cities (56 Indian + 8 global)** into fast static HTML with zero client loading spinners.
- **Pure-TypeScript Astronomy Engine:** Evaluates Swiss Ephemeris (`DE431`) / Lahiri Ayanamsa coordinates, local sunrise/sunset, dynamic 1/8th *Dina Mana* Rahu Kaal, Abhijit Muhurat, and Dharma Shastra rules (*Udaya Tithi*, *Dashami Vedha*).
- **Tailwind CSS Mobile-First Tables:** Over 80% of Panchang checks happen on phones in the morning. For dense monthly almanac and Muhurat tables, we engineered `overflow-x-auto` containers with a pinned `sticky left-0` date column and `tabular-nums` timestamps so 320px–390px viewports never break.
- **Supabase + Vercel Cron:** Stores Web Push subscriptions in Supabase and runs a scheduled Vercel Cron job (`30 0 * * *` UTC = 6:00 AM IST) to deliver 1-tap morning Tithi and Rahu Kaal lock-screen alerts.

### Programmatic SEO & Early Growth
Instead of chasing one hyper-competitive keyword, we structured programmatic hubs around real daily intent:
- **64 City Panchang pages** in both English and Hindi (`/panchang/[city]` and `/hi/panchang/[city]`) with dynamic `FAQPage` and `BreadcrumbList` JSON-LD schemas.
- **10 Vrat & Festival hubs** and **7 Life-Event Muhurat hubs** (Griha Pravesh, Vehicle Purchase, Vivah, etc.) that capture recurring calendar search demand year-round.
- **Built-in WhatsApp sharing** and developer/directory distribution (Dev.to technical deep-dives, AlternativeTo, and build-in-public launches) to earn clean early backlinks while pre-revenue.

I'd love honest founder feedback on https://dailytithi.com—especially around our mobile table UX, programmatic city SEO structure, and monetization ideas beyond lightweight ads (e.g., calendar sync or family Vrat reminders). Happy to answer any questions about Next.js 15 ISR or the astronomy math!
```
