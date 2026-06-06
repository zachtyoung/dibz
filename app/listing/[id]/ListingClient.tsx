"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, AdvancedMarker, Polygon } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LISTINGS, timeAgo, type Listing } from "@/lib/listings";
import { SellerTrustPanel, StarRating } from "@/components/SellerBadges";
import { PickupPhotoPanel } from "@/components/PickupPhotoPanel";
import {
  ArrowLeft, Calendar, Check, Clock, Heart, MapPin,
  Plus, Send, Share2, Shield, Tag, Users, Eye,
  ChevronRight,
} from "lucide-react";

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const TEAL  = "oklch(0.48 0.13 178)";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";
const FAVS_KEY = "dibz-favorites";
const ROUTE_KEY = "dibz-route";

export function ListingClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { id } = listing;

  const [saved, setSaved] = useState(false);
  const [inRoute, setInRoute] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [draft, setDraft] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]");
      setSaved(favs.includes(id));
      const route: string[] = JSON.parse(localStorage.getItem(ROUTE_KEY) ?? "[]");
      setInRoute(route.includes(id));
    } catch {}
  }, [id]);

  function toggleSave() {
    setSaved((prev) => {
      const next = !prev;
      try {
        const favs: string[] = JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]");
        localStorage.setItem(FAVS_KEY, JSON.stringify(next ? [...favs, id] : favs.filter((f) => f !== id)));
      } catch {}
      return next;
    });
  }

  function toggleRoute() {
    setInRoute((prev) => {
      const next = !prev;
      try {
        const route: string[] = JSON.parse(localStorage.getItem(ROUTE_KEY) ?? "[]");
        localStorage.setItem(ROUTE_KEY, JSON.stringify(next ? [...route, id] : route.filter((r) => r !== id)));
      } catch {}
      return next;
    });
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessageSent(true);
    setDraft("");
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareLabel("Copied!");
      setTimeout(() => setShareLabel("Share"), 2000);
    }
  }

  const isBlock = listing.isGarageSale;
  const isEstate = listing.saleType === "estate";

  const related = LISTINGS.filter((l) => l.id !== id && l.category === listing.category).slice(0, 4);
  const fallback = LISTINGS.filter((l) => l.id !== id && !related.find((r) => r.id === l.id)).slice(0, 4 - related.length);
  const relatedFinal = [...related, ...fallback].slice(0, 4);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 pt-4" style={{ borderBottom: `1px solid ${INK}`, paddingBottom: 8, opacity: 0.6 }}>
        <div className="flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: INK }}>
          <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: INK, fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link href="/browse" style={{ textDecoration: "none", color: INK }}>Browse</Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ opacity: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{listing.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:grid-flow-row grid-flow-dense">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Image */}
            <div style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" style={{ filter: "saturate(0.85) contrast(1.05)" }} />
                {isBlock && (
                  <div style={{ position: "absolute", left: 12, top: 12, background: isEstate ? "#b7791f" : INK, color: CREAM, padding: "3px 10px", fontFamily: SANS, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>
                    {isEstate ? "Estate Sale" : "Garage Sale"}
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", alignItems: "center", gap: 5, background: "rgba(245,240,232,0.9)", padding: "3px 8px", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: INK, border: `1px solid ${INK}` }}>
                  <Eye className="h-3 w-3" /> 248 views
                </div>
              </div>
            </div>

            {/* Title block */}
            <div className="mt-5 pb-5" style={{ borderBottom: `2px solid ${INK}` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.75rem,4vw,3rem)", lineHeight: 1.05, letterSpacing: "-0.02em", color: INK }}>
                    {listing.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {listing.condition && (
                      <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: `1.5px solid ${INK}`, padding: "1px 6px", color: INK, opacity: 0.6 }}>{listing.condition}</span>
                    )}
                    <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: `1.5px solid ${INK}`, padding: "1px 6px", color: INK, opacity: 0.6 }}>{listing.category}</span>
                    {listing.postedHoursAgo != null && (
                      <span style={{ fontFamily: MONO, fontSize: 9, opacity: 0.45, color: INK }}>{timeAgo(listing.postedHoursAgo)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={share} title={shareLabel}
                    style={{ width: 36, height: 36, display: "grid", placeItems: "center", background: "transparent", border: `2px solid ${INK}`, cursor: "pointer", color: INK }}>
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button onClick={toggleSave}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, cursor: "pointer", border: `2px solid ${INK}`, background: saved ? INK : "transparent", color: saved ? CREAM : INK, boxShadow: saved ? `2px 2px 0 ${RED}` : undefined }}>
                    <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, opacity: 0.65, display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: TEAL }} />
                  {listing.location}{listing.distance ? ` · ${listing.distance}` : ""}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, opacity: 0.65, display: "flex", alignItems: "center", gap: 5 }}>
                  <Users className="h-3.5 w-3.5" style={{ color: TEAL }} />
                  {listing.seller}
                </span>
                {listing.date && (
                  <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: isEstate ? "#b7791f" : TEAL, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar className="h-3.5 w-3.5" />
                    {listing.date}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 pb-5" style={{ borderBottom: `1px dotted ${INK}` }}>
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED, marginBottom: 8 }}>§ About this listing</p>
              <p style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 15, lineHeight: 1.75, color: INK }}>
                {listing.description ?? "No description provided. Message the seller for details."}
              </p>
            </div>

            {/* Seller */}
            <div className="mt-5">
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED, marginBottom: 12 }}>§ About the seller</p>
              {listing.sellerTrust ? (
                <div className="px-5 py-5" style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>
                  <SellerTrustPanel trust={listing.sellerTrust} sellerName={listing.seller} />
                </div>
              ) : (
                <div className="flex items-center gap-4 px-5 py-4" style={{ border: `2px solid ${INK}` }}>
                  <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", background: "transparent", border: `2px solid ${INK}`, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: INK, flexShrink: 0 }}>
                    {listing.seller.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: INK }}>{listing.seller}</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, opacity: 0.5, color: INK, marginTop: 2 }}>New seller</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-3 lg:sticky lg:top-4 lg:self-start lg:order-last order-first">

            {/* Price + CTA */}
            <div style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
              <div style={{ padding: "16px 20px", borderBottom: `2px solid ${INK}` }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1, color: isEstate ? "#b7791f" : isBlock ? TEAL : INK }}>
                    {isBlock ? "Free" : `$${listing.price.toLocaleString()}`}
                  </span>
                  {!isBlock && (
                    <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: `1.5px solid ${INK}`, padding: "2px 6px", color: INK, opacity: 0.6 }}>OBO</span>
                  )}
                </div>
                <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, color: INK, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin className="h-3 w-3" style={{ color: TEAL }} /> {listing.location}{listing.distance ? ` · ${listing.distance} away` : ""}
                </p>
              </div>

              <div style={{ padding: "14px 20px" }}>
                {isBlock ? (
                  <button onClick={toggleRoute}
                    style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, cursor: "pointer", border: `2px solid ${INK}`, background: inRoute ? INK : "transparent", color: inRoute ? CREAM : INK, boxShadow: inRoute ? `2px 2px 0 ${TEAL}` : undefined }}>
                    {inRoute ? <><Check className="h-4 w-4" /> On your route — remove</> : <><Plus className="h-4 w-4" /> Add to my route</>}
                  </button>
                ) : messageSent ? (
                  <div style={{ padding: "16px", textAlign: "center", border: `2px solid ${INK}`, background: "rgba(0,0,0,0.03)" }}>
                    <Check style={{ display: "block", margin: "0 auto 6px", color: TEAL }} className="h-5 w-5" />
                    <p style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: TEAL }}>Message sent!</p>
                    <p style={{ fontFamily: MONO, fontSize: 9, opacity: 0.5, color: INK, marginTop: 4 }}>You'll hear back soon.</p>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      id="msg-form" value={draft} onChange={(e) => setDraft(e.target.value)}
                      rows={3} maxLength={500}
                      placeholder={`Hi ${listing.seller.split(" ")[0]}, is this still available?`}
                      className="w-full resize-none focus:outline-none"
                      style={{ border: `2px solid ${INK}`, padding: "10px 12px", fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 13, color: INK, background: "transparent" }}
                    />
                    <button type="submit" disabled={!draft.trim()}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, cursor: "pointer", border: `2px solid ${INK}`, background: INK, color: CREAM, boxShadow: `2px 2px 0 ${TEAL}`, opacity: draft.trim() ? 1 : 0.4 }}>
                      <Send className="h-4 w-4" /> Send message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Map */}
            <div style={{ border: `2px solid ${INK}` }}>
              <div className="relative overflow-hidden" style={{ height: 160 }}>
                <MiniMap lat={listing.lat} lng={listing.lng} neighborhood={listing.location} />
              </div>
              <div style={{ borderTop: `2px solid ${INK}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: TEAL }} />
                <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.65, color: INK, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.location}</span>
                <a href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, textDecoration: "none", whiteSpace: "nowrap", fontWeight: 700 }}>
                  Directions →
                </a>
              </div>
            </div>

            {/* Pickup photo panel */}
            <PickupPhotoPanel lat={listing.lat} lng={listing.lng} isExactLocation={!!listing.isGarageSale} photos={listing.pickupPhotos} />

            {/* Safety tip */}
            <div style={{ border: `2px solid ${INK}`, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: INK, opacity: 0.4 }} />
              <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, color: INK, lineHeight: 1.6 }}>Meet in a public place. Never send payment before seeing the item in person.</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedFinal.length > 0 && (
          <section className="mt-12" style={{ borderTop: `2px solid ${INK}`, paddingTop: "1.5rem" }}>
            <div className="mb-4 flex items-baseline justify-between pb-2" style={{ borderBottom: `1px solid ${INK}` }}>
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED }}>§ More Nearby</p>
              <Link href="/browse" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: INK, textDecoration: "none", opacity: 0.5 }}>See all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ background: INK }}>
              {relatedFinal.map((l) => (
                <Link key={l.id} href={`/listing/${l.id}`} style={{ textDecoration: "none", display: "block", background: "var(--background)" }} className="group">
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
                    <img src={l.image} alt={l.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" style={{ filter: "saturate(0.8)" }} />
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: l.isGarageSale ? TEAL : INK }}>{l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}</p>
                    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, lineHeight: 1.3, color: INK, marginTop: 2 }} className="line-clamp-2">{l.title}</p>
                    <p style={{ fontFamily: MONO, fontSize: 8, opacity: 0.45, color: INK, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.distance}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="mt-12 py-6 px-6" style={{ borderTop: `2px solid ${INK}` }}>
        <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.4, color: INK }}>
          Dibz Press · Free to list, sell local.
        </p>
      </footer>
    </div>
  );
}

function NeighborhoodPolygon({ neighborhood }: { neighborhood: string }) {
  const [paths, setPaths] = useState<{ lat: number; lng: number }[][]>([]);

  useEffect(() => {
    fetch("/wichita-neighborhoods.geojson")
      .then((r) => r.json())
      .then((data) => {
        const match = data.features.find(
          (f: { properties: { NAME: string } }) =>
            f.properties.NAME.toLowerCase() === neighborhood.toLowerCase()
        );
        if (!match) return;
        const geom = match.geometry;
        const rings = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
        setPaths(
          rings.flat().map((ring: number[][]) =>
            ring.map(([lng, lat]: number[]) => ({ lat, lng }))
          )
        );
      })
      .catch(() => {});
  }, [neighborhood]);

  if (!paths.length) return null;
  return (
    <>
      {paths.map((path, i) => (
        <Polygon
          key={i}
          paths={path}
          fillColor="#2dd4a8"
          fillOpacity={0.15}
          strokeColor="#0f6b55"
          strokeOpacity={0.7}
          strokeWeight={2}
        />
      ))}
    </>
  );
}

function MiniMap({ lat, lng, neighborhood }: { lat: number; lng: number; neighborhood: string }) {
  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      mapId="18620e62c3fd6cbf63eb5904"
      defaultCenter={{ lat, lng }}
      defaultZoom={13}
      disableDefaultUI
      gestureHandling="none"
      draggable={false}
    >
      <NeighborhoodPolygon neighborhood={neighborhood} />
      <AdvancedMarker position={{ lat, lng }}>
        <svg width="36" height="34" viewBox="0 0 36 34" style={{ filter: "drop-shadow(2px 2px 0 oklch(0.14 0.02 240))", display: "block" }}>
          <rect x="22" y="1" width="5" height="7" rx="1" fill="#2dd4a8" stroke="oklch(0.14 0.02 240)" strokeWidth="1.5" />
          <polygon points="2,17 18,3 34,17" fill="#1fa88a" stroke="oklch(0.14 0.02 240)" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="5" y="16" width="26" height="17" fill="#2dd4a8" stroke="oklch(0.14 0.02 240)" strokeWidth="1.5" />
          <rect x="14" y="24" width="8" height="9" rx="1" fill="oklch(0.14 0.02 240)" opacity="0.55" />
          <circle cx="21" cy="28.5" r="1" fill="oklch(0.14 0.02 240)" opacity="0.8" />
        </svg>
      </AdvancedMarker>
    </Map>
  );
}

const MINI_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",           stylers: [{ color: "#f5efe0" }] },
  { elementType: "labels.text.fill",   stylers: [{ color: "#3d3520" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5efe0" }] },
  { featureType: "road",               elementType: "geometry",        stylers: [{ color: "#e8dfc8" }] },
  { featureType: "road.highway",       elementType: "geometry",        stylers: [{ color: "#d4c89a" }] },
  { featureType: "water",              elementType: "geometry",        stylers: [{ color: "#c5d8d1" }] },
  { featureType: "poi",                elementType: "labels",          stylers: [{ visibility: "off" }] },
  { featureType: "transit",            stylers: [{ visibility: "off" }] },
];
