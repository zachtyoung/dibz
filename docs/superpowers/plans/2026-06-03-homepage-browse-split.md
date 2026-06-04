# Homepage / Browse Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current combined homepage into a pure marketing landing page (`/`) and a full-featured power-user browse page (`/browse`), then update nav to point to `/browse`.

**Architecture:** The current `app/page.tsx` becomes the landing page — hero only, no listings grid. A new `app/browse/page.tsx` gets the full browse experience: search, sort, radius filter, map/list toggle, and dense listing grid. Header nav "Browse" link updates from `/` to `/browse`.

**Tech Stack:** Next.js App Router, React, Tailwind, Lucide icons, existing `getListings` / `useCityContext` / `ListingCard` / `ListingsMap`.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `app/page.tsx` | Modify | Strip to pure landing page — hero, stats, two CTAs only |
| `app/browse/page.tsx` | Create | Full power-user browse: search, sort, radius, map toggle |
| `components/Header.tsx` | Modify | Update "Browse" nav link from `/` to `/browse` |

---

### Task 1: Strip homepage to pure landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with landing-only content**

Remove all browse state (`cat`, `cond`, `filtered`), the category pills section, the condition filter section, and the listings grid section. Keep the hero, the stats strip, and the two CTAs. Keep the `"use client"` directive and `useCityContext` (needed for the "sales near you" badge count).

Replace the entire file with:

```tsx
"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { ArrowRight, MapPin, Tag, Map } from "lucide-react";
import Link from "next/link";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale).length;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-8 md:py-28">
          <div className="flex flex-col justify-center">
            {sales > 0 && (
              <Link
                href="/garage-sales"
                className="inline-flex w-fit items-center gap-1.5 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-teal-600 cursor-pointer"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "2px 2px 0 oklch(0.14 0.02 240)" }}
              >
                <MapPin className="h-3 w-3" /> {sales} sales near you this weekend
              </Link>
            )}
            <h1 className="mt-5 font-display text-6xl leading-[0.88] tracking-tight md:text-8xl">
              Dibz it<br />
              <span className="text-primary">before they do.</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-semibold text-muted-foreground">
              The neighborhood marketplace built around real maps and weekend sales — garage, estate, and everything in between.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-teal-600"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <Tag className="h-4 w-4" /> Browse listings
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <MapPin className="h-4 w-4" /> Garage sales
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <Map className="h-4 w-4" /> Open map
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-0 max-w-sm" style={{ border: "2px solid oklch(0.14 0.02 240)" }}>
              <Stat n="12K+" label="Listings" />
              <Stat n="340" label="Sales" />
              <Stat n="0%" label="Fees" />
            </div>
          </div>

          {/* Right side: map visual placeholder / hero image grid */}
          <div className="relative hidden grid-cols-2 gap-3 pb-8 md:grid">
            {listings.slice(0, 4).map((l, i) => (
              <div
                key={l.id}
                className={`overflow-hidden ${i % 2 ? "translate-y-8" : ""}`}
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "4px 4px 0 oklch(0.14 0.02 240)" }}
              >
                <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-0 md:grid-cols-3" style={{ border: "2px solid oklch(0.14 0.02 240)" }}>
          <ValueProp
            title="Real maps"
            body="Every listing pinned. See what's near you before you go."
          />
          <ValueProp
            title="Weekend sales"
            body="Garage and estate sales with route planning built in."
            bordered
          />
          <ValueProp
            title="Zero fees"
            body="Free to list. Free to browse. No middlemen."
          />
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="px-4 py-3" style={{ borderRight: "2px solid oklch(0.14 0.02 240)" }}>
      <div className="font-display text-3xl text-primary">{n}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ValueProp({ title, body, bordered }: { title: string; body: string; bordered?: boolean }) {
  return (
    <div
      className="px-8 py-10"
      style={bordered ? { borderLeft: "2px solid oklch(0.14 0.02 240)", borderRight: "2px solid oklch(0.14 0.02 240)" } : {}}
    >
      <h3 className="font-display text-2xl tracking-wide text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: strip homepage to pure landing page"
```

---

### Task 2: Create full-featured browse page at `/browse`

**Files:**
- Create: `app/browse/page.tsx`

This page is the power-user marketplace. Features:
- Search bar (filters listings client-side by title/description/category/seller)
- Sort: Distance, Price low→high, Price high→low, Newest
- Radius filter: Any / 5 / 10 / 25 / 50 mi (from user GPS or city center)
- Category pills
- Condition filter
- Map/List toggle (list default; map shows `ListingsMap` full-width above grid)
- Dense 2→3→4 col grid of `ListingCard`
- Empty state when no results

- [ ] **Step 1: Create `app/browse/page.tsx`**

```tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, CATEGORIES, CONDITIONS, type Condition } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { LayoutGrid, Map, Search, SlidersHorizontal, X } from "lucide-react";

const RADII = [5, 10, 25, 50] as const;
type Radius = typeof RADII[number] | "All";
type SortKey = "distance" | "price-asc" | "price-desc" | "newest";

const INK = "oklch(0.14 0.02 240)";

function distanceMiNum(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const m = Math.sqrt(
    (dLat * 111_000) ** 2 + (dLng * 111_000 * Math.cos((lat1 * Math.PI) / 180)) ** 2
  );
  return m / 1609;
}

export default function Browse() {
  const { city, loading } = useCityContext();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [cond, setCond] = useState<Condition | "All">("All");
  const [radius, setRadius] = useState<Radius>("All");
  const [sort, setSort] = useState<SortKey>("distance");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const listings = useMemo(() => (city ? getListings(city) : []), [city]);
  const origin = userLocation ?? (city ? [city.lat, city.lng] as [number, number] : null);

  const filtered = useMemo(() => {
    let r = cat === "All" ? listings : listings.filter((l) => l.category === cat);
    if (cond !== "All") r = r.filter((l) => l.condition === cond);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.seller.toLowerCase().includes(q)
      );
    }
    if (radius !== "All" && origin) {
      r = r.filter((l) => distanceMiNum(origin[0], origin[1], l.lat, l.lng) <= radius);
    }
    r = [...r].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return (a.postedHoursAgo ?? 999) - (b.postedHoursAgo ?? 999);
      // distance
      if (!origin) return 0;
      return (
        distanceMiNum(origin[0], origin[1], a.lat, a.lng) -
        distanceMiNum(origin[0], origin[1], b.lat, b.lng)
      );
    });
    return r;
  }, [listings, cat, cond, query, radius, sort, origin]);

  const center = userLocation ?? (city ? ([city.lat, city.lng] as [number, number]) : undefined);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Toolbar */}
      <div
        className="sticky top-[48px] z-30 bg-surface md:top-[52px]"
        style={{ borderBottom: `2px solid ${INK}` }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 md:px-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings…"
              className="w-full bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none"
              style={{ border: `2px solid ${INK}` }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="hidden bg-background px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground focus:outline-none md:block"
            style={{ border: `2px solid ${INK}` }}
          >
            <option value="distance">Nearest</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="newest">Newest</option>
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-widest transition md:hidden ${
              showFilters ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
            }`}
            style={{ border: `2px solid ${INK}` }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>

          {/* Map/Grid toggle */}
          <button
            onClick={() => setView(view === "grid" ? "map" : "grid")}
            className="flex items-center gap-1.5 bg-background px-3 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition hover:bg-muted"
            style={{ border: `2px solid ${INK}` }}
          >
            {view === "grid" ? <Map className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{view === "grid" ? "Map" : "Grid"}</span>
          </button>
        </div>

        {/* Filter row — always visible on desktop, toggled on mobile */}
        <div
          className={`mx-auto max-w-7xl px-4 pb-2 md:px-8 ${
            showFilters ? "flex flex-col gap-2" : "hidden md:flex md:flex-col md:gap-2"
          }`}
        >
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-bold uppercase tracking-widest transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
                style={{ border: `2px solid ${INK}` }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Condition + Radius + Sort (mobile) row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cond:
            </span>
            {(["All", ...CONDITIONS] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCond(c)}
                className={`whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  cond === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
                style={{ border: `2px solid ${INK}` }}
              >
                {c}
              </button>
            ))}

            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Radius:
            </span>
            {(["All", ...RADII] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  radius === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
                style={{ border: `2px solid ${INK}` }}
              >
                {r === "All" ? "Any" : `${r} mi`}
              </button>
            ))}

            {/* Sort — mobile only */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="ml-auto bg-background px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none md:hidden"
              style={{ border: `2px solid ${INK}` }}
            >
              <option value="distance">Nearest</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map view */}
      {view === "map" && (
        <div className="h-[55vh] min-h-[340px]" style={{ borderBottom: `2px solid ${INK}` }}>
          <ListingsMap listings={filtered} center={center} height="100%" />
        </div>
      )}

      {/* Results header + grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-wide md:text-4xl">
            {loading
              ? "Finding your city…"
              : city
              ? city.name
              : "All listings"}{" "}
            <span className="text-primary">/ {filtered.length} items</span>
          </h2>
          <a href="/map" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            Full map →
          </a>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl text-muted-foreground">No results</p>
            <p className="mt-2 text-sm text-muted-foreground">Try widening your radius or clearing filters.</p>
            <button
              onClick={() => { setCat("All"); setCond("All"); setRadius("All"); setQuery(""); }}
              className="mt-4 px-5 py-2 text-sm font-bold text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/browse/page.tsx
git commit -m "feat: add full-featured /browse page with search, sort, radius, map toggle"
```

---

### Task 3: Update nav to point to `/browse`

**Files:**
- Modify: `components/Header.tsx`

The "Browse" nav link currently points to `/`. Update it to `/browse`. Also update the `NavLink` active logic — currently `href === "/"` exact-matches the homepage. After this change, `/` is the landing page and `/browse` is browse, so both need their own active states.

- [ ] **Step 1: Update Header nav links**

In `components/Header.tsx`, change both occurrences of `<NavLink href="/">Browse</NavLink>` (desktop nav line ~43 and mobile nav line ~104) to `<NavLink href="/browse">Browse</NavLink>`.

The `NavLink` active logic already handles this correctly since `pathname.startsWith("/browse")` will match `/browse` and sub-paths but not `/`.

```tsx
{/* Desktop nav — replace Browse link */}
<NavLink href="/browse">Browse</NavLink>
<NavLink href="/map">Map</NavLink>
<NavLink href="/garage-sales">Sales</NavLink>
<NavLink href="/dashboard">Dashboard</NavLink>
```

```tsx
{/* Mobile nav — replace Browse link */}
<NavLink href="/browse">Browse</NavLink>
<NavLink href="/map">Map</NavLink>
<NavLink href="/garage-sales">Sales</NavLink>
<NavLink href="/dashboard">Dashboard</NavLink>
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: update Browse nav link to /browse"
```

---

### Task 4: Push

- [ ] **Step 1: Push all commits**

```bash
git push
```
