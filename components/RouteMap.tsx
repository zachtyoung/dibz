"use client";
import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/lib/listings";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

export type RouteStep = {
  from: Listing;
  to: Listing;
  durationText: string;
  distanceText: string;
  durationSec: number;
};

type Props = {
  stops: Listing[];
  onRouteReady?: (steps: RouteStep[]) => void;
};

const DARK_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373759" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3d3d5c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#374151" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#111827" }] },
];

function placeMarkersAndRoute(
  map: google.maps.Map,
  renderer: google.maps.DirectionsRenderer,
  markersRef: React.MutableRefObject<google.maps.Marker[]>,
  stops: Listing[],
  onRouteReady?: (steps: RouteStep[]) => void,
) {
  markersRef.current.forEach((m) => m.setMap(null));
  markersRef.current = [];

  if (stops.length === 0) {
    renderer.setDirections({ routes: [] } as any);
    return;
  }

  stops.forEach((stop, i) => {
    const marker = new google.maps.Marker({
      map,
      position: { lat: stop.lat, lng: stop.lng },
      title: stop.title,
      label: { text: String(i + 1), color: "#ffffff", fontSize: "12px", fontWeight: "700" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#f97316",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
    markersRef.current.push(marker);
  });

  if (stops.length < 2) {
    map.setCenter({ lat: stops[0].lat, lng: stops[0].lng });
    map.setZoom(14);
    onRouteReady?.([]);
    return;
  }

  const service = new google.maps.DirectionsService();
  const waypoints = stops.slice(1, -1).map((s) => ({
    location: new google.maps.LatLng(s.lat, s.lng),
    stopover: true,
  }));

  service.route(
    {
      origin: new google.maps.LatLng(stops[0].lat, stops[0].lng),
      destination: new google.maps.LatLng(stops[stops.length - 1].lat, stops[stops.length - 1].lng),
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false,
    },
    (result, status) => {
      if (status !== "OK" || !result) return;
      renderer.setDirections(result);
      const legs = result.routes[0].legs;
      const steps: RouteStep[] = legs.map((leg, i) => ({
        from: stops[i],
        to: stops[i + 1],
        durationText: leg.duration?.text ?? "—",
        distanceText: leg.distance?.text ?? "—",
        durationSec: leg.duration?.value ?? 0,
      }));
      onRouteReady?.(steps);
    }
  );
}

export function RouteMap({ stops, onRouteReady }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const onRouteReadyRef = useRef(onRouteReady);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep callback ref stable so it doesn't trigger effects
  useEffect(() => { onRouteReadyRef.current = onRouteReady; });

  // Load Google Maps script once
  useEffect(() => {
    function initMap() {
      if (!ref.current || mapRef.current) return;
      mapRef.current = new google.maps.Map(ref.current, {
        zoom: 12,
        center: { lat: stops[0]?.lat ?? 37.77, lng: stops[0]?.lng ?? -122.42 },
        disableDefaultUI: false,
        styles: DARK_STYLES,
      });
      rendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#f97316", strokeWeight: 4, strokeOpacity: 0.9 },
      });
      rendererRef.current.setMap(mapRef.current);
      setReady(true);
    }

    if (typeof google !== "undefined" && google.maps) {
      initMap();
      return;
    }

    const existing = document.getElementById("gmaps-script");
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}`;
    script.async = true;
    script.onload = initMap;
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run markers+route only when stop IDs change
  const stopKey = stops.map((s) => s.id).join(",");
  useEffect(() => {
    if (!ready || !mapRef.current || !rendererRef.current) return;
    placeMarkersAndRoute(mapRef.current, rendererRef.current, markersRef, stops, onRouteReadyRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stopKey]);

  if (error) return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{error}</div>
  );

  return <div ref={ref} className="h-full w-full" />;
}
