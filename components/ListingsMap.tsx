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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      setComps({ ...rl, L: L.default });
    });
  }, []);

  if (!Comps) return <div className="grid h-full min-h-[320px] place-items-center text-muted-foreground">Loading map…</div>;

  const { MapContainer, TileLayer, Marker, Popup, L, useMapEvents } = Comps;

  function MapClickClear() {
    useMapEvents({ click: () => setSelectedId(null) });
    return null;
  }

  const pinIcon = (sale: boolean, saleType: string | undefined, selected: boolean) => {
    const opacity = selected ? "1" : "0.75";

    if (!sale) {
      return L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#1a9e82;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);opacity:${opacity};"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -8],
      });
    }

    const isEstate = saleType === "estate";
    const pinBg = isEstate ? "#ffffff" : "#1a9e82";
    const scale = selected ? "scale(1.15)" : "scale(1)";
    const innerContent = isEstate
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a9e82" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`
      : `<span style="font-size:15px;font-weight:900;color:#0f3d31;font-family:sans-serif;line-height:1;">$</span>`;

    return L.divIcon({
      className: "",
      html: `
        <div style="position:relative;width:36px;height:44px;opacity:${opacity};transform:${scale};transform-origin:bottom center;transition:transform 0.15s,opacity 0.15s;">
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:${pinBg};
            box-shadow:0 4px 16px rgba(0,0,0,0.55), 0 0 0 2px rgba(45,212,168,0.3);
            display:grid;place-items:center;
          ">
            <div style="transform:rotate(45deg);display:grid;place-items:center;">
              ${innerContent}
            </div>
          </div>
          <div style="
            position:absolute;bottom:0;left:50%;transform:translateX(-50%);
            width:6px;height:6px;border-radius:50%;
            background:#1a9e82;
            box-shadow:0 2px 4px rgba(0,0,0,0.4);
          "></div>
        </div>`,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -46],
    });
  };

  const youIcon = L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.35),0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height, width: "100%", borderRadius: "inherit" }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickClear />
      {userCenter && (
        <Marker position={userCenter} icon={youIcon}>
          <Popup>
            <div style={{ fontWeight: 700, fontSize: 13 }}>You are here</div>
          </Popup>
        </Marker>
      )}
      {listings.map((l: Listing) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={pinIcon(!!l.isGarageSale, l.saleType, selectedId === l.id)}
          eventHandlers={{ click: () => setSelectedId(l.id) }}
        >
          <Popup onClose={() => setSelectedId(null)}>
            <div style={{ minWidth: 180 }}>
              <img src={l.image} alt={l.title} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 14 }}>{l.title}</div>
              <div style={{ marginTop: 4, color: "#1a9e82", fontWeight: 800 }}>
                {l.isGarageSale ? (l.saleType === "estate" ? "Estate Sale" : "Garage Sale") : `$${l.price}`}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.location} · {l.distance}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
