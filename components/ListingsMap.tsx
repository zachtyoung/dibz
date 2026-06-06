"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import Link from "next/link";
import type { Listing } from "@/lib/listings";


/* Warm cream map style matching the Dibz aesthetic */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",            stylers: [{ color: "#f5efe0" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#3d3520" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#f5efe0" }] },
  { featureType: "road",                elementType: "geometry",           stylers: [{ color: "#e8dfc8" }] },
  { featureType: "road.arterial",       elementType: "geometry",           stylers: [{ color: "#ddd4b8" }] },
  { featureType: "road.highway",        elementType: "geometry",           stylers: [{ color: "#d4c89a" }] },
  { featureType: "road.highway",        elementType: "geometry.stroke",    stylers: [{ color: "#c8b870" }] },
  { featureType: "water",               elementType: "geometry",           stylers: [{ color: "#c5d8d1" }] },
  { featureType: "poi.park",            elementType: "geometry",           stylers: [{ color: "#d8e8c8" }] },
  { featureType: "poi",                 elementType: "labels",             stylers: [{ visibility: "off" }] },
  { featureType: "transit",             stylers: [{ visibility: "off" }] },
  { featureType: "administrative",      elementType: "geometry.stroke",    stylers: [{ color: "#c8b870" }] },
];

function SaleMarker({ listing, selected, onClick }: {
  listing: Listing;
  selected: boolean;
  onClick: () => void;
}) {
  const isEstate = listing.saleType === "estate";

  if (listing.isGarageSale) {
    return (
      <AdvancedMarker
        position={{ lat: listing.lat, lng: listing.lng }}
        onClick={onClick}
        zIndex={selected ? 10 : 1}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: isEstate ? "#fbbf24" : "#0f6b55",
            border: `3px solid oklch(0.14 0.02 240)`,
            boxShadow: selected ? "3px 3px 0 oklch(0.14 0.02 240)" : "2px 2px 0 oklch(0.14 0.02 240)",
            display: "grid",
            placeItems: "center",
            transform: selected ? "scale(1.15) translateY(-2px)" : "scale(1)",
            transition: "transform 0.15s",
            cursor: "pointer",
          }}
        >
          <span style={{
            fontFamily: "Bebas Neue, Impact, sans-serif",
            fontSize: 13,
            color: isEstate ? "#451a03" : "#d1fae5",
            letterSpacing: "0.05em",
          }}>
            {isEstate ? "EST" : "SALE"}
          </span>
        </div>
      </AdvancedMarker>
    );
  }

  const size = selected ? 44 : 36;
  const color = selected ? "#0a4f40" : "#2dd4a8";
  return (
    <AdvancedMarker
      position={{ lat: listing.lat, lng: listing.lng }}
      onClick={onClick}
      zIndex={selected ? 10 : 1}
    >
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 40 52"
        style={{ display: "block", cursor: "pointer", transition: "all 0.15s",
          filter: selected ? "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}
      >
        {/* Teardrop pin */}
        <path d="M20 2 C10 2 2 10 2 20 C2 32 20 50 20 50 C20 50 38 32 38 20 C38 10 30 2 20 2Z"
          fill={color} stroke="oklch(0.14 0.02 240)" strokeWidth="2" />
        {/* Inner dot */}
        <circle cx="20" cy="20" r="6" fill="white" opacity="0.9" />
      </svg>
    </AdvancedMarker>
  );
}

function ListingPopup({ listing, onClose, driveTime, showDrive }: { listing: Listing; onClose: () => void; driveTime?: string; showDrive?: boolean }) {
  const INK   = "oklch(0.14 0.02 240)";
  const RED   = "#c0392b";
  const TEAL  = "oklch(0.48 0.13 178)";
  const SERIF = "'DM Serif Display', Georgia, serif";
  const MONO  = "'JetBrains Mono', 'Courier New', monospace";
  const SANS  = "'Archivo Black', system-ui, sans-serif";
  const price = listing.isGarageSale
    ? (listing.saleType === "estate" ? "Estate Sale" : "Garage Sale")
    : `$${listing.price.toLocaleString()}`;
  const priceColor = listing.isGarageSale ? (listing.saleType === "estate" ? "#b7791f" : TEAL) : RED;

  return (
    <InfoWindow
      position={{ lat: listing.lat, lng: listing.lng }}
      onCloseClick={onClose}
      pixelOffset={[0, listing.isGarageSale ? -42 : -46]}
    >
      <Link href={`/listing/${listing.id}`} style={{ display: "block", width: 260, textDecoration: "none" }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: "100%", height: 150, objectFit: "cover", display: "block", borderBottom: `2px solid ${INK}` }}
        />
        <div style={{ padding: "10px 12px 8px" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: INK, lineHeight: 1.25 }}>
            {listing.title}
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: priceColor, marginTop: 4, lineHeight: 1 }}>
            {price}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, opacity: 0.5, marginTop: 6 }}>
            {listing.location}
          </div>
          {(listing.distance || (showDrive && driveTime)) && (
            <div style={{ fontFamily: MONO, fontSize: 9, color: INK, opacity: 0.55, marginTop: 3, display: "flex", gap: 8 }}>
              {listing.distance && <span>{listing.distance}</span>}
              {showDrive && driveTime && driveTime !== "N/A" && (
                <span style={{ color: TEAL, opacity: 1, fontWeight: 700 }}>· {driveTime} drive</span>
              )}
            </div>
          )}
          {listing.condition && (
            <div style={{ display: "inline-block", marginTop: 6, padding: "2px 6px", border: `1.5px solid ${INK}`, fontFamily: SANS, fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: INK, opacity: 0.5 }}>
              {listing.condition}
            </div>
          )}
        </div>
      </Link>
    </InfoWindow>
  );
}

function MapPanner({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.panTo({ lat: center[0], lng: center[1] });
  }, [map, center[0], center[1]]);
  return null;
}

export function ListingsMap({
  listings,
  center,
  zoom = 13,
  height = "100%",
  selectedId: controlledId,
  onSelectId,
  driveTimes = {},
  locationDenied = false,
  userLocation,
}: {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
  driveTimes?: Record<string, string>;
  locationDenied?: boolean;
  userLocation?: [number, number] | null;
}) {
  const [internalId, setInternalId] = useState<string | null>(null);
  const selectedId = controlledId !== undefined ? controlledId : internalId;
  const setSelectedId = onSelectId ?? setInternalId;
  const initialCenter = center ?? [37.6872, -97.3301] as [number, number];
  const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(selectedId === id ? null : id);
  }, [selectedId, setSelectedId]);

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
    <Map
        style={{ width: "100%", height: "100%" }}
        mapId="18620e62c3fd6cbf63eb5904"
        defaultCenter={{ lat: initialCenter[0], lng: initialCenter[1] }}
        defaultZoom={zoom}
        disableDefaultUI={false}
        gestureHandling="greedy"
        onClick={() => setSelectedId(null)}
      >
        {center && <MapPanner center={center} />}

        {/* User location dot */}
        {center && (
          <AdvancedMarker position={{ lat: center[0], lng: center[1] }} zIndex={20}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              background: "#3b82f6", border: "3px solid #fff",
              boxShadow: "0 0 0 4px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            }} />
          </AdvancedMarker>
        )}

        {listings.map((l) => (
          <SaleMarker
            key={l.id}
            listing={l}
            selected={selectedId === l.id}
            onClick={() => handleMarkerClick(l.id)}
          />
        ))}

        {selectedListing && (
          <ListingPopup
            listing={selectedListing}
            onClose={() => setSelectedId(null)}
            driveTime={driveTimes[selectedListing.id] ?? (locationDenied ? "N/A" : undefined)}
            showDrive={!!(userLocation || locationDenied)}
          />
        )}
      </Map>
    </div>
  );
}
