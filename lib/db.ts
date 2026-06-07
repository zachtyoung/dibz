import { getSupabaseAdmin } from "@/lib/supabase/server";

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    // SERVICE_ROLE_KEY not set — fall back to anon client for read-only queries
    const { createClient } = require("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}
import type { Listing } from "@/lib/listings";

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

export async function getListingsFromDB(citySlug: string): Promise<Listing[]> {
  const { data, error } = await getClient()
    .from("listings")
    .select("*")
    .eq("city_slug", citySlug)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getListingsFromDB error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToListing);
}

export async function getListingByIdFromDB(id: string): Promise<Listing | null> {
  const { data, error } = await getClient()
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToListing(data as Record<string, unknown>);
}
