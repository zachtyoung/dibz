"use client";
import { useState, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
import { ACTIVE_CITIES, type City } from "@/lib/cities";

const INK = "oklch(0.14 0.02 240)";

export function CityPrompt({ onCity, onClose }: { onCity: (city: City) => void; onClose?: () => void }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIVE_CITIES.slice(0, 8);
    return ACTIVE_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

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
        <div>
          {results.length === 0 && (
            <div className="px-5 py-4 text-sm text-muted-foreground">No cities found.</div>
          )}
          {results.map((c, i) => (
            <button
              key={c.slug}
              onClick={() => onCity(c)}
              className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold transition hover:bg-primary hover:text-primary-foreground"
              style={{ borderTop: i > 0 ? `2px solid ${INK}` : undefined }}
            >
              <span>{c.name}</span>
              <span className="text-xs font-bold opacity-50">{c.state}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
