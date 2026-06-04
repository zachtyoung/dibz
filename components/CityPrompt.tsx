"use client";
import { useState, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
import { ACTIVE_CITIES, type City } from "@/lib/cities";

export function CityPrompt({ onCity, onClose }: { onCity: (city: City) => void; onClose?: () => void }) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition">
              <X className="h-5 w-5" />
            </button>
          )}
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
