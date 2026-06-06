"use client";
import { useState, useEffect } from "react";
import type { City } from "@/lib/cities";
import type { Listing } from "@/lib/listings";
import { getListings } from "@/lib/listings";

export function useListings(city: City | null): Listing[] {
  const [listings, setListings] = useState<Listing[]>(() =>
    city ? getListings(city) : []
  );

  useEffect(() => {
    if (!city) { setListings([]); return; }

    let cancelled = false;
    fetch(`/api/listings?city=${encodeURIComponent(city.slug)}`)
      .then((r) => r.json())
      .then((data: Listing[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setListings(data);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [city?.slug]);

  return listings;
}
