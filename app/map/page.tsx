"use client";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, distanceMi, CATEGORIES, CONDITIONS, type Condition } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";

const RADII = [5, 10, 25, 50] as const;
type Radius = typeof RADII[number] | "All";

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

function distanceMiNum(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const m = Math.sqrt((dLat * 111_000) ** 2 + (dLng * 111_000 * Math.cos(lat1 * Math.PI / 180)) ** 2);
  return m / 1609;
}

function MapContent() {
  const { city, loading } = useCityContext();
  const [cat, setCat] = useState("All");
  const [cond, setCond] = useState<Condition | "All">("All");
  const [radius, setRadius] = useState<Radius>("All");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const listings = useMemo(() => {
    const base = city ? getListings(city) : [];
    if (!userLocation) return base;
    return base.map((l) => ({ ...l, distance: distanceMi(userLocation[0], userLocation[1], l.lat, l.lng) }));
  }, [city, userLocation]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
    );
  }, []);

  const center: [number, number] | undefined =
    userLocation ?? (city ? [city.lat, city.lng] : undefined);

  const filtered = useMemo(() => {
    let result = cat === "All" ? listings : listings.filter((l) => l.category === cat);
    if (cond !== "All") result = result.filter((l) => l.condition === cond);
    if (q) result = result.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.seller.toLowerCase().includes(q)
    );
    if (radius !== "All" && center) {
      result = result.filter((l) => distanceMiNum(center[0], center[1], l.lat, l.lng) <= radius);
    }
    return result;
  }, [listings, cat, cond, q, radius, center]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="order-2 flex w-full flex-col lg:order-1 lg:w-[400px] lg:max-w-[35vw]" style={{ borderRight: `2px solid ${INK}` }}>

        {/* Category index bar */}
        <div style={{ borderBottom: `4px solid ${INK}`, background: INK, flexShrink: 0 }}>
          <div className="flex overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                style={{ fontFamily: SANS, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, padding: "8px 12px", whiteSpace: "nowrap", background: cat === c ? RED : "transparent", color: CREAM, border: "none", borderRight: `1px solid rgba(255,255,255,0.12)`, cursor: "pointer", flexShrink: 0 }}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div style={{ borderBottom: `2px solid ${INK}`, padding: "12px 16px", flexShrink: 0 }}>
          <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED }}>§ On the Map</p>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "1.6rem", lineHeight: 1, marginTop: 4, color: INK }}>
            {q ? `"${q}"` : (city?.name ?? "All Cities")}
            <span style={{ fontFamily: MONO, fontStyle: "normal", fontWeight: 400, fontSize: "0.35em", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, marginLeft: 12 }}>
              {loading ? "…" : `${filtered.length} listings`}
            </span>
          </h1>

          {/* Condition + Radius */}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.4, color: INK }}>Cond</span>
              {(["All", ...CONDITIONS] as const).map((c) => (
                <button key={c} onClick={() => setCond(c)}
                  style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", padding: "1px 6px", background: "none", border: "none", cursor: "pointer", color: cond === c ? RED : INK, fontWeight: cond === c ? 700 : 400, borderBottom: cond === c ? `2px solid ${RED}` : "2px solid transparent" }}
                >{c}</button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.4, color: INK }}>Radius</span>
              {(["All", ...RADII] as const).map((r) => (
                <button key={r} onClick={() => setRadius(r)}
                  style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", padding: "1px 6px", background: "none", border: "none", cursor: "pointer", color: radius === r ? RED : INK, fontWeight: radius === r ? 700 : 400, borderBottom: radius === r ? `2px solid ${RED}` : "2px solid transparent" }}
                >{r === "All" ? "Any" : `${r} mi`}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Listing list */}
        <div className="lg:flex-1 lg:overflow-y-auto" style={{ borderTop: "none" }}>
          {filtered.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, padding: "24px 16px", color: INK }}>No listings found.</p>
          ) : (
            filtered.map((l, i) => (
              <a key={l.id} href={`/listing/${l.id}`}
                style={{ textDecoration: "none", color: INK, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px dotted ${INK}` }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.025)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: MONO, fontSize: 8, opacity: 0.3, flexShrink: 0, width: 20 }}>{String(i+1).padStart(2,"0")}</span>
                <div style={{ width: 52, height: 52, flexShrink: 0, overflow: "hidden" }}>
                  <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) contrast(1.05)", display: "block" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.55, marginTop: 2 }}>{l.category} · {l.location.split(",")[0]}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: l.isGarageSale ? (l.saleType === "estate" ? "#b7791f" : RED) : INK }}>
                    {l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}
                  </div>
                  {l.distance && <div style={{ fontFamily: MONO, fontSize: 8, opacity: 0.35, marginTop: 1 }}>{l.distance}</div>}
                </div>
              </a>
            ))
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="relative order-1 h-[46vh] min-h-[340px] shrink-0 lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
        <ListingsMap listings={filtered} center={center} height="100%" />
      </div>
    </div>
  );
}

export default function MapView() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <Suspense fallback={null}>
        <MapContent />
      </Suspense>
    </div>
  );
}
