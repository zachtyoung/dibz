"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, AdvancedMarker, Circle } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LISTINGS, timeAgo, type Listing } from "@/lib/listings";
import { SellerTrustPanel, StarRating } from "@/components/SellerBadges";
import { PickupPhotoPanel } from "@/components/PickupPhotoPanel";
import {
  ArrowLeft, Calendar, Car, Check, Clock, Heart, MapPin,
  MessageCircle, Plus, Send, Share2, Shield, Tag, Users, Eye,
  Zap, ChevronRight,
} from "lucide-react";

const INK = "oklch(0.14 0.02 240)";
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
      <div className="mx-auto max-w-7xl px-4 pt-5 md:px-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 hover:text-foreground transition">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <span>/</span>
          <Link href="/" className="hover:text-foreground transition">Browse</Link>
          <span>/</span>
          <span className="truncate max-w-[200px] text-foreground font-medium">{listing.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Image */}
            <div style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                {isBlock && (
                  <span
                    className={`absolute left-4 top-4 px-3 py-1 font-display text-sm tracking-widest ${
                      isEstate ? "bg-amber-400 text-amber-950" : "bg-primary text-primary-foreground"
                    }`}
                    style={{ border: `1.5px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
                  >
                    {isEstate ? "ESTATE SALE" : "GARAGE SALE"}
                  </span>
                )}
                <span
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-background/90 px-2.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm"
                  style={{ border: `1.5px solid ${INK}` }}
                >
                  <Eye className="h-3.5 w-3.5" /> 248 views
                </span>
              </div>
            </div>

            {/* Title block */}
            <div className="mt-6" style={{ borderBottom: `2px solid ${INK}`, paddingBottom: "1.25rem" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-4xl leading-tight tracking-wide md:text-5xl">
                    {listing.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={`font-display text-4xl ${isEstate ? "text-amber-600" : "text-primary"}`}>
                      {isBlock ? "FREE ENTRY" : `$${listing.price.toLocaleString()}`}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold text-muted-foreground" style={{ border: `2px solid ${INK}` }}>
                      {listing.category}
                    </span>
                    {listing.condition && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-muted-foreground" style={{ border: `2px solid ${INK}` }}>
                        {listing.condition}
                      </span>
                    )}
                    {listing.postedHoursAgo != null && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {timeAgo(listing.postedHoursAgo)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={share}
                    className="grid h-10 w-10 place-items-center text-muted-foreground transition hover:text-foreground hover:bg-surface"
                    style={{ border: `2px solid ${INK}` }}
                    title={shareLabel}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleSave}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                      saved ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ border: `2px solid ${INK}`, boxShadow: saved ? `2px 2px 0 ${INK}` : undefined }}
                  >
                    <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {listing.location} · <strong className="text-foreground">{listing.distance}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  Sold by <strong className="text-foreground">{listing.seller}</strong>
                </span>
                {listing.date && (
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${isEstate ? "text-amber-600" : "text-primary"}`}>
                    <Calendar className="h-4 w-4 shrink-0" />
                    {listing.date}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="font-display text-2xl tracking-wide">About this listing</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {listing.description ?? "No description provided. Message the seller for details."}
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Shield, label: "Free to list", sub: "No fees, ever" },
                { icon: Tag, label: "Local pickup", sub: "Meet nearby" },
                { icon: Car, label: "Negotiable", sub: "Message to offer" },
                { icon: Zap, label: "Fast replies", sub: "Usually within 1h" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-card px-3 py-4 text-center" style={{ border: `2px solid ${INK}` }}>
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Seller trust panel */}
            {listing.sellerTrust ? (
              <div className="mt-6 bg-card px-5 py-5" style={{ border: `2px solid ${INK}` }}>
                <h2 className="mb-4 font-display text-xl tracking-wide">About the seller</h2>
                <SellerTrustPanel trust={listing.sellerTrust} sellerName={listing.seller} />
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-4 bg-card px-5 py-4" style={{ border: `2px solid ${INK}` }}>
                <div className="grid h-14 w-14 shrink-0 place-items-center bg-primary/15 font-display text-2xl text-primary" style={{ border: `2px solid ${INK}` }}>
                  {listing.seller.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{listing.seller}</p>
                  <p className="text-xs text-muted-foreground">New seller</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            {/* Price callout */}
            <div className="bg-card px-5 py-4" style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-display text-5xl tracking-wide ${isEstate ? "text-amber-600" : "text-primary"}`}>
                  {isBlock ? "FREE" : `$${listing.price.toLocaleString()}`}
                </span>
                {!isBlock && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10" style={{ border: `1.5px solid ${INK}` }}>
                    OBO
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> {listing.location} · {listing.distance} away
              </p>

              {isBlock ? (
                <button
                  onClick={toggleRoute}
                  className={`mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold transition ${
                    inRoute ? "bg-primary text-primary-foreground" : "bg-surface text-foreground hover:bg-primary/10"
                  }`}
                  style={{ border: `2px solid ${INK}`, boxShadow: inRoute ? `2px 2px 0 ${INK}` : undefined }}
                >
                  {inRoute ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inRoute ? "On your route — tap to remove" : "Add to my route"}
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById("msg-form")?.focus()}
                  className="mt-4 flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:-translate-x-px hover:-translate-y-px"
                  style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
                >
                  <MessageCircle className="h-4 w-4" /> Message seller
                </button>
              )}
            </div>

            {/* Message form */}
            <div className="bg-card px-5 py-5" style={{ border: `2px solid ${INK}` }}>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center bg-primary/15 font-display text-xl text-primary" style={{ border: `2px solid ${INK}` }}>
                  {listing.seller.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{listing.seller}</p>
                  {listing.sellerTrust ? (
                    <StarRating rating={listing.sellerTrust.rating} sales={listing.sellerTrust.sales} />
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Usually replies in &lt;1h</p>
                  )}
                </div>
              </div>

              {messageSent ? (
                <div className="bg-primary/10 px-4 py-4 text-center" style={{ border: `2px solid ${INK}` }}>
                  <Check className="mx-auto mb-1.5 h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-primary">Message sent!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">You'll hear back soon.</p>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="space-y-3">
                  <textarea
                    id="msg-form"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder={`Hi ${listing.seller.split(" ")[0]}, is this still available?`}
                    className="w-full resize-none bg-surface px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ border: `2px solid ${INK}` }}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:-translate-x-px hover:-translate-y-px disabled:opacity-40"
                    style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
                  >
                    <Send className="h-4 w-4" /> Send message
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div style={{ border: `2px solid ${INK}` }}>
              <div className="relative h-44 bg-muted overflow-hidden">
                <MiniMap lat={listing.lat} lng={listing.lng} />
              </div>
              <div className="flex items-center gap-2 bg-card px-4 py-3 text-sm" style={{ borderTop: `2px solid ${INK}` }}>
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground text-xs truncate">{listing.location}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto whitespace-nowrap text-xs font-bold text-primary hover:underline"
                >
                  Directions →
                </a>
              </div>
            </div>

            {/* Pickup photo panel */}
            <PickupPhotoPanel
              lat={listing.lat}
              lng={listing.lng}
              isExactLocation={!!listing.isGarageSale}
              photos={listing.pickupPhotos}
            />

            {/* Safety tip */}
            <div className="flex gap-3 bg-surface px-4 py-3 text-xs text-muted-foreground" style={{ border: `2px solid ${INK}` }}>
              <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>Meet in a public place. Never send payment before seeing the item in person.</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedFinal.length > 0 && (
          <section className="mt-14" style={{ borderTop: `2px solid ${INK}`, paddingTop: "2rem" }}>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-3xl tracking-wide">More nearby</h2>
              <Link href="/" className="text-xs font-semibold text-primary hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedFinal.map((l) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="group flex flex-col overflow-hidden bg-card transition hover:-translate-x-px hover:-translate-y-px"
                  style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img src={l.image} alt={l.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <p className="font-display text-xl text-primary">{l.isGarageSale ? "FREE" : `$${l.price.toLocaleString()}`}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-foreground">{l.title}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{l.distance}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="mt-14 py-8 text-center text-sm text-muted-foreground" style={{ borderTop: `2px solid ${INK}` }}>
        Built for neighbors. <span className="text-primary font-semibold">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <Map
        style={{ width: "100%", height: "100%" }}
        mapId="18620e62c3fd6cbf63eb5904"
        defaultCenter={{ lat, lng }}
        defaultZoom={14}
        disableDefaultUI
        gestureHandling="none"
        draggable={false}
      >
        <Circle
          center={{ lat, lng }}
          radius={400}
          fillColor="#2dd4a8"
          fillOpacity={0.15}
          strokeColor="#0f6b55"
          strokeOpacity={0.5}
          strokeWeight={1.5}
        />
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
    </APIProvider>
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
