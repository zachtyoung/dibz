import { NextRequest, NextResponse } from "next/server";
import { getListingsFromDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });

  const listings = await getListingsFromDB(city);
  return NextResponse.json(listings, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
