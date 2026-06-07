"use client";
import { useState, useEffect } from "react";
import type { City } from "@/lib/cities";
import type { Listing } from "@/lib/listings";

export function useListings(city: City | null): { listings: Listing[]; loading: boolean } {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) { setListings([]); return; }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/listings?city=${encodeURIComponent(city.slug)}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setListings(data as Listing[]);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [city?.slug]);

  return { listings, loading };
}
