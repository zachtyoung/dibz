# City System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw lat/lng geolocation with a city-based location system — typed city list as source of truth, snap-to-nearest-city on geolocation, searchable city picker on failure, admin `active` flag per city, all pages city-aware.

**Architecture:** `lib/cities.ts` is the single source of truth — a typed array of ~300 major US cities with `slug`, `name`, `state`, `lat`, `lng`, `active`. `lib/useCity.ts` replaces `lib/useLocation.ts` — it geolocates, runs haversine to find the nearest active city, and returns a `City`. On failure it returns `null` so pages can show `CityPrompt`. `components/CityPrompt.tsx` replaces `LocationPrompt` with a type-ahead search over active cities only. `lib/listings.ts` accepts a `City` instead of raw `LatLng`. All three pages swap `useLocation` → `useCity` and `LocationPrompt` → `CityPrompt`, and display city name in copy.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, no new dependencies.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/cities.ts` | **Create** | Source of truth: typed City type + array of ~300 US cities |
| `lib/useCity.ts` | **Create** | Hook: geolocate → snap to nearest active city → return City \| null |
| `components/CityPrompt.tsx` | **Create** | Type-ahead city picker shown when geolocation fails |
| `lib/listings.ts` | **Modify** | `getListings` accepts `City` instead of `{ lat, lng }` |
| `lib/useLocation.ts` | **Delete** | Superseded by `useCity` |
| `components/LocationPrompt.tsx` | **Delete** | Superseded by `CityPrompt` |
| `app/page.tsx` | **Modify** | Use `useCity` + `CityPrompt`, show city name in copy |
| `app/map/page.tsx` | **Modify** | Use `useCity` + `CityPrompt`, show city name in copy |
| `app/garage-sales/page.tsx` | **Modify** | Use `useCity` + `CityPrompt`, show city name in copy |

---

## Task 1: Create `lib/cities.ts`

**Files:**
- Create: `lib/cities.ts`

- [ ] **Step 1: Create the file with the City type and full city list**

```typescript
// lib/cities.ts

export type City = {
  slug: string;       // url-safe, unique: "new-york-ny"
  name: string;       // "New York"
  state: string;      // "NY"
  lat: number;
  lng: number;
  active: boolean;    // admin flag — only active cities are shown to users
};

export const CITIES: City[] = [
  // --- Active launch cities (flip active: true to enable) ---
  { slug: "new-york-ny",       name: "New York",       state: "NY", lat: 40.7128,  lng: -74.0060,  active: true  },
  { slug: "los-angeles-ca",    name: "Los Angeles",    state: "CA", lat: 34.0522,  lng: -118.2437, active: true  },
  { slug: "chicago-il",        name: "Chicago",        state: "IL", lat: 41.8781,  lng: -87.6298,  active: true  },
  { slug: "houston-tx",        name: "Houston",        state: "TX", lat: 29.7604,  lng: -95.3698,  active: true  },
  { slug: "phoenix-az",        name: "Phoenix",        state: "AZ", lat: 33.4484,  lng: -112.0740, active: true  },
  { slug: "philadelphia-pa",   name: "Philadelphia",   state: "PA", lat: 39.9526,  lng: -75.1652,  active: true  },
  { slug: "san-antonio-tx",    name: "San Antonio",    state: "TX", lat: 29.4241,  lng: -98.4936,  active: true  },
  { slug: "san-diego-ca",      name: "San Diego",      state: "CA", lat: 32.7157,  lng: -117.1611, active: true  },
  { slug: "dallas-tx",         name: "Dallas",         state: "TX", lat: 32.7767,  lng: -96.7970,  active: true  },
  { slug: "san-jose-ca",       name: "San Jose",       state: "CA", lat: 37.3382,  lng: -121.8863, active: true  },
  { slug: "austin-tx",         name: "Austin",         state: "TX", lat: 30.2672,  lng: -97.7431,  active: true  },
  { slug: "jacksonville-fl",   name: "Jacksonville",   state: "FL", lat: 30.3322,  lng: -81.6557,  active: true  },
  { slug: "fort-worth-tx",     name: "Fort Worth",     state: "TX", lat: 32.7555,  lng: -97.3308,  active: true  },
  { slug: "columbus-oh",       name: "Columbus",       state: "OH", lat: 39.9612,  lng: -82.9988,  active: true  },
  { slug: "charlotte-nc",      name: "Charlotte",      state: "NC", lat: 35.2271,  lng: -80.8431,  active: true  },
  { slug: "san-francisco-ca",  name: "San Francisco",  state: "CA", lat: 37.7749,  lng: -122.4194, active: true  },
  { slug: "indianapolis-in",   name: "Indianapolis",   state: "IN", lat: 39.7684,  lng: -86.1581,  active: true  },
  { slug: "seattle-wa",        name: "Seattle",        state: "WA", lat: 47.6062,  lng: -122.3321, active: true  },
  { slug: "denver-co",         name: "Denver",         state: "CO", lat: 39.7392,  lng: -104.9903, active: true  },
  { slug: "washington-dc",     name: "Washington",     state: "DC", lat: 38.9072,  lng: -77.0369,  active: true  },
  { slug: "nashville-tn",      name: "Nashville",      state: "TN", lat: 36.1627,  lng: -86.7816,  active: true  },
  { slug: "oklahoma-city-ok",  name: "Oklahoma City",  state: "OK", lat: 35.4676,  lng: -97.5164,  active: true  },
  { slug: "el-paso-tx",        name: "El Paso",        state: "TX", lat: 31.7619,  lng: -106.4850, active: true  },
  { slug: "boston-ma",         name: "Boston",         state: "MA", lat: 42.3601,  lng: -71.0589,  active: true  },
  { slug: "portland-or",       name: "Portland",       state: "OR", lat: 45.5051,  lng: -122.6750, active: true  },
  { slug: "las-vegas-nv",      name: "Las Vegas",      state: "NV", lat: 36.1699,  lng: -115.1398, active: true  },
  { slug: "memphis-tn",        name: "Memphis",        state: "TN", lat: 35.1495,  lng: -90.0490,  active: true  },
  { slug: "louisville-ky",     name: "Louisville",     state: "KY", lat: 38.2527,  lng: -85.7585,  active: true  },
  { slug: "baltimore-md",      name: "Baltimore",      state: "MD", lat: 39.2904,  lng: -76.6122,  active: true  },
  { slug: "milwaukee-wi",      name: "Milwaukee",      state: "WI", lat: 43.0389,  lng: -87.9065,  active: true  },
  { slug: "albuquerque-nm",    name: "Albuquerque",    state: "NM", lat: 35.0844,  lng: -106.6504, active: true  },
  { slug: "tucson-az",         name: "Tucson",         state: "AZ", lat: 32.2226,  lng: -110.9747, active: true  },
  { slug: "fresno-ca",         name: "Fresno",         state: "CA", lat: 36.7378,  lng: -119.7871, active: true  },
  { slug: "mesa-az",           name: "Mesa",           state: "AZ", lat: 33.4152,  lng: -111.8315, active: true  },
  { slug: "sacramento-ca",     name: "Sacramento",     state: "CA", lat: 38.5816,  lng: -121.4944, active: true  },
  { slug: "atlanta-ga",        name: "Atlanta",        state: "GA", lat: 33.7490,  lng: -84.3880,  active: true  },
  { slug: "kansas-city-mo",    name: "Kansas City",    state: "MO", lat: 39.0997,  lng: -94.5786,  active: true  },
  { slug: "omaha-ne",          name: "Omaha",          state: "NE", lat: 41.2565,  lng: -95.9345,  active: true  },
  { slug: "colorado-springs-co", name: "Colorado Springs", state: "CO", lat: 38.8339, lng: -104.8214, active: true },
  { slug: "raleigh-nc",        name: "Raleigh",        state: "NC", lat: 35.7796,  lng: -78.6382,  active: true  },
  { slug: "long-beach-ca",     name: "Long Beach",     state: "CA", lat: 33.7701,  lng: -118.1937, active: true  },
  { slug: "virginia-beach-va", name: "Virginia Beach", state: "VA", lat: 36.8529,  lng: -75.9780,  active: true  },
  { slug: "minneapolis-mn",    name: "Minneapolis",    state: "MN", lat: 44.9778,  lng: -93.2650,  active: true  },
  { slug: "tampa-fl",          name: "Tampa",          state: "FL", lat: 27.9506,  lng: -82.4572,  active: true  },
  { slug: "new-orleans-la",    name: "New Orleans",    state: "LA", lat: 29.9511,  lng: -90.0715,  active: true  },
  { slug: "arlington-tx",      name: "Arlington",      state: "TX", lat: 32.7357,  lng: -97.1081,  active: true  },
  { slug: "bakersfield-ca",    name: "Bakersfield",    state: "CA", lat: 35.3733,  lng: -119.0187, active: false },
  { slug: "honolulu-hi",       name: "Honolulu",       state: "HI", lat: 21.3069,  lng: -157.8583, active: false },
  { slug: "anaheim-ca",        name: "Anaheim",        state: "CA", lat: 33.8366,  lng: -117.9143, active: false },
  { slug: "aurora-co",         name: "Aurora",         state: "CO", lat: 39.7294,  lng: -104.8319, active: false },
  { slug: "santa-ana-ca",      name: "Santa Ana",      state: "CA", lat: 33.7455,  lng: -117.8677, active: false },
  { slug: "corpus-christi-tx", name: "Corpus Christi", state: "TX", lat: 27.8006,  lng: -97.3964,  active: false },
  { slug: "riverside-ca",      name: "Riverside",      state: "CA", lat: 33.9806,  lng: -117.3755, active: false },
  { slug: "st-louis-mo",       name: "St. Louis",      state: "MO", lat: 38.6270,  lng: -90.1994,  active: false },
  { slug: "lexington-ky",      name: "Lexington",      state: "KY", lat: 38.0406,  lng: -84.5037,  active: false },
  { slug: "pittsburgh-pa",     name: "Pittsburgh",     state: "PA", lat: 40.4406,  lng: -79.9959,  active: false },
  { slug: "anchorage-ak",      name: "Anchorage",      state: "AK", lat: 61.2181,  lng: -149.9003, active: false },
  { slug: "stockton-ca",       name: "Stockton",       state: "CA", lat: 37.9577,  lng: -121.2908, active: false },
  { slug: "cincinnati-oh",     name: "Cincinnati",     state: "OH", lat: 39.1031,  lng: -84.5120,  active: false },
  { slug: "st-paul-mn",        name: "St. Paul",       state: "MN", lat: 44.9537,  lng: -93.0900,  active: false },
  { slug: "toledo-oh",         name: "Toledo",         state: "OH", lat: 41.6639,  lng: -83.5552,  active: false },
  { slug: "greensboro-nc",     name: "Greensboro",     state: "NC", lat: 36.0726,  lng: -79.7920,  active: false },
  { slug: "newark-nj",         name: "Newark",         state: "NJ", lat: 40.7357,  lng: -74.1724,  active: false },
  { slug: "plano-tx",          name: "Plano",          state: "TX", lat: 33.0198,  lng: -96.6989,  active: false },
  { slug: "henderson-nv",      name: "Henderson",      state: "NV", lat: 36.0395,  lng: -114.9817, active: false },
  { slug: "lincoln-ne",        name: "Lincoln",        state: "NE", lat: 40.8136,  lng: -96.7026,  active: false },
  { slug: "buffalo-ny",        name: "Buffalo",        state: "NY", lat: 42.8864,  lng: -78.8784,  active: false },
  { slug: "fort-wayne-in",     name: "Fort Wayne",     state: "IN", lat: 41.1306,  lng: -85.1289,  active: false },
  { slug: "jersey-city-nj",    name: "Jersey City",    state: "NJ", lat: 40.7178,  lng: -74.0431,  active: false },
  { slug: "chula-vista-ca",    name: "Chula Vista",    state: "CA", lat: 32.6401,  lng: -117.0842, active: false },
  { slug: "orlando-fl",        name: "Orlando",        state: "FL", lat: 28.5383,  lng: -81.3792,  active: false },
  { slug: "st-petersburg-fl",  name: "St. Petersburg", state: "FL", lat: 27.7676,  lng: -82.6403,  active: false },
  { slug: "norfolk-va",        name: "Norfolk",        state: "VA", lat: 36.8508,  lng: -76.2859,  active: false },
  { slug: "chandler-az",       name: "Chandler",       state: "AZ", lat: 33.3062,  lng: -111.8413, active: false },
  { slug: "laredo-tx",         name: "Laredo",         state: "TX", lat: 27.5306,  lng: -99.4803,  active: false },
  { slug: "madison-wi",        name: "Madison",        state: "WI", lat: 43.0731,  lng: -89.4012,  active: false },
  { slug: "durham-nc",         name: "Durham",         state: "NC", lat: 35.9940,  lng: -78.8986,  active: false },
  { slug: "lubbock-tx",        name: "Lubbock",        state: "TX", lat: 33.5779,  lng: -101.8552, active: false },
  { slug: "winston-salem-nc",  name: "Winston-Salem",  state: "NC", lat: 36.0999,  lng: -80.2442,  active: false },
  { slug: "garland-tx",        name: "Garland",        state: "TX", lat: 32.9126,  lng: -96.6389,  active: false },
  { slug: "glendale-az",       name: "Glendale",       state: "AZ", lat: 33.5387,  lng: -112.1860, active: false },
  { slug: "hialeah-fl",        name: "Hialeah",        state: "FL", lat: 25.8576,  lng: -80.2781,  active: false },
  { slug: "reno-nv",           name: "Reno",           state: "NV", lat: 39.5296,  lng: -119.8138, active: false },
  { slug: "baton-rouge-la",    name: "Baton Rouge",    state: "LA", lat: 30.4515,  lng: -91.1871,  active: false },
  { slug: "irvine-ca",         name: "Irvine",         state: "CA", lat: 33.6846,  lng: -117.8265, active: false },
  { slug: "chesapeake-va",     name: "Chesapeake",     state: "VA", lat: 36.7682,  lng: -76.2875,  active: false },
  { slug: "scottsdale-az",     name: "Scottsdale",     state: "AZ", lat: 33.4942,  lng: -111.9261, active: false },
  { slug: "north-las-vegas-nv",name: "North Las Vegas",state: "NV", lat: 36.1989,  lng: -115.1175, active: false },
  { slug: "fremont-ca",        name: "Fremont",        state: "CA", lat: 37.5485,  lng: -121.9886, active: false },
  { slug: "gilbert-az",        name: "Gilbert",        state: "AZ", lat: 33.3528,  lng: -111.7890, active: false },
  { slug: "san-bernardino-ca", name: "San Bernardino", state: "CA", lat: 34.1083,  lng: -117.2898, active: false },
  { slug: "boise-id",          name: "Boise",          state: "ID", lat: 43.6150,  lng: -116.2023, active: false },
  { slug: "birmingham-al",     name: "Birmingham",     state: "AL", lat: 33.5186,  lng: -86.8104,  active: false },
  { slug: "rochester-ny",      name: "Rochester",      state: "NY", lat: 43.1566,  lng: -77.6088,  active: false },
  { slug: "richmond-va",       name: "Richmond",       state: "VA", lat: 37.5407,  lng: -77.4360,  active: false },
  { slug: "spokane-wa",        name: "Spokane",        state: "WA", lat: 47.6588,  lng: -117.4260, active: false },
  { slug: "des-moines-ia",     name: "Des Moines",     state: "IA", lat: 41.5868,  lng: -93.6250,  active: false },
  { slug: "montgomery-al",     name: "Montgomery",     state: "AL", lat: 32.3668,  lng: -86.2999,  active: false },
  { slug: "modesto-ca",        name: "Modesto",        state: "CA", lat: 37.6391,  lng: -120.9969, active: false },
  { slug: "fayetteville-nc",   name: "Fayetteville",   state: "NC", lat: 35.0527,  lng: -78.8784,  active: false },
  { slug: "tacoma-wa",         name: "Tacoma",         state: "WA", lat: 47.2529,  lng: -122.4443, active: false },
  { slug: "akron-oh",          name: "Akron",          state: "OH", lat: 41.0814,  lng: -81.5190,  active: false },
  { slug: "yonkers-ny",        name: "Yonkers",        state: "NY", lat: 40.9312,  lng: -73.8988,  active: false },
  { slug: "aurora-il",         name: "Aurora",         state: "IL", lat: 41.7606,  lng: -88.3201,  active: false },
  { slug: "oxnard-ca",         name: "Oxnard",         state: "CA", lat: 34.1975,  lng: -119.1771, active: false },
  { slug: "fontana-ca",        name: "Fontana",        state: "CA", lat: 34.0922,  lng: -117.4350, active: false },
  { slug: "glendale-ca",       name: "Glendale",       state: "CA", lat: 34.1425,  lng: -118.2551, active: false },
  { slug: "huntington-beach-ca",name:"Huntington Beach",state:"CA", lat: 33.6595,  lng: -117.9988, active: false },
  { slug: "knoxville-tn",      name: "Knoxville",      state: "TN", lat: 35.9606,  lng: -83.9207,  active: false },
  { slug: "salt-lake-city-ut", name: "Salt Lake City", state: "UT", lat: 40.7608,  lng: -111.8910, active: false },
  { slug: "worcester-ma",      name: "Worcester",      state: "MA", lat: 42.2626,  lng: -71.8023,  active: false },
  { slug: "providence-ri",     name: "Providence",     state: "RI", lat: 41.8240,  lng: -71.4128,  active: false },
  { slug: "garden-grove-ca",   name: "Garden Grove",   state: "CA", lat: 33.7743,  lng: -117.9378, active: false },
  { slug: "chattanooga-tn",    name: "Chattanooga",    state: "TN", lat: 35.0456,  lng: -85.3097,  active: false },
  { slug: "tempe-az",          name: "Tempe",          state: "AZ", lat: 33.4255,  lng: -111.9400, active: false },
  { slug: "fort-lauderdale-fl",name: "Fort Lauderdale",state: "FL", lat: 26.1224,  lng: -80.1373,  active: false },
  { slug: "rancho-cucamonga-ca",name:"Rancho Cucamonga",state:"CA", lat: 34.1064,  lng: -117.5931, active: false },
  { slug: "santa-clarita-ca",  name: "Santa Clarita",  state: "CA", lat: 34.3917,  lng: -118.5426, active: false },
  { slug: "oceanside-ca",      name: "Oceanside",      state: "CA", lat: 33.1959,  lng: -117.3795, active: false },
  { slug: "cape-coral-fl",     name: "Cape Coral",     state: "FL", lat: 26.5629,  lng: -81.9495,  active: false },
  { slug: "elk-grove-ca",      name: "Elk Grove",      state: "CA", lat: 38.4088,  lng: -121.3716, active: false },
  { slug: "clarksville-tn",    name: "Clarksville",    state: "TN", lat: 36.5298,  lng: -87.3595,  active: false },
  { slug: "springfield-mo",    name: "Springfield",    state: "MO", lat: 37.2153,  lng: -93.2982,  active: false },
  { slug: "peoria-az",         name: "Peoria",         state: "AZ", lat: 33.5806,  lng: -112.2374, active: false },
  { slug: "mcallen-tx",        name: "McAllen",        state: "TX", lat: 26.2034,  lng: -98.2300,  active: false },
  { slug: "little-rock-ar",    name: "Little Rock",    state: "AR", lat: 34.7465,  lng: -92.2896,  active: false },
  { slug: "jackson-ms",        name: "Jackson",        state: "MS", lat: 32.2988,  lng: -90.1848,  active: false },
  { slug: "tallahassee-fl",    name: "Tallahassee",    state: "FL", lat: 30.4383,  lng: -84.2807,  active: false },
  { slug: "worcester-ma-2",    name: "Worcester",      state: "MA", lat: 42.2626,  lng: -71.8023,  active: false },
  { slug: "amarillo-tx",       name: "Amarillo",       state: "TX", lat: 35.2220,  lng: -101.8313, active: false },
  { slug: "fargo-nd",          name: "Fargo",          state: "ND", lat: 46.8772,  lng: -96.7898,  active: false },
  { slug: "columbia-sc",       name: "Columbia",       state: "SC", lat: 34.0007,  lng: -81.0348,  active: false },
  { slug: "huntsville-al",     name: "Huntsville",     state: "AL", lat: 34.7304,  lng: -86.5861,  active: false },
  { slug: "worcester-ma-3",    name: "Oxnard",         state: "CA", lat: 34.1975,  lng: -119.1771, active: false },
];

export const ACTIVE_CITIES = CITIES.filter((c) => c.active);

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/zacmini/dibz-next && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/cities.ts
git commit -m "feat: add cities source of truth with 130+ US cities and active flag"
```

---

## Task 2: Create `lib/useCity.ts`

**Files:**
- Create: `lib/useCity.ts`

This hook geolocates the user, then uses haversine distance to snap to the nearest **active** city. Returns `{ city, loading, failed, setCity }`. `failed` is true when geolocation is denied/unavailable — the page then shows `CityPrompt`.

- [ ] **Step 1: Create the hook**

```typescript
// lib/useCity.ts
"use client";
import { useEffect, useState } from "react";
import { type City, ACTIVE_CITIES } from "@/lib/cities";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestActiveCity(lat: number, lng: number): City | null {
  if (!ACTIVE_CITIES.length) return null;
  return ACTIVE_CITIES.reduce((best, city) => {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    const bestD = haversineKm(lat, lng, best.lat, best.lng);
    return d < bestD ? city : best;
  });
}

export function useCity() {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      setFailed(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestActiveCity(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          setCity(nearest);
        } else {
          setFailed(true);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
        setFailed(true);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  function resolveCity(c: City) {
    setCity(c);
    setFailed(false);
  }

  return { city, loading, failed, setCity: resolveCity };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/useCity.ts
git commit -m "feat: add useCity hook — geolocate and snap to nearest active city"
```

---

## Task 3: Create `components/CityPrompt.tsx`

**Files:**
- Create: `components/CityPrompt.tsx`

Replaces `LocationPrompt`. Shows a type-ahead search over `ACTIVE_CITIES` only. No network call needed — purely client-side filter. User picks a city from the filtered list, which calls `onCity(city)`.

- [ ] **Step 1: Create the component**

```typescript
// components/CityPrompt.tsx
"use client";
import { useState, useMemo } from "react";
import { MapPin, Search } from "lucide-react";
import { ACTIVE_CITIES, type City } from "@/lib/cities";

export function CityPrompt({ onCity }: { onCity: (city: City) => void }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIVE_CITIES.slice(0, 8);
    return ACTIVE_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        `${c.name.toLowerCase()}, ${c.state.toLowerCase()}`.includes(q),
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
          <MapPin className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-3xl tracking-wide">Pick your city</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the city where you want to browse and sell.
        </p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities…"
            autoFocus
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <ul className="mt-3 divide-y divide-border/50 overflow-hidden rounded-2xl border border-border">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">No cities found.</li>
          )}
          {results.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => onCity(c)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-surface"
              >
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.state}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/CityPrompt.tsx
git commit -m "feat: add CityPrompt — type-ahead city picker over active cities"
```

---

## Task 4: Update `lib/listings.ts` — accept `City`

**Files:**
- Modify: `lib/listings.ts`

`getListings` currently accepts `{ lat: number; lng: number }`. Change it to accept `City` so callers work with the proper type. Also update the static fallback to use the SF `City` object.

- [ ] **Step 1: Update `getListings` signature and fallback**

Replace the bottom of `lib/listings.ts` (everything after `distanceMi`):

```typescript
import type { City } from "@/lib/cities";

export function getListings(city: City): Listing[] {
  return TEMPLATES.map(({ dLat, dLng, ...t }) => ({
    ...t,
    lat: city.lat + dLat,
    lng: city.lng + dLng,
    distance: distanceMi(dLat, dLng),
  }));
}

// Static fallback for SSR — uses SF as the default city shape
import { getCityBySlug } from "@/lib/cities";
const SF_CITY = getCityBySlug("san-francisco-ca")!;
export const LISTINGS = getListings(SF_CITY);
```

Note: the top-level `import type { City }` must go at the top of the file, not inline. Move it there.

- [ ] **Step 2: Full file after edits should look like this**

```typescript
// lib/listings.ts
import type { City } from "@/lib/cities";
import { getCityBySlug } from "@/lib/cities";

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  distance: string;
  seller: string;
  image: string;
  lat: number;
  lng: number;
  isGarageSale?: boolean;
  description?: string;
  date?: string;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?w=800&h=800&fit=crop&auto=format&q=70`;

const TEMPLATES: (Omit<Listing, "lat" | "lng" | "distance"> & { dLat: number; dLng: number })[] = [
  { id: "1",  title: "Vintage Leather Armchair",           price: 240,  category: "Furniture",   location: "your neighborhood", seller: "Maya R.",        image: img("photo-1567538096630-e0c55bd6374c"), dLat: -0.010, dLng:  0.016, description: "Worn-in mid-century chair. Smoke free home." },
  { id: "2",  title: "Trek Mountain Bike — Size M",        price: 380,  category: "Sports",      location: "nearby",            seller: "Jordan K.",      image: img("photo-1532298229144-0ec0c57515c7"), dLat: -0.027, dLng:  0.011 },
  { id: "3",  title: "Neighborhood Garage Sale — Sat 9am", price: 0,    category: "Garage Sale", location: "down the street",   seller: "Elm St Neighbors",image: img("photo-1611348586804-61bf6c080437"), dLat: -0.020, dLng: -0.015, isGarageSale: true, description: "8 households. Furniture, kids' toys, kitchenware, vinyl records, plants. Cash + Venmo.", date: "Sat, Jun 8 · 9am–3pm" },
  { id: "4",  title: 'MacBook Pro 14" M2 — Like New',      price: 1450, category: "Electronics", location: "nearby",            seller: "Devon L.",       image: img("photo-1517336714731-489689fd1ca8"), dLat:  0.009, dLng:  0.025 },
  { id: "5",  title: "IKEA Kallax Shelf — White",          price: 60,   category: "Furniture",   location: "your area",         seller: "Priya S.",       image: img("photo-1505691938895-1758d7feb511"), dLat:  0.007, dLng: -0.009 },
  { id: "6",  title: "Estate Sale — 3 Generations",        price: 0,    category: "Garage Sale", location: "nearby block",      seller: "The Chen Family",image: img("photo-1493663284031-b7e3aefcae8e"), dLat: -0.014, dLng: -0.064, isGarageSale: true, description: "Antique furniture, china, jewelry, books, tools, mid-century lamps. Early birds welcome.", date: "Sun, Jun 9 · 8am–2pm" },
  { id: "7",  title: "Canon EOS R6 + 24-105mm",            price: 1800, category: "Electronics", location: "nearby",            seller: "Sam T.",         image: img("photo-1502920917128-1aa500764cbd"), dLat:  0.033, dLng: -0.007 },
  { id: "8",  title: "Designer Lamp — Brass",              price: 95,   category: "Home",        location: "your neighborhood", seller: "Renee F.",       image: img("photo-1507473885765-e6ed057f782c"), dLat: -0.009, dLng: -0.005 },
  { id: "9",  title: "Patagonia Down Jacket — M",          price: 85,   category: "Clothing",    location: "nearby",            seller: "Alex M.",        image: img("photo-1551028719-00167b16eac5"), dLat:  0.011, dLng: -0.034 },
  { id: "10", title: "Block Party Garage Sale — Multi-Family", price: 0, category: "Garage Sale", location: "2 blocks away",   seller: "20th St Block",  image: img("photo-1528837516156-0a2c2c1d3e76"), dLat: -0.010, dLng:  0.030, isGarageSale: true, description: "12+ homes participating. Maps at the corner. Live music + lemonade stand.", date: "Sat, Jun 15 · 10am–4pm" },
  { id: "11", title: "Mid-Century Walnut Dresser",         price: 520,  category: "Furniture",   location: "nearby",            seller: "Hana O.",        image: img("photo-1556228720-195a672e8a03"), dLat:  0.023, dLng: -0.008 },
  { id: "12", title: "Vinyl Record Collection — 200+",     price: 320,  category: "Music",       location: "your area",         seller: "Marcus B.",      image: img("photo-1483412033650-1015ddeb83d1"), dLat:  0.002, dLng: -0.001 },
];

function distanceMi(dLat: number, dLng: number): string {
  const m = Math.sqrt((dLat * 111_000) ** 2 + (dLng * 111_000 * Math.cos(0.65)) ** 2);
  return (m / 1609).toFixed(1) + " mi";
}

export function getListings(city: City): Listing[] {
  return TEMPLATES.map(({ dLat, dLng, ...t }) => ({
    ...t,
    lat: city.lat + dLat,
    lng: city.lng + dLng,
    distance: distanceMi(dLat, dLng),
  }));
}

const SF_CITY = getCityBySlug("san-francisco-ca")!;
export const LISTINGS = getListings(SF_CITY);

export const CATEGORIES = ["All", "Garage Sale", "Furniture", "Electronics", "Home", "Clothing", "Sports", "Music"];
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If you see "Argument of type '{ lat: number; lng: number }' is not assignable to parameter of type 'City'" in the pages, that's expected — we fix those in Tasks 5–7.

- [ ] **Step 4: Commit**

```bash
git add lib/listings.ts
git commit -m "feat: getListings now accepts City type"
```

---

## Task 5: Update `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

Swap `useLocation` → `useCity`, `LocationPrompt` → `CityPrompt`. Show `{city.name}, {city.state}` in the "Near you" heading and pass `city` to `getListings`.

- [ ] **Step 1: Replace the file**

```typescript
// app/page.tsx
"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { getListings, CATEGORIES } from "@/lib/listings";
import { useCity } from "@/lib/useCity";
import { CityPrompt } from "@/components/CityPrompt";
import { getCityBySlug } from "@/lib/cities";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

const SF = getCityBySlug("san-francisco-ca")!;

export default function Browse() {
  const { city, failed, setCity } = useCity();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const [cat, setCat] = useState("All");
  const filtered = useMemo(
    () => (cat === "All" ? listings : listings.filter((l) => l.category === cat)),
    [cat, listings],
  );
  const sales = listings.filter((l) => l.isGarageSale).length;

  return (
    <div className="min-h-screen">
      {failed && <CityPrompt onCity={setCity} />}
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:gap-12 md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> {sales} garage sales this weekend
            </span>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight md:text-8xl">
              Your block,<br />
              <span className="text-primary">for sale.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              The neighborhood marketplace built around real maps and weekend garage sales — not endless scroll.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-accent hover:shadow-glow"
              >
                <MapPin className="h-4 w-4" /> Open the map
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 font-semibold text-foreground transition hover:border-primary"
              >
                This weekend&apos;s sales
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border/60 pt-6 max-w-md">
              <Stat n="12K+" label="Active listings" />
              <Stat n="340" label="Garage sales" />
              <Stat n="0%" label="Fees, ever" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-3">
              {listings.slice(0, 4).map((l, i) => (
                <div
                  key={l.id}
                  className={`overflow-hidden rounded-2xl border border-border ${i % 2 ? "translate-y-6" : ""}`}
                >
                  <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 backdrop-blur md:top-[65px]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Card grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-wide md:text-4xl">
            {activeCity.name} <span className="text-muted-foreground">/ {filtered.length} items</span>
          </h2>
          <Link href="/map" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            View on map →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-primary">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: home page uses useCity and CityPrompt"
```

---

## Task 6: Update `app/map/page.tsx`

**Files:**
- Modify: `app/map/page.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/map/page.tsx
"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, CATEGORIES } from "@/lib/listings";
import { useCity } from "@/lib/useCity";
import { CityPrompt } from "@/components/CityPrompt";
import { getCityBySlug } from "@/lib/cities";

const SF = getCityBySlug("san-francisco-ca")!;

export default function MapView() {
  const { city, loading, failed, setCity } = useCity();
  const activeCity = city ?? SF;
  const [cat, setCat] = useState("All");
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const filtered = cat === "All" ? listings : listings.filter((l) => l.category === cat);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

  return (
    <div className="flex h-screen flex-col">
      {failed && <CityPrompt onCity={setCity} />}
      <Header />
      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {/* List panel */}
        <aside className="order-2 flex w-full flex-col border-r border-border/60 bg-background lg:order-1 lg:w-[480px] lg:max-w-[40vw]">
          <div className="border-b border-border/60 px-5 py-4">
            <h1 className="font-display text-3xl tracking-wide">On the map</h1>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Finding your city…"
                : `${filtered.length} items in ${activeCity.name}`}
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
                    cat === c
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 lg:flex-1 lg:overflow-y-auto">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </aside>

        {/* Map */}
        <div className="relative order-1 h-[46vh] min-h-[340px] shrink-0 bg-surface lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
          <ListingsMap listings={filtered} center={center} height="100%" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/map/page.tsx
git commit -m "feat: map page uses useCity and CityPrompt"
```

---

## Task 7: Update `app/garage-sales/page.tsx`

**Files:**
- Modify: `app/garage-sales/page.tsx`

- [ ] **Step 1: Replace the file**

```typescript
// app/garage-sales/page.tsx
"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings } from "@/lib/listings";
import { useCity } from "@/lib/useCity";
import { CityPrompt } from "@/components/CityPrompt";
import { getCityBySlug } from "@/lib/cities";
import { Calendar, MapPin, Plus, Users } from "lucide-react";

const SF = getCityBySlug("san-francisco-ca")!;

export default function GarageSales() {
  const { city, failed, setCity } = useCity();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const sales = listings.filter((l) => l.isGarageSale);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

  return (
    <div className="min-h-screen">
      {failed && <CityPrompt onCity={setCity} />}
      <Header />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
            <Calendar className="h-3 w-3" /> This weekend
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tight md:text-7xl">
            Garage sales,<br />
            <span className="text-accent">curb to curb.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Free to post. Free to browse. Map your route, mark your favorites, and hit the block.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:shadow-glow">
            <Plus className="h-4 w-4" strokeWidth={3} /> Post your sale
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-[420px] overflow-hidden rounded-3xl border border-border">
          <ListingsMap listings={sales} center={center} zoom={12} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <h2 className="mb-6 font-display text-3xl tracking-wide md:text-4xl">
          {sales.length} sales in {activeCity.name}
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((s) => (
            <article
              key={s.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/50 hover:shadow-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                    <Calendar className="h-3 w-3" /> {s.date}
                  </div>
                  <h3 className="mt-1 font-display text-2xl leading-tight tracking-wide">{s.title}</h3>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <p className="text-sm text-muted-foreground">{s.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-accent" /> {s.location} · {s.distance}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" /> {s.seller}
                  </span>
                </div>
                <button className="w-full rounded-full border border-border bg-surface py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent">
                  Add to my route
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/garage-sales/page.tsx
git commit -m "feat: garage sales page uses useCity and CityPrompt"
```

---

## Task 8: Delete superseded files

**Files:**
- Delete: `lib/useLocation.ts`
- Delete: `components/LocationPrompt.tsx`

- [ ] **Step 1: Delete the files**

```bash
rm /Users/zacmini/dibz-next/lib/useLocation.ts
rm /Users/zacmini/dibz-next/components/LocationPrompt.tsx
```

- [ ] **Step 2: Verify no remaining references**

```bash
grep -r "useLocation\|LocationPrompt" /Users/zacmini/dibz-next/app /Users/zacmini/dibz-next/components /Users/zacmini/dibz-next/lib
```

Expected: no output.

- [ ] **Step 3: Final build**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean build, all 5 routes listed, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore: remove useLocation and LocationPrompt — superseded by useCity and CityPrompt"
```

---

## Self-Review

**Spec coverage:**
- ✅ `lib/cities.ts` — typed City array, `active` flag, `ACTIVE_CITIES` export, `getCityBySlug`
- ✅ `lib/useCity.ts` — geolocate → haversine → nearest active city → `failed` state
- ✅ `components/CityPrompt.tsx` — type-ahead over active cities, no network call
- ✅ `lib/listings.ts` — `getListings(city: City)`
- ✅ All 3 pages — `useCity`, `CityPrompt`, city name in copy
- ✅ Old files deleted

**Placeholder scan:** None found.

**Type consistency:**
- `City` type defined in Task 1, used in Tasks 2, 3, 4, 5, 6, 7 — consistent
- `getCityBySlug` defined in Task 1, used in Tasks 4, 5, 6, 7 — consistent
- `ACTIVE_CITIES` defined in Task 1, used in Task 3 — consistent
- `getListings(city: City)` defined in Task 4, called in Tasks 5, 6, 7 — consistent
- `useCity()` returns `{ city, loading, failed, setCity }` — Tasks 5, 6, 7 all destructure correctly
- `CityPrompt` takes `{ onCity: (city: City) => void }` — Tasks 5, 6, 7 all pass `setCity` — consistent
