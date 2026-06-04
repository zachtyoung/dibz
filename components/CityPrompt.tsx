"use client";
import { useState, useMemo } from "react";
import { MapPin, Search, X, Crosshair, Loader2, Check } from "lucide-react";
import { ACTIVE_CITIES, type City } from "@/lib/cities";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";

function nearestCity(lat: number, lng: number): City | null {
  if (!ACTIVE_CITIES.length) return null;
  return ACTIVE_CITIES.reduce((best, city) => {
    const dist = (a: City) => Math.hypot(a.lat - lat, a.lng - lng);
    return dist(city) < dist(best) ? city : best;
  });
}

export function CityPrompt({
  onCity,
  onClose,
  currentCity,
}: {
  onCity: (city: City) => void;
  onClose?: () => void;
  currentCity?: City | null;
}) {
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [geoError, setGeoError] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIVE_CITIES.slice(0, 8);
    return ACTIVE_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  function autoDetect() {
    setGeoError("");
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
        if (nearest) onCity(nearest);
        else setGeoError("No city found near you.");
      },
      () => {
        setDetecting(false);
        setGeoError("Location access denied.");
      },
      { timeout: 8000 },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-surface"
        style={{ border: `2px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `2px solid ${INK}` }}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-display text-2xl tracking-wide">Pick your city</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Auto-detect */}
        <button
          onClick={autoDetect}
          disabled={detecting}
          className="flex w-full items-center gap-3 px-5 py-3 text-sm font-bold transition hover:bg-primary hover:text-white disabled:opacity-60"
          style={{ borderBottom: `2px solid ${INK}`, color: TEAL }}
        >
          {detecting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Crosshair className="h-4 w-4" />}
          {detecting ? "Detecting…" : "Use my location"}
        </button>
        {geoError && (
          <div className="px-5 py-2 text-xs text-red-500" style={{ borderBottom: `2px solid ${INK}` }}>
            {geoError}
          </div>
        )}

        {/* Search */}
        <div className="relative px-5 py-3" style={{ borderBottom: `2px solid ${INK}` }}>
          <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities…"
            autoFocus
            className="w-full bg-background py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            style={{ border: `2px solid ${INK}` }}
          />
        </div>

        {/* City list */}
        <div className="max-h-64 overflow-y-auto">
          {results.length === 0 && (
            <div className="px-5 py-4 text-sm text-muted-foreground">No cities found.</div>
          )}
          {results.map((c, i) => {
            const isSelected = currentCity?.slug === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => onCity(c)}
                className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold transition hover:bg-primary hover:text-white"
                style={{
                  borderTop: i > 0 ? `2px solid ${INK}` : undefined,
                  background: isSelected ? TEAL : undefined,
                  color: isSelected ? "white" : undefined,
                }}
              >
                <span>{c.name}</span>
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span className="text-xs font-bold opacity-50">{c.state}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
