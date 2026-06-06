"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, distanceMi } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar, Check, Clock, Crosshair, Loader2,
  MapPin, Navigation, Plus, Route, Users, X, Car, Home,
} from "lucide-react";
import type { SaleType } from "@/lib/listings";
import type { RouteStep } from "@/components/RouteMap";
import type { Listing } from "@/lib/listings";
import { WeekStrip } from "@/components/WeekStrip";

const RouteMap = dynamic(() => import("@/components/RouteMap").then((m) => m.RouteMap), { ssr: false });

const STORAGE_KEY = "dibz-route";
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const TEAL  = "oklch(0.48 0.13 178)";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

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
    <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${CREAM}cc`, backdropFilter: "blur(4px)" }}>
      <div style={{ width: "100%", maxWidth: 380, background: CREAM, border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, padding: 24, margin: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Route style={{ width: 18, height: 18, color: RED }} />
          <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: INK, margin: 0 }}>Where are you starting?</h3>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 10, color: INK, marginBottom: 20, lineHeight: 1.5 }}>We'll calculate your total drive time and route from door to door.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={useGeo}
            disabled={geoLoading}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: `${TEAL}18`, border: `2px solid ${INK}`, cursor: "pointer", fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: INK, opacity: geoLoading ? 0.6 : 1 }}
          >
            {geoLoading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Crosshair style={{ width: 16, height: 16 }} />}
            <span>Use my current location</span>
          </button>

          {geoError && <p style={{ fontFamily: MONO, fontSize: 10, color: RED }}>{geoError}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: INK }}>
            <div style={{ height: 1, flex: 1, background: INK }} /> or <div style={{ height: 1, flex: 1, background: INK }} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your address…"
            style={{ width: "100%", background: "white", padding: "12px 16px", fontFamily: MONO, fontSize: 12, color: INK, border: `2px solid ${INK}`, outline: "none", boxSizing: "border-box" }}
          />

          <button onClick={onSkip} style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, background: "none", border: "none", cursor: "pointer", textAlign: "center", textDecoration: "underline" }}>
            Skip — show route without start point
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GarageSales() {
  const router = useRouter();
  const { city, loading } = useCityContext();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const listings = useMemo(() => {
    const base = city ? getListings(city) : [];
    if (!userLocation) return base;
    return base.map((l) => ({ ...l, distance: distanceMi(userLocation[0], userLocation[1], l.lat, l.lng) }));
  }, [city, userLocation]);
  const sales = listings.filter((l) => l.isGarageSale);
  const center: [number, number] | undefined = userLocation ?? (city ? [city.lat, city.lng] : undefined);

  const [route, setRoute] = useState<string[]>([]);
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [startLoc, setStartLoc] = useState<StartLocation | null>(null);
  const [askingStart, setAskingStart] = useState(false);
  const [returnHome, setReturnHome] = useState(true);
  const [saleFilter, setSaleFilter] = useState<SaleType | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRoute(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
    );
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

  const today = new Date().toISOString().slice(0, 10);
  const saleDates = [...new Set(sales.filter((s) => s.dateISO).map((s) => s.dateISO as string))];
  const filteredSales = sales.filter((s) => {
    if (saleFilter !== "all" && s.saleType !== saleFilter) return false;
    if (selectedDate) return s.dateISO === selectedDate;
    return !s.dateISO || s.dateISO >= today;
  });
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

      <section style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
          <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>▶ This Weekend</p>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2.5rem,6vw,5rem)", lineHeight: 0.9, letterSpacing: "-0.02em", color: INK, marginTop: 12 }}>
            Garage &amp; estate sales,<br />
            <span style={{ color: TEAL }}>near you.</span>
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: INK, marginTop: 16, maxWidth: 480 }}>
            Free to post. Free to browse. Map your route, mark your stops, and go.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard?new=1")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: INK, color: CREAM, padding: "11px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${RED}`, cursor: "pointer" }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Post your sale
            </button>
            {routeSales.length > 0 && (
              <button
                onClick={handleViewRoute}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: INK, padding: "11px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${TEAL}`, cursor: "pointer" }}
              >
                <Navigation className="h-4 w-4" /> View my route · {routeSales.length} stop{routeSales.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Calendar strip ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <WeekStrip saleDates={saleDates} selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      {/* ── Route planner ── */}
      {showRoute && routeSales.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">

          {/* Trip summary bar */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Route Planner</p>
              <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "2rem", lineHeight: 1, marginTop: 4, color: INK }}>Your route</h2>
              <p style={{ fontFamily: MONO, fontSize: 10, marginTop: 4, color: INK }}>
                {startLoc ? `Starting from ${startLoc.label.split(",")[0]}` : "Add a start location for door-to-door directions"}
              </p>
            </div>
            <button
              onClick={() => setShowRoute(false)}
              style={{ padding: 8, border: `2px solid ${INK}`, background: "transparent", cursor: "pointer", color: INK }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stats strip */}
          {totalMin > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-px" style={{ border: `2px solid ${INK}`, background: INK }}>
              {[
                { val: totalTimeLabel, label: "Drive time" },
                { val: `${totalDistanceMi.toFixed(1)} mi`, label: "Distance" },
                { val: String(routeSales.length), label: `Stop${routeSales.length !== 1 ? "s" : ""}` },
              ].map(({ val, label }) => (
                <div key={label} className="text-center" style={{ background: "var(--background)", padding: "16px 8px" }}>
                  <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "1.75rem", lineHeight: 1, color: INK }}>{val}</p>
                  <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4, color: INK }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Map */}
            <div
              className="relative h-[500px] overflow-hidden lg:flex-1"
              style={{ border: "2px solid oklch(0.16 0.01 60)" }}
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
                    className="flex items-center gap-3 p-3"
                    style={{ border: `2px solid ${INK}`, background: `${TEAL}12` }}
                  >
                    <div style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: TEAL, color: CREAM }}>
                      <Crosshair className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, color: TEAL }}>Your start</p>
                      <p style={{ fontFamily: MONO, fontSize: 11, color: INK, marginTop: 2 }}>{startLoc.label.split(",").slice(0, 2).join(",")}</p>
                    </div>
                    <button
                      onClick={() => { setStartLoc(null); setAskingStart(true); }}
                      style={{ flexShrink: 0, padding: 4, background: "none", border: "none", cursor: "pointer", color: INK }}
                      title="Change start location"
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ) : !askingStart ? (
                  <button
                    onClick={() => setAskingStart(true)}
                    style={{ display: "flex", width: "100%", alignItems: "center", gap: 8, padding: "12px 16px", border: `2px dashed ${INK}`, background: "transparent", cursor: "pointer", fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: INK }}
                  >
                    <Crosshair style={{ width: 14, height: 14 }} />
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 6px 12px" }}>
                          <div style={{ width: 1, height: 24, background: INK, flexShrink: 0 }} />
                          {leg ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${INK}`, padding: "3px 10px", fontFamily: MONO, fontSize: 10 }}>
                              <Car style={{ width: 11, height: 11, color: TEAL }} />
                              <span style={{ fontWeight: 700, color: INK }}>{leg.durationText}</span>
                              <span style={{ color: INK }}>· {leg.distanceText}</span>
                            </div>
                          ) : (
                            <span style={{ fontFamily: MONO, fontSize: 10, color: INK }}>↓</span>
                          )}
                        </div>
                      )}

                      {/* Stop card */}
                      <div style={{ padding: 12, border: `2px solid ${INK}`, background: "var(--background)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: INK, color: CREAM, fontFamily: SANS, fontSize: 11, fontWeight: 900 }}>
                            {i + 1}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, color: INK, lineHeight: 1.25 }}>{stop.title}</p>
                            {stop.date && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: TEAL, fontWeight: 700 }}>
                                <Calendar style={{ width: 10, height: 10 }} />
                                {stop.date}
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontFamily: MONO, fontSize: 10, color: INK }}>
                              <MapPin style={{ width: 10, height: 10, flexShrink: 0 }} />
                              {stop.location}{stop.distance ? ` · ${stop.distance}` : ""}
                            </div>
                            {stop.description && (
                              <p style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 12, lineHeight: 1.5, color: INK, marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stop.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleRoute(stop.id)}
                            style={{ flexShrink: 0, padding: 4, background: "none", border: "none", cursor: "pointer", color: INK }}
                            title="Remove stop"
                          >
                            <X style={{ width: 14, height: 14 }} />
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 6px 12px" }}>
                      <div style={{ width: 1, height: 24, background: INK, flexShrink: 0 }} />
                      {returnHome && steps.length >= routeSales.length ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${INK}`, padding: "3px 10px", fontFamily: MONO, fontSize: 10 }}>
                          <Car style={{ width: 11, height: 11, color: TEAL }} />
                          <span style={{ fontWeight: 700, color: INK }}>{steps[steps.length - 1]?.durationText}</span>
                          <span style={{ color: INK }}>· {steps[steps.length - 1]?.distanceText}</span>
                        </div>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 10, color: INK }}>↓</span>
                      )}
                    </div>

                    {/* Return home toggle card */}
                    <button
                      onClick={() => setReturnHome((v) => !v)}
                      style={{
                        display: "flex", width: "100%", alignItems: "center", gap: 12, padding: 12, textAlign: "left",
                        background: returnHome ? `${TEAL}12` : "transparent",
                        border: returnHome ? `2px solid ${INK}` : `2px dashed ${INK}`,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: returnHome ? TEAL : "transparent", border: `2px solid ${INK}`, color: returnHome ? CREAM : INK }}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: INK }}>
                          {returnHome ? "Return home" : "Add return home"}
                        </p>
                        <p style={{ fontFamily: MONO, fontSize: 10, color: INK, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {startLoc.label.split(",").slice(0, 2).join(",")}
                        </p>
                      </div>
                      <div style={{ width: 16, height: 16, flexShrink: 0, border: `2px solid ${INK}`, background: returnHome ? INK : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {returnHome && <Check className="h-2.5 w-2.5" style={{ color: CREAM }} strokeWidth={3} />}
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
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: INK, color: CREAM, padding: "12px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${RED}`, textDecoration: "none" }}
                >
                  <Navigation className="h-4 w-4" />
                  Start navigation in Google Maps
                </a>
                {totalMin > 0 && (
                  <p style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, color: INK, marginTop: 4 }}>
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
            style={{ border: "2px solid oklch(0.16 0.01 60)" }}
          >
            <ListingsMap listings={filteredSales} center={center} zoom={12} />
          </div>
        </section>
      )}

      {/* Sales grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 pb-3" style={{ borderBottom: `2px solid ${INK}` }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Upcoming Sales</p>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.5rem,3vw,2.5rem)", lineHeight: 1, marginTop: 4, color: INK }}>
              {loading
                ? "Finding your location…"
                : selectedDate
                ? (() => {
                    const d = new Date(selectedDate + "T12:00:00");
                    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return `${filteredSales.length} sale${filteredSales.length !== 1 ? "s" : ""} · ${label}`;
                  })()
                : `${filteredSales.length} upcoming${city ? ` in ${city.name}` : ""}`}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {(["all", "garage", "estate"] as const).map((f) => (
              <button key={f} onClick={() => setSaleFilter(f)}
                style={{ padding: "6px 14px", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", border: `2px solid ${INK}`, cursor: "pointer", background: saleFilter === f ? INK : "transparent", color: saleFilter === f ? CREAM : INK, boxShadow: saleFilter === f ? `2px 2px 0 ${f === "estate" ? "#b7791f" : RED}` : undefined }}
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
              <article key={s.id} className="group" style={{ border: `2px solid ${INK}`, boxShadow: inRoute ? `3px 3px 0 ${RED}` : `3px 3px 0 ${INK}`, background: "var(--background)" }}>
                <Link href={`/listing/${s.id}`} style={{ display: "block", textDecoration: "none", color: INK }}>
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", borderBottom: `2px solid ${INK}` }}>
                    <img src={s.image} alt={s.title} className="h-full w-full object-cover transition group-hover:scale-105" style={{ filter: undefined }} />
                    {inRoute && (
                      <div style={{ position: "absolute", right: 10, top: 10, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: INK, color: CREAM, fontFamily: MONO, fontSize: 11, fontWeight: 700, border: `2px solid ${CREAM}` }}>
                        {stopNum}
                      </div>
                    )}
                    <div style={{ position: "absolute", left: 10, top: 10, background: s.saleType === "estate" ? "#b7791f" : INK, color: CREAM, padding: "2px 8px", fontFamily: SANS, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>
                      {s.saleType === "estate" ? "Estate" : "Garage"}
                    </div>
                  </div>
                  {/* Content */}
                  <div style={{ padding: "14px 16px" }}>
                    {s.date && <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: s.saleType === "estate" ? "#b7791f" : TEAL, marginBottom: 6 }}>{s.date}</p>}
                    <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: INK }}>{s.title}</h3>
                    <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: INK, marginTop: 6 }}>◉ {s.location}{s.distance ? ` · ${s.distance}` : ""}</p>
                    {s.description && <p style={{ fontFamily: "'Libre Caslon Text', Georgia, serif", fontSize: 13, lineHeight: 1.6, marginTop: 8, color: INK }} className="line-clamp-2">{s.description}</p>}
                  </div>
                </Link>
                <div style={{ padding: "0 16px 14px" }}>
                  <button onClick={() => toggleRoute(s.id)}
                    style={{ width: "100%", padding: "8px", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", border: `2px solid ${INK}`, background: inRoute ? INK : "transparent", color: inRoute ? CREAM : INK, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {inRoute ? <><Check className="h-3 w-3" /> Stop #{stopNum} — remove</> : <><Plus className="h-3 w-3" /> Add to my route</>}
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
