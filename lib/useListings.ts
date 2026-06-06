"use client";
import { useState, useEffect } from "react";
import type { City } from "@/lib/cities";
import type { Listing } from "@/lib/listings";
import { getListings } from "@/lib/listings";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function rowToListing(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id),
    title: String(row.title),
    price: Number(row.price),
    category: String(row.category),
    condition: (row.condition as Listing["condition"]) ?? undefined,
    location: String(row.location),
    distance: "",
    seller: String(row.seller_name),
    image: String(row.image_url ?? ""),
    lat: Number(row.lat),
    lng: Number(row.lng),
    isGarageSale: Boolean(row.is_garage_sale),
    saleType: (row.sale_type as Listing["saleType"]) ?? undefined,
    description: (row.description as string) ?? undefined,
    date: (row.sale_date as string) ?? undefined,
    dateISO: row.sale_date_iso ? String(row.sale_date_iso) : undefined,
    postedHoursAgo: (row.posted_hours_ago as number) ?? undefined,
  };
}

export function useListings(city: City | null): Listing[] {
  const [listings, setListings] = useState<Listing[]>(() =>
    city ? getListings(city) : []
  );

  useEffect(() => {
    if (!city) { setListings([]); return; }

    let cancelled = false;
    const url = `${SUPABASE_URL}/rest/v1/listings?select=*&city_slug=eq.${encodeURIComponent(city.slug)}&is_active=eq.true&order=created_at.desc`;

    fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setListings((data as Record<string, unknown>[]).map(rowToListing));
        }
      })
      .catch((e) => console.error("useListings fetch error:", e));

    return () => { cancelled = true; };
  }, [city?.slug]);

  return listings;
}
