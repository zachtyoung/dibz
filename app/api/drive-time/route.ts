import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origins = searchParams.get("origins");
  const destinations = searchParams.get("destinations");

  if (!origins || !destinations) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=driving&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
