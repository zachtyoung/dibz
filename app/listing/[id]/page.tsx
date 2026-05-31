"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LISTINGS, timeAgo } from "@/lib/listings";
import {
  ArrowLeft, Calendar, Car, Check, Clock, Heart, MapPin,
  MessageCircle, Plus, Send, Share2, Shield, Tag, Users, Eye,
  Zap, Star, ChevronRight,
} from "lucide-react";

const INK = "oklch(0.14 0.02 240)";
const FAVS_KEY = "dibz-favorites";
const ROUTE_KEY = "dibz-route";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const listing = LISTINGS.find((l) => l.id === id);

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
      await navigator.share({ title: listing?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareLabel("Copied!");
      setTimeout(() => setShareLabel("Share"), 2000);
    }
  }

  if (!listing) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="font-display text-6xl text-muted-foreground">404</p>
          <p className="mt-3 text-muted-foreground">This listing may have been removed.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const isBlock = listing.isGarageSale;
  const isEstate = listing.saleType === "estate";

  const related = LISTINGS.filter(
    (l) => l.id !== id && l.category === listing.category
  ).slice(0, 4);
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
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
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
                    <span
                      className="px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                      style={{ border: `2px solid ${INK}` }}
                    >
                      {listing.category}
                    </span>
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

              {/* Meta row */}
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

            {/* Details grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Shield, label: "Free to list", sub: "No fees, ever" },
                { icon: Tag, label: "Local pickup", sub: "Meet nearby" },
                { icon: Car, label: "Negotiable", sub: "Message to offer" },
                { icon: Zap, label: "Fast replies", sub: "Usually within 1h" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 bg-card px-3 py-4 text-center"
                  style={{ border: `2px solid ${INK}` }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Seller reputation strip */}
            <div
              className="mt-6 flex items-center gap-4 bg-card px-5 py-4"
              style={{ border: `2px solid ${INK}` }}
            >
              <div
                className="grid h-14 w-14 shrink-0 place-items-center bg-primary/15 font-display text-2xl text-primary"
                style={{ border: `2px solid ${INK}` }}
              >
                {listing.seller.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{listing.seller}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /> 4.9 · 38 sales</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Replies in &lt;1h</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-primary" /> Verified member</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">

            {/* Price callout */}
            <div
              className="bg-card px-5 py-4"
              style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-display text-5xl tracking-wide ${isEstate ? "text-amber-600" : "text-primary"}`}>
                  {isBlock ? "FREE" : `$${listing.price.toLocaleString()}`}
                </span>
                {!isBlock && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10"
                    style={{ border: `1.5px solid ${INK}` }}
                  >
                    OBO
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> {listing.location} · {listing.distance} away
              </p>

              {/* Route CTA for sales */}
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
                  <MessageCircle className="h-4 w-4" />
                  Message seller
                </button>
              )}
            </div>

            {/* Message form */}
            <div
              className="bg-card px-5 py-5"
              style={{ border: `2px solid ${INK}` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center bg-primary/15 font-display text-xl text-primary"
                  style={{ border: `2px solid ${INK}` }}
                >
                  {listing.seller.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{listing.seller}</p>
                  <p className="text-[11px] text-muted-foreground">Usually replies in &lt;1h</p>
                </div>
              </div>

              {messageSent ? (
                <div
                  className="bg-primary/10 px-4 py-4 text-center"
                  style={{ border: `2px solid ${INK}` }}
                >
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
                    <Send className="h-4 w-4" />
                    Send message
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div style={{ border: `2px solid ${INK}` }}>
              <div className="relative h-44 bg-muted overflow-hidden">
                <MiniMap lat={listing.lat} lng={listing.lng} />
              </div>
              <div
                className="flex items-center gap-2 bg-card px-4 py-3 text-sm"
                style={{ borderTop: `2px solid ${INK}` }}
              >
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

            {/* Safety tip */}
            <div
              className="flex gap-3 bg-surface px-4 py-3 text-xs text-muted-foreground"
              style={{ border: `2px solid ${INK}` }}
            >
              <Shield className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>Meet in a public place. Never send payment before seeing the item in person.</span>
            </div>
          </div>
        </div>

        {/* Related listings */}
        {relatedFinal.length > 0 && (
          <section className="mt-14" style={{ borderTop: `2px solid ${INK}`, paddingTop: "2rem" }}>
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-3xl tracking-wide">More nearby</h2>
              <Link href="/" className="text-xs font-semibold text-primary hover:underline">
                See all →
              </Link>
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
                    <p className={`font-display text-xl ${l.isGarageSale ? "text-primary" : "text-primary"}`}>
                      {l.isGarageSale ? "FREE" : `$${l.price.toLocaleString()}`}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-foreground">{l.title}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{l.distance}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer
        className="mt-14 py-8 text-center text-sm text-muted-foreground"
        style={{ borderTop: `2px solid ${INK}` }}
      >
        Built for neighbors. <span className="text-primary font-semibold">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const [Comps, setComps] = useState<any>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, L]) => {
      setComps({ ...rl, L: L.default });
    });
  }, []);

  if (!Comps) return <div className="grid h-full place-items-center text-xs text-muted-foreground">Loading map…</div>;

  const { MapContainer, TileLayer, Marker } = Comps;
  const { L } = Comps;

  const pin = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:oklch(0.52 0.14 178);border:3px solid oklch(0.14 0.02 240);box-shadow:2px 2px 0 oklch(0.14 0.02 240);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={pin} />
    </MapContainer>
  );
}
