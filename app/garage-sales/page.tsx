"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { getCityBySlug } from "@/lib/cities";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Check, Clock, Crosshair, Loader2,
  MapPin, Navigation, Plus, Route, Users, X, Car, Home,
} from "lucide-react";
import type { SaleType } from "@/lib/listings";
import type { RouteStep } from "@/components/RouteMap";
import type { Listing } from "@/lib/listings";

const RouteMap = dynamic(() => import("@/components/RouteMap").then((m) => m.RouteMap), { ssr: false });

const SF = getCityBySlug("san-francisco-ca")!;
const STORAGE_KEY = "dibz-route";
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

type StartLocation = { lat: number; lng: number; label: string };

function StartPrompt({ onConfirm, onSkip }: { onConfirm: (loc: StartLocation) => void; onSkip: () => void }) {
  const [input, setInput] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    function initAutocomplete() {
      if (!inputRef.current || autocompleteRef.current) return;
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, { types: ["geocode"] });
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current!.getPlace();
        if (place.geometry?.location) {
          onConfirm({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            label: place.formatted_address ?? place.name ?? input,
          });
        }
      });
    }

    if (typeof google !== "undefined" && google.maps?.places) { initAutocomplete(); return; }

    const existing = document.getElementById("gmaps-script");
    if (existing) { existing.addEventListener("load", initAutocomplete); return () => existing.removeEventListener("load", initAutocomplete); }

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);
  }, []);

  function useGeo() {
    setGeoError("");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let label = "Your location";
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${KEY}`);
          const data = await res.json();
          label = data.results?.[0]?.formatted_address ?? label;
        } catch {}
        setGeoLoading(false);
        onConfirm({ lat, lng, label });
      },
      () => { setGeoLoading(false); setGeoError("Location access denied — type your address below."); }
    );
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-card p-6 mx-4"
        style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
      >
        <div className="mb-1 flex items-center gap-2">
          <Route className="h-5 w-5 text-accent" />
          <h3 className="font-display text-xl tracking-wide">Where are you starting?</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">We'll calculate your total drive time and route from door to door.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={useGeo}
            disabled={geoLoading}
            className="flex items-center gap-3 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-60"
            style={{ border: "2px solid oklch(0.14 0.02 240)" }}
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            <span>Use my current location</span>
          </button>

          {geoError && <p className="text-xs text-red-400">{geoError}</p>}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your address…"
            className="w-full bg-surface px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ border: "2px solid oklch(0.14 0.02 240)" }}
          />

          <button onClick={onSkip} className="text-center text-xs text-muted-foreground hover:text-foreground transition">
            Skip — show route without start point
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GarageSales() {
  const router = useRouter();
  const { city } = useCityContext();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const sales = listings.filter((l) => l.isGarageSale);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

  const [route, setRoute] = useState<string[]>([]);
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [startLoc, setStartLoc] = useState<StartLocation | null>(null);
  const [askingStart, setAskingStart] = useState(false);
  const [returnHome, setReturnHome] = useState(true);
  const [saleFilter, setSaleFilter] = useState<SaleType | "all">("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRoute(JSON.parse(saved));
    } catch {}
  }, []);

  function toggleRoute(id: string) {
    setRoute((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function handleViewRoute() {
    setShowRoute(true);
    if (!startLoc) setAskingStart(true);
  }

  const filteredSales = saleFilter === "all" ? sales : sales.filter((s) => s.saleType === saleFilter);
  const routeSales = route.map((id) => sales.find((s) => s.id === id)).filter(Boolean) as typeof sales;

  const startAsListing: Listing | null = startLoc
    ? { id: "__start__", title: "Starting point", price: 0, category: "", location: startLoc.label, distance: "", seller: "", image: "", lat: startLoc.lat, lng: startLoc.lng }
    : null;
  const homeAsListing: Listing | null = startLoc && returnHome
    ? { id: "__home__", title: "Home", price: 0, category: "", location: startLoc.label, distance: "", seller: "", image: "", lat: startLoc.lat, lng: startLoc.lng }
    : null;
  const allStops: Listing[] = [
    ...(startAsListing ? [startAsListing] : []),
    ...routeSales,
    ...(homeAsListing ? [homeAsListing] : []),
  ];

  const totalSec = steps.reduce((acc, s) => acc + s.durationSec, 0);
  const totalMin = Math.round(totalSec / 60);
  const totalDistanceMi = steps.reduce((acc, s) => {
    const m = parseFloat(s.distanceText.replace(/[^\d.]/g, ""));
    return acc + (s.distanceText.includes("km") ? m * 0.621 : m);
  }, 0);

  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const totalTimeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="min-h-screen">
      <Header />

      <section style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}>
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
          <span
            className="inline-flex items-center gap-1.5 bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent"
            style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
          >
            <Calendar className="h-3 w-3" /> This weekend
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tight md:text-7xl">
            Garage &amp; estate sales,<br />
            <span className="text-accent">near you.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Free to post. Free to browse. Map your route, mark your stops, and go.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard?new=1")}
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:-translate-x-px hover:-translate-y-px"
              style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Post your sale
            </button>
            {routeSales.length > 0 && (
              <button
                onClick={handleViewRoute}
                className="inline-flex items-center gap-2 border-accent/50 bg-accent/10 px-5 py-3 font-semibold text-accent transition hover:bg-accent/20"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <Navigation className="h-4 w-4" /> View my route · {routeSales.length} stop{routeSales.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Route planner ── */}
      {showRoute && routeSales.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">

          {/* Trip summary bar */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl tracking-wide">Your route</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {startLoc ? `Starting from ${startLoc.label.split(",")[0]}` : "Add a start location for door-to-door directions"}
              </p>
            </div>
            <button
              onClick={() => setShowRoute(false)}
              className="p-2 hover:border-accent transition"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stats strip */}
          {totalMin > 0 && (
            <div
              className="mb-6 grid grid-cols-3 gap-3 bg-card p-4"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{totalTimeLabel}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">total drive time</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-2xl font-bold">{totalDistanceMi.toFixed(1)} mi</p>
                <p className="mt-0.5 text-xs text-muted-foreground">total distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{routeSales.length}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">stop{routeSales.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Map */}
            <div
              className="relative h-[500px] overflow-hidden lg:flex-1"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              {askingStart && (
                <StartPrompt
                  onConfirm={(loc) => { setStartLoc(loc); setAskingStart(false); }}
                  onSkip={() => setAskingStart(false)}
                />
              )}
              <RouteMap stops={allStops} onRouteReady={setSteps} startIsFirst={!!startLoc} />
            </div>

            {/* Timeline panel */}
            <div className="flex w-full flex-col lg:w-80">
              {/* Start location row */}
              <div className="mb-2">
                {startLoc && !askingStart ? (
                  <div
                    className="flex items-center gap-3 bg-indigo-500/10 p-3"
                    style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-indigo-500 text-white">
                      <Crosshair className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Your start</p>
                      <p className="truncate text-sm font-medium">{startLoc.label.split(",").slice(0, 2).join(",")}</p>
                    </div>
                    <button
                      onClick={() => { setStartLoc(null); setAskingStart(true); }}
                      className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                      title="Change start location"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : !askingStart ? (
                  <button
                    onClick={() => setAskingStart(true)}
                    className="flex w-full items-center gap-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition hover:border-accent hover:text-accent"
                    style={{ border: "2px dashed oklch(0.14 0.02 240)" }}
                  >
                    <Crosshair className="h-4 w-4" />
                    Add your start location for total drive time
                  </button>
                ) : null}
              </div>

              {/* Stop timeline */}
              <div className="flex flex-col">
                {routeSales.map((stop, i) => {
                  const legIdx = startLoc ? i : i - 1;
                  const leg = steps[legIdx];
                  return (
                    <div key={stop.id}>
                      {/* Drive connector */}
                      {(leg || i > 0) && (
                        <div className="flex items-center gap-2 py-2 pl-3">
                          <div className="flex flex-col items-center">
                            <div className="h-1 w-px bg-accent/20" />
                            <div className="h-4 w-px bg-accent/40" />
                            <div className="h-1 w-px bg-accent/20" />
                          </div>
                          {leg ? (
                            <div
                              className="flex items-center gap-1.5 bg-surface px-3 py-1 text-xs"
                              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                            >
                              <Car className="h-3 w-3 text-accent" />
                              <span className="font-semibold text-foreground">{leg.durationText}</span>
                              <span className="text-muted-foreground">· {leg.distanceText}</span>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">↓</div>
                          )}
                        </div>
                      )}

                      {/* Stop card */}
                      <div
                        className="bg-card p-3 transition hover:border-accent/40"
                        style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent text-sm font-bold text-white">
                            {i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-snug">{stop.title}</p>
                            {stop.date && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-accent">
                                <Calendar className="h-3 w-3" />
                                {stop.date}
                              </div>
                            )}
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {stop.location} · {stop.distance}
                            </p>
                            {stop.description && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{stop.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleRoute(stop.id)}
                            className="shrink-0 p-1 text-muted-foreground hover:text-red-400 transition"
                            title="Remove stop"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Return home */}
                {startLoc && (
                  <>
                    {/* Return leg connector */}
                    <div className="flex items-center gap-2 py-2 pl-3">
                      <div className="flex flex-col items-center">
                        <div className="h-1 w-px bg-accent/20" />
                        <div className="h-4 w-px bg-accent/40" />
                        <div className="h-1 w-px bg-accent/20" />
                      </div>
                      {returnHome && steps.length >= routeSales.length ? (
                        <div
                          className="flex items-center gap-1.5 bg-surface px-3 py-1 text-xs"
                          style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                        >
                          <Car className="h-3 w-3 text-accent" />
                          <span className="font-semibold text-foreground">{steps[steps.length - 1]?.durationText}</span>
                          <span className="text-muted-foreground">· {steps[steps.length - 1]?.distanceText}</span>
                        </div>
                      ) : (
                        <div className="h-px w-4 bg-border" />
                      )}
                    </div>

                    {/* Return home toggle card */}
                    <button
                      onClick={() => setReturnHome((v) => !v)}
                      className={`flex w-full items-center gap-3 p-3 text-left transition ${
                        returnHome
                          ? "bg-indigo-500/10"
                          : "hover:bg-indigo-500/5"
                      }`}
                      style={{
                        border: returnHome
                          ? "2px solid oklch(0.14 0.02 240)"
                          : "2px dashed oklch(0.14 0.02 240)",
                      }}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center text-white ${returnHome ? "bg-indigo-500" : "bg-border"}`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${returnHome ? "text-indigo-300" : "text-muted-foreground"}`}>
                          {returnHome ? "Return home" : "Add return home"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {startLoc.label.split(",").slice(0, 2).join(",")}
                        </p>
                      </div>
                      <div
                        className={`h-4 w-4 shrink-0 border-2 transition ${returnHome ? "border-indigo-400 bg-indigo-400" : "border-border"}`}
                      >
                        {returnHome && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/dir/${allStops.map((s) => `${s.lat},${s.lng}`).join("/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-accent py-3 text-sm font-bold text-white transition hover:-translate-x-px hover:-translate-y-px"
                  style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
                >
                  <Navigation className="h-4 w-4" />
                  Start navigation in Google Maps
                </a>
                {totalMin > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    ~{totalTimeLabel} driving · {totalDistanceMi.toFixed(1)} mi total
                    {returnHome && startLoc ? " · round trip" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Browsing map */}
      {!showRoute && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div
            className="h-[420px] overflow-hidden"
            style={{ border: "2px solid oklch(0.14 0.02 240)" }}
          >
            <ListingsMap listings={filteredSales} center={center} zoom={12} />
          </div>
        </section>
      )}

      {/* Sales grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-wide md:text-4xl">
              {filteredSales.length} {saleFilter === "estate" ? "estate" : saleFilter === "garage" ? "garage" : ""} sale{filteredSales.length !== 1 ? "s" : ""} in {activeCity.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {(["all", "garage", "estate"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSaleFilter(f)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition ${
                  saleFilter === f
                    ? f === "estate"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-accent/20 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  border: "2px solid oklch(0.14 0.02 240)",
                  boxShadow: saleFilter === f ? "3px 3px 0 oklch(0.14 0.02 240)" : undefined,
                }}
              >
                {f === "all" ? "All" : f === "garage" ? "Garage" : "Estate"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSales.map((s) => {
            const inRoute = route.includes(s.id);
            const stopNum = routeSales.findIndex((r) => r.id === s.id) + 1;
            return (
              <article
                key={s.id}
                className="group overflow-hidden bg-card transition hover:-translate-x-px hover:-translate-y-px"
                style={{
                  border: "2px solid oklch(0.14 0.02 240)",
                  boxShadow: inRoute ? "3px 3px 0 oklch(0.14 0.02 240)" : "3px 3px 0 oklch(0.14 0.02 240)",
                }}
              >
                <Link href={`/listing/${s.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  {inRoute && (
                    <div
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center bg-accent text-xs font-bold text-white"
                      style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                    >
                      {stopNum}
                    </div>
                  )}
                  {/* Type badge */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        s.saleType === "estate"
                          ? "bg-amber-500/90 text-amber-950"
                          : "bg-accent/90 text-accent-foreground"
                      }`}
                      style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "2px 2px 0 oklch(0.14 0.02 240)" }}
                    >
                      {s.saleType === "estate" ? "Estate" : "Garage"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${s.saleType === "estate" ? "text-amber-400" : "text-accent"}`}>
                      <Calendar className="h-3 w-3" /> {s.date}
                    </div>
                    <h3 className="mt-1 font-display text-2xl leading-tight tracking-wide">{s.title}</h3>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-accent" /> {s.location} · {s.distance}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {s.seller}
                    </span>
                  </div>
                </div>
                </Link>
                <div className="px-5 pb-5">
                  <button
                    onClick={() => toggleRoute(s.id)}
                    className={`w-full py-2 text-sm font-semibold transition ${
                      inRoute
                        ? "bg-accent/10 text-accent hover:bg-red-500/10 hover:text-red-400"
                        : s.saleType === "estate"
                          ? "bg-surface text-foreground hover:text-amber-400"
                          : "bg-surface text-foreground hover:text-accent"
                    }`}
                    style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                  >
                    {inRoute ? (
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> Stop #{stopNum} — tap to remove
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add to my route
                      </span>
                    )}
                  </button>
                </div>
              </article>

            );
          })}
        </div>
      </section>
    </div>
  );
}
