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
      {/* List panel */}
      <aside className="order-2 flex w-full flex-col border-r border-border/60 bg-background lg:order-1 lg:w-[480px] lg:max-w-[40vw]">
        <div className="border-b border-border/60 px-5 py-4">
          <h1 className="font-display text-3xl tracking-wide">
            {q ? `"${q}"` : "On the map"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Finding your location…"
              : `${filtered.length} ${filtered.length === 1 ? "result" : "results"}${city ? ` in ${city.name}` : ""}`}
          </p>

          {/* Category filter */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap px-3 py-1 text-xs font-semibold transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
                style={{ border: "2px solid oklch(0.14 0.02 240)" }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Condition filter */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cond:</span>
            {(["All", ...CONDITIONS] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCond(c)}
                className={`whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  cond === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
                style={{ border: "2px solid oklch(0.14 0.02 240)" }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Radius filter */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Radius:</span>
            {(["All", ...RADII] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRadius(r)}
                className={`whitespace-nowrap px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  radius === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
                style={{ border: "2px solid oklch(0.14 0.02 240)" }}
              >
                {r === "All" ? "Any" : `${r} mi`}
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
