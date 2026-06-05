"use client";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, distanceMi, CATEGORIES, CONDITIONS, type Condition } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { LayoutGrid, List, Map, Search, SlidersHorizontal, X } from "lucide-react";

const RADII = [5, 10, 25, 50] as const;
type Radius = typeof RADII[number] | "All";
type SortKey = "distance" | "price-asc" | "price-desc" | "newest";
type ColKey = "title" | "category" | "location" | "distance" | "price";

const INK = "oklch(0.16 0.01 60)";
const RED = "#c0392b";
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const SANS = "'Archivo Black', system-ui, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";

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
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [colSort, setColSort] = useState<{ col: ColKey; dir: "asc" | "desc" } | null>(null);
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
    // Grid/dropdown sort
    if (!colSort) {
      r = [...r].sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "newest") return (a.postedHoursAgo ?? 999) - (b.postedHoursAgo ?? 999);
        if (!origin) return 0;
        return distanceMiNum(origin[0], origin[1], a.lat, a.lng) - distanceMiNum(origin[0], origin[1], b.lat, b.lng);
      });
    } else {
      const { col, dir } = colSort;
      const d = dir === "asc" ? 1 : -1;
      r = [...r].sort((a, b) => {
        if (col === "title")    return d * a.title.localeCompare(b.title);
        if (col === "category") return d * a.category.localeCompare(b.category);
        if (col === "location") return d * a.location.localeCompare(b.location);
        if (col === "price")    return d * (a.price - b.price);
        if (col === "distance" && origin)
          return d * (distanceMiNum(origin[0], origin[1], a.lat, a.lng) - distanceMiNum(origin[0], origin[1], b.lat, b.lng));
        return 0;
      });
    }
    return r;
  }, [listings, cat, cond, query, radius, sort, colSort, origin]);

  const center: [number, number] | undefined =
    userLocation ?? (city ? [city.lat, city.lng] : undefined);

  return (
    <div className="min-h-screen" style={{ color: INK }}>
      <Header />

      {/* ── CLASSIFIEDS INDEX BAR ── */}
      <div style={{ borderBottom: `4px solid ${INK}`, background: INK }}>
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6" style={{ gap: 0 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em",
                fontWeight: 900, padding: "10px 16px", whiteSpace: "nowrap",
                background: cat === c ? RED : "transparent",
                color: "oklch(0.965 0.018 85)",
                borderRight: `1px solid rgba(255,255,255,0.15)`,
                cursor: "pointer", border: "none",
              }}
            >
              {c}
            </button>
          ))}
          {/* Sort — right aligned */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-auto focus:outline-none"
            style={{ background: "transparent", color: "oklch(0.965 0.018 85)", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 8px", border: "none", cursor: "pointer" }}
          >
            <option value="distance" style={{ background: INK }}>Nearest</option>
            <option value="price-asc" style={{ background: INK }}>Price ↑</option>
            <option value="price-desc" style={{ background: INK }}>Price ↓</option>
            <option value="newest" style={{ background: INK }}>Newest</option>
          </select>
          {(["grid", "list", "map"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: "10px 12px", background: view === v ? "rgba(255,255,255,0.15)" : "transparent", color: "oklch(0.965 0.018 85)", border: "none", borderLeft: `1px solid rgba(255,255,255,0.15)`, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              {v === "grid" && <LayoutGrid className="h-3 w-3" />}
              {v === "list" && <List className="h-3 w-3" />}
              {v === "map"  && <Map className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION HEADER ── */}
      <div className="mx-auto max-w-7xl px-6" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="flex items-end justify-between py-4">
          <div>
            <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Classifieds — Latest Edition</p>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.75rem,3vw,2.5rem)", lineHeight: 1, marginTop: 4, color: INK }}>
              {loading ? "Finding your city…" : city ? city.name : "All listings"}
              <span style={{ fontFamily: MONO, fontStyle: "normal", fontWeight: 400, fontSize: "0.35em", letterSpacing: "0.15em", textTransform: "uppercase", color: INK, opacity: 0.5, marginLeft: 16 }}>
                {filtered.length} listings
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: INK, opacity: 0.4 }} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings…"
                className="bg-background focus:outline-none"
                style={{ border: `2px solid ${INK}`, padding: "6px 12px 6px 32px", fontFamily: MONO, fontSize: 11, color: INK, width: 200 }}
              />
            </div>
            {/* Filters toggle mobile */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 md:hidden"
              style={{ border: `2px solid ${INK}`, padding: "6px 12px", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", background: showFilters ? INK : "transparent", color: showFilters ? "oklch(0.965 0.018 85)" : INK, cursor: "pointer" }}
            >
              <SlidersHorizontal className="h-3 w-3" /> Filter
            </button>
          </div>
        </div>

        {/* ── CONDITION + RADIUS filters ── */}
        <div className={`pb-3 ${showFilters ? "flex" : "hidden md:flex"} flex-wrap items-center gap-x-6 gap-y-2`}>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.45, color: INK }}>Condition</span>
            <div style={{ height: 1, width: 1, background: INK, opacity: 0.2 }} />
            {(["All", ...CONDITIONS] as const).map((c) => (
              <button key={c} onClick={() => setCond(c)}
                style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", background: "none", border: "none", cursor: "pointer", color: cond === c ? RED : INK, fontWeight: cond === c ? 700 : 400, borderBottom: cond === c ? `2px solid ${RED}` : "2px solid transparent" }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 16, background: INK, opacity: 0.2 }} />
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.45, color: INK }}>Radius</span>
            {(["All", ...RADII] as const).map((r) => (
              <button key={r} onClick={() => setRadius(r)}
                style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 8px", background: "none", border: "none", cursor: "pointer", color: radius === r ? RED : INK, fontWeight: radius === r ? 700 : 400, borderBottom: radius === r ? `2px solid ${RED}` : "2px solid transparent" }}>
                {r === "All" ? "Any" : `${r} mi`}
              </button>
            ))}
          </div>
          {/* Mobile search */}
          <div className="relative ml-auto md:hidden">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="bg-background focus:outline-none"
              style={{ border: `2px solid ${INK}`, padding: "4px 10px", fontFamily: MONO, fontSize: 11, color: INK, width: 140 }}
            />
          </div>
        </div>
      </div>

      {/* Map view */}
      {view === "map" && (
        <div className="h-[55vh] min-h-[340px]" style={{ borderBottom: `2px solid ${INK}` }}>
          <ListingsMap listings={filtered} center={center} height="100%" />
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {view === "grid" && (
        <div className="mx-auto max-w-7xl px-6 py-6">
          {filtered.length === 0 ? <EmptyState onClear={() => { setCat("All"); setCond("All"); setRadius("All"); setQuery(""); }} /> : (
            <div className="grid grid-cols-2 gap-px md:grid-cols-3 xl:grid-cols-4" style={{ background: INK }}>
              {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="mx-auto max-w-7xl px-6 py-4">
          {filtered.length === 0 ? <EmptyState onClear={() => { setCat("All"); setCond("All"); setRadius("All"); setQuery(""); }} /> : (
            <table style={{ width: "100%", borderCollapse: "collapse", borderTop: `2px solid ${INK}` }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${INK}` }}>
                  <th style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.4, fontWeight: 400, padding: "6px 8px", textAlign: "left", width: 28 }}>#</th>
                  <th style={{ padding: "6px 8px", width: 52 }} />
                  {([
                    { key: "title" as ColKey,    label: "Item",     align: "left" },
                    { key: "category" as ColKey, label: "Category", align: "left",  cls: "hidden md:table-cell" },
                    { key: "location" as ColKey, label: "Location", align: "left",  cls: "hidden md:table-cell" },
                    { key: "distance" as ColKey, label: "Distance", align: "right", cls: "hidden md:table-cell" },
                    { key: "price" as ColKey,    label: "Price",    align: "right" },
                  ]).map(({ key, label, align, cls }) => {
                    const active = colSort?.col === key;
                    const dir = active ? colSort!.dir : null;
                    return (
                      <th key={key} className={cls}
                        onClick={() => setColSort(active ? { col: key, dir: dir === "asc" ? "desc" : "asc" } : { col: key, dir: "asc" })}
                        style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: active ? 700 : 400, color: active ? RED : INK, opacity: active ? 1 : 0.5, padding: "6px 8px", textAlign: align as "left"|"right", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                      >
                        {label}{" "}
                        {active ? (dir === "asc" ? "↑" : "↓") : <span style={{ opacity: 0.3 }}>↕</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id} style={{ borderBottom: `1px dotted ${INK}`, cursor: "pointer" }}
                    onClick={() => window.location.href = `/listing/${l.id}`}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ fontFamily: MONO, fontSize: 9, opacity: 0.35, padding: "8px 8px", width: 28 }}>{String(i + 1).padStart(2, "0")}</td>
                    <td style={{ padding: "6px 8px", width: 52 }}>
                      <div style={{ width: 40, height: 40, overflow: "hidden", flexShrink: 0 }}>
                        <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) contrast(1.05)", display: "block" }} />
                      </div>
                    </td>
                    <td style={{ padding: "8px 8px", maxWidth: 320 }}>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</span>
                    </td>
                    <td className="hidden md:table-cell" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.55, padding: "8px 8px", whiteSpace: "nowrap" }}>{l.category}</td>
                    <td className="hidden md:table-cell" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.55, padding: "8px 8px", whiteSpace: "nowrap" }}>{l.location.split(",")[0]}</td>
                    <td className="hidden md:table-cell" style={{ fontFamily: MONO, fontSize: 9, opacity: 0.35, padding: "8px 8px", textAlign: "right", whiteSpace: "nowrap" }}>{l.distance}</td>
                    <td style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, padding: "8px 8px", textAlign: "right", whiteSpace: "nowrap", color: l.isGarageSale ? (l.saleType === "estate" ? "#b7791f" : RED) : INK }}>
                      {l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-8" style={{ borderTop: `2px solid ${INK}` }}>
        <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.4, color: INK }}>
          Dibz Press · {city?.name ?? "All Cities"} · {filtered.length} active listings · Free to list, always.
        </p>
      </footer>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="py-20 text-center">
      <p style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", fontSize: "2rem", color: "oklch(0.16 0.01 60)", opacity: 0.4 }}>No listings found.</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginTop: 8 }}>Try widening your radius or clearing filters.</p>
      <button onClick={onClear} style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#c0392b", background: "none", border: "none", cursor: "pointer" }}>
        Clear all filters
      </button>
    </div>
  );
}
