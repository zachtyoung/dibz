"use client";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, distanceMi, CATEGORIES, CONDITIONS, type Condition } from "@/lib/listings";
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

  const listings = useMemo(() => {
    const base = city ? getListings(city) : [];
    if (!userLocation) return base;
    return base.map((l) => ({ ...l, distance: distanceMi(userLocation[0], userLocation[1], l.lat, l.lng) }));
  }, [city, userLocation]);
  const origin: [number, number] | null = userLocation ?? (city ? [city.lat, city.lng] : null);

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
      if (!origin) return 0;
      return (
        distanceMiNum(origin[0], origin[1], a.lat, a.lng) -
        distanceMiNum(origin[0], origin[1], b.lat, b.lng)
      );
    });
    return r;
  }, [listings, cat, cond, query, radius, sort, origin]);

  const center: [number, number] | undefined =
    userLocation ?? (city ? [city.lat, city.lng] : undefined);

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

        {/* Filter rows */}
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

          {/* Condition + Radius + Sort (mobile) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cond:</span>
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

            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Radius:</span>
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

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-wide md:text-4xl">
            {loading ? "Finding your city…" : city ? city.name : "All listings"}{" "}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
