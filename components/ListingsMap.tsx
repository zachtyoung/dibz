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

function ListingPopup({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const INK = "oklch(0.14 0.02 240)";
  return (
    <InfoWindow
      position={{ lat: listing.lat, lng: listing.lng }}
      onCloseClick={onClose}
      pixelOffset={[0, listing.isGarageSale ? -42 : -46]}
    >
      <Link href={`/listing/${listing.id}`} style={{ display: "block", width: 160, textDecoration: "none" }}>
        <img
          src={listing.image}
          alt={listing.title}
          style={{ width: "100%", height: 90, objectFit: "cover", border: `2px solid ${INK}`, display: "block" }}
        />
        <div style={{ padding: "6px 0 2px" }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: "oklch(0.14 0.02 240)", lineHeight: 1.3 }}>
            {listing.title}
          </div>
          <div style={{ marginTop: 3, fontFamily: "Bebas Neue, Impact, sans-serif", fontSize: 16, color: "#0f6b55" }}>
            {listing.isGarageSale
              ? (listing.saleType === "estate" ? "Estate Sale" : "Garage Sale")
              : `$${listing.price.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
            {listing.location} · {listing.distance}
          </div>
          {listing.condition && (
            <div style={{
              display: "inline-block", marginTop: 3, padding: "1px 5px",
              border: `1.5px solid ${INK}`, fontSize: 9, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280",
            }}>
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
}: {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedId?: string | null;
  onSelectId?: (id: string | null) => void;
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
          />
        )}
      </Map>
    </div>
  );
}
