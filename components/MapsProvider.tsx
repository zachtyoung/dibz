"use client";
import { APIProvider } from "@vis.gl/react-google-maps";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

export function MapsProvider({ children }: { children: React.ReactNode }) {
  return <APIProvider apiKey={KEY}>{children}</APIProvider>;
}
