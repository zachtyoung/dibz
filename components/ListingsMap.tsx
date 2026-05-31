"use client";
import { useEffect, useState } from "react";
import type { Listing } from "@/lib/listings";

export function ListingsMap({
  listings,
  center,
  zoom = 13,
  height = "100%",
}: {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resolvedCenter = center ?? [37.7699, -122.4304] as [number, number];

  if (!mounted) return <div className="grid h-full min-h-[320px] place-items-center text-muted-foreground">Loading map…</div>;

  return <MapInner listings={listings} center={resolvedCenter} userCenter={center} zoom={zoom} height={height} />;
}

function MapInner({ listings, center, userCenter, zoom, height }: {
  listings: Listing[];
  center: [number, number];
  userCenter?: [number, number];
  zoom: number;
  height: string;
}) {
  const [Comps, setComps] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      setComps({ ...rl, L: L.default });
    });
  }, []);

  if (!Comps) return <div className="grid h-full min-h-[320px] place-items-center text-muted-foreground">Loading map…</div>;

  const { MapContainer, TileLayer, Marker, Popup, L } = Comps;

  const pinIcon = (sale: boolean) =>
    L.divIcon({
      className: "",
      html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${sale ? "#73ffb8" : "#2dd4a8"};border:2px solid #0d1b2a;box-shadow:0 4px 12px rgba(45,212,168,.6);display:grid;place-items:center;"><span style="transform:rotate(45deg);font-weight:900;color:#0d1b2a;font-size:14px;font-family:'Bebas Neue',sans-serif">${sale ? "★" : "$"}</span></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -32],
    });

  const youIcon = L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.35),0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height, width: "100%", borderRadius: "inherit" }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {userCenter && (
        <Marker position={userCenter} icon={youIcon}>
          <Popup>
            <div style={{ fontWeight: 700, fontSize: 13 }}>You are here</div>
          </Popup>
        </Marker>
      )}
      {listings.map((l: Listing) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={pinIcon(!!l.isGarageSale)}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <img src={l.image} alt={l.title} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14 }}>{l.title}</div>
              <div style={{ marginTop: 4, color: "#2dd4a8", fontWeight: 800 }}>{l.isGarageSale ? "Garage Sale" : `$${l.price}`}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.location} · {l.distance}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
