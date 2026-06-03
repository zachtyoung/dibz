"use client";
import { useEffect, useState } from "react";
import { type City, ACTIVE_CITIES } from "@/lib/cities";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestActiveCity(lat: number, lng: number): City | null {
  if (!ACTIVE_CITIES.length) return null;
  return ACTIVE_CITIES.reduce((best, city) => {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    const bestD = haversineKm(lat, lng, best.lat, best.lng);
    return d < bestD ? city : best;
  });
}

const STORAGE_KEY = "dibz:city-slug";

function gpsCoords(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60_000 },
    );
  });
}

async function ipCoords(): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    const data = await res.json();
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  } catch {}
  return null;
}

export function useCity() {
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const match = ACTIVE_CITIES.find((c) => c.slug === saved);
      if (match) {
        setCity(match);
        setLoading(false);
        return;
      }
    }

    async function detectCity() {
      // Race GPS and IP — first non-null result wins
      const coords = await Promise.race([
        gpsCoords(),
        ipCoords(),
      ]);

      if (coords) {
        const nearest = nearestActiveCity(coords.lat, coords.lng);
        if (nearest) {
          setCity(nearest);
          localStorage.setItem(STORAGE_KEY, nearest.slug);
          setLoading(false);
          return;
        }
      }

      // Both failed — wait for the other one
      const [gps, ip] = await Promise.all([gpsCoords(), ipCoords()]);
      const fallback = gps ?? ip;
      if (fallback) {
        const nearest = nearestActiveCity(fallback.lat, fallback.lng);
        if (nearest) {
          setCity(nearest);
          localStorage.setItem(STORAGE_KEY, nearest.slug);
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      setFailed(true);
    }

    detectCity();
  }, []);

  function resolveCity(c: City) {
    setCity(c);
    setFailed(false);
    localStorage.setItem(STORAGE_KEY, c.slug);
  }

  return { city, loading, failed, setCity: resolveCity };
}
