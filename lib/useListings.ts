"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { City } from "@/lib/cities";
import type { Listing } from "@/lib/listings";
import { getListings } from "@/lib/listings";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
    supabase
      .from("listings")
      .select("*")
      .eq("city_slug", city.slug)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { console.error("useListings error:", error.message); return; }
        if (data && data.length > 0) {
          setListings((data as Record<string, unknown>[]).map(rowToListing));
        }
      });

    return () => { cancelled = true; };
  }, [city?.slug]);

  return listings;
}
