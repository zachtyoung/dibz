import { NextRequest, NextResponse } from "next/server";
import { getListingsFromDB } from "@/lib/db";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city");
  if (!city) return NextResponse.json({ error: "city required" }, { status: 400 });

  try {
    const listings = await getListingsFromDB(city);
    return NextResponse.json(listings, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("listings route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
