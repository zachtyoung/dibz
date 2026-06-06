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

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

async function fetchDriveTimes(
  origin: [number, number],
  destinations: { id: string; lat: number; lng: number }[],
): Promise<Record<string, string>> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;
  const result: Record<string, string> = {};
  await Promise.all(
    destinations.map(async (d) => {
      try {
        const res = await fetch(
          `https://routes.googleapis.com/directions/v2:computeRoutes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": key,
              "X-Goog-FieldMask": "routes.duration",
            },
            body: JSON.stringify({
              origin: { location: { latLng: { latitude: origin[0], longitude: origin[1] } } },
              destination: { location: { latLng: { latitude: d.lat, longitude: d.lng } } },
              travelMode: "DRIVE",
            }),
          }
        );
        const data = await res.json();
        const secs = data.routes?.[0]?.duration;
        result[d.id] = secs ? formatDuration(parseInt(secs)) : "N/A";
      } catch {
        result[d.id] = "N/A";
      }
    })
  );
  return result;
}

function MapContent() {
  const { city, loading } = useCityContext();
  const [cat, setCat] = useState("All");
  const [cond, setCond] = useState<Condition | "All">("All");
  const [radius, setRadius] = useState<Radius>("All");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [driveTimes, setDriveTimes] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      () => setLocationDenied(true),
    );
  }, []);

  useEffect(() => {
    if (!userLocation || !city) return;
    const allListings = getListings(city);
    fetchDriveTimes(userLocation, allListings.map((l) => ({ id: l.id, lat: l.lat, lng: l.lng })))
      .then(setDriveTimes);
  }, [userLocation, city]);

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
      <aside className="order-2 flex w-full flex-col lg:order-1 lg:w-[460px] lg:max-w-[38vw]" style={{ borderRight: `2px solid ${INK}` }}>

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

        {/* Masthead */}
        <div style={{ borderBottom: `2px solid ${INK}`, flexShrink: 0 }}>

          {/* City + count */}
          <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${INK}`, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "1.75rem", lineHeight: 1, color: INK, margin: 0 }}>
              {q ? `"${q}"` : (city?.name ?? "All Cities")}
            </h1>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK, opacity: 0.4, flexShrink: 0 }}>
              {loading ? "…" : `${filtered.length}`}
            </span>
          </div>

          {/* Filter panel — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `0px` }}>

            {/* Condition */}
            <div style={{ padding: "10px 18px 12px", borderRight: `1px solid ${INK}` }}>
              <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.25em", color: RED, marginBottom: 8 }}>Condition</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(["All", ...CONDITIONS] as const).map((c) => (
                  <button key={c} onClick={() => setCond(c)}
                    style={{
                      fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
                      padding: "4px 9px",
                      background: cond === c ? INK : "transparent",
                      color: cond === c ? CREAM : INK,
                      border: `1.5px solid ${cond === c ? INK : `${INK}50`}`,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >{c === "for parts" ? "Parts" : c}</button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div style={{ padding: "10px 18px 12px" }}>
              <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.25em", color: RED, marginBottom: 8 }}>Radius</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(["All", ...RADII] as const).map((r) => (
                  <button key={r} onClick={() => setRadius(r)}
                    style={{
                      fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
                      padding: "4px 9px",
                      background: radius === r ? INK : "transparent",
                      color: radius === r ? CREAM : INK,
                      border: `1.5px solid ${radius === r ? INK : `${INK}50`}`,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >{r === "All" ? "Any" : `${r} mi`}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listing list */}
        <div className="lg:flex-1 lg:overflow-y-auto" style={{ borderTop: "none" }}>
          {filtered.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, padding: "24px 16px", color: INK }}>No listings found.</p>
          ) : (
            filtered.map((l, i) => (
              <div key={l.id}
                onClick={() => setSelectedId(selectedId === l.id ? null : l.id)}
                style={{ textDecoration: "none", color: INK, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px dotted ${INK}`, cursor: "pointer", background: selectedId === l.id ? `${INK}08` : "transparent", borderLeft: selectedId === l.id ? `3px solid ${RED}` : "3px solid transparent" }}
              >
                <span style={{ fontFamily: MONO, fontSize: 8, opacity: 0.3, flexShrink: 0, width: 20 }}>{String(i+1).padStart(2,"0")}</span>
                <div style={{ width: 52, height: 52, flexShrink: 0, overflow: "hidden" }}>
                  <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: undefined, display: "block" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.55, marginTop: 2 }}>{l.category} · {l.location.split(",")[0]}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: l.isGarageSale ? (l.saleType === "estate" ? "#b7791f" : RED) : INK }}>
                    {l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}
                  </div>
                  {l.distance && (
                    <div style={{ fontFamily: MONO, fontSize: 8, opacity: 0.45, marginTop: 1 }}>
                      {l.distance}
                      {driveTimes[l.id] && (
                        <span style={{ marginLeft: 4 }}>· {driveTimes[l.id]}</span>
                      )}
                    </div>
                  )}
                  {selectedId === l.id && (
                    <a href={`/listing/${l.id}`} onClick={e => e.stopPropagation()}
                      style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: RED, textDecoration: "none", display: "block", marginTop: 4 }}>
                      View →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Map */}
      <div className="relative order-1 h-[46vh] min-h-[340px] shrink-0 lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
        <ListingsMap listings={filtered} center={center} height="100%" selectedId={selectedId} onSelectId={setSelectedId} driveTimes={driveTimes} locationDenied={locationDenied} userLocation={userLocation} />
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
