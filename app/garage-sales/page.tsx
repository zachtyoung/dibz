"use client";
import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { getCityBySlug } from "@/lib/cities";
import { Calendar, Check, Clock, MapPin, Navigation, Plus, Users, X } from "lucide-react";
import type { RouteStep } from "@/components/RouteMap";

const RouteMap = dynamic(() => import("@/components/RouteMap").then((m) => m.RouteMap), { ssr: false });

const SF = getCityBySlug("san-francisco-ca")!;
const STORAGE_KEY = "dibz-route";

export default function GarageSales() {
  const { city } = useCityContext();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const sales = listings.filter((l) => l.isGarageSale);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

  const [route, setRoute] = useState<string[]>([]);
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [showRoute, setShowRoute] = useState(false);

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

  const routeSales = route.map((id) => sales.find((s) => s.id === id)).filter(Boolean) as typeof sales;

  const totalMin = Math.round(steps.reduce((acc, s) => acc + s.durationSec, 0) / 60);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
            <Calendar className="h-3 w-3" /> This weekend
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-tight md:text-7xl">
            Garage sales,<br />
            <span className="text-accent">curb to curb.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Free to post. Free to browse. Map your route, mark your favorites, and hit the block.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:shadow-glow">
              <Plus className="h-4 w-4" strokeWidth={3} /> Post your sale
            </button>
            {routeSales.length > 0 && (
              <button
                onClick={() => setShowRoute(true)}
                className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-5 py-3 font-semibold text-accent transition hover:bg-accent/20"
              >
                <Navigation className="h-4 w-4" /> View my route · {routeSales.length} stop{routeSales.length !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Route view */}
      {showRoute && routeSales.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-wide">Your route</h2>
              {totalMin > 0 && (
                <p className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  ~{totalMin} min driving · {routeSales.length} stops
                </p>
              )}
            </div>
            <button onClick={() => setShowRoute(false)} className="rounded-full border border-border p-2 hover:border-accent">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Map */}
            <div className="h-[480px] overflow-hidden rounded-3xl border border-border lg:flex-1">
              <RouteMap stops={routeSales} onRouteReady={setSteps} />
            </div>

            {/* Timeline */}
            <div className="flex w-full flex-col gap-0 lg:w-72">
              {routeSales.map((stop, i) => {
                const leg = steps[i - 1];
                return (
                  <div key={stop.id}>
                    {leg && (
                      <div className="flex items-center gap-2 py-1 pl-[22px] text-xs text-muted-foreground">
                        <div className="h-6 w-px bg-accent/30" />
                        <Clock className="h-3 w-3 text-accent" />
                        {leg.durationText} · {leg.distanceText}
                      </div>
                    )}
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{stop.title}</p>
                        <p className="text-xs text-muted-foreground">{stop.date}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <MapPin className="mr-0.5 inline h-2.5 w-2.5" />{stop.location}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleRoute(stop.id)}
                        className="ml-auto shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive"
                        title="Remove from route"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {routeSales.length > 0 && (
                <a
                  href={`https://www.google.com/maps/dir/${routeSales.map((s) => `${s.lat},${s.lng}`).join("/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-glow"
                >
                  <Navigation className="h-4 w-4" /> Open in Google Maps
                </a>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="h-[420px] overflow-hidden rounded-3xl border border-border">
            <ListingsMap listings={sales} center={center} zoom={12} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <h2 className="mb-6 font-display text-3xl tracking-wide md:text-4xl">
          {sales.length} sales in {activeCity.name}
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((s) => {
            const inRoute = route.includes(s.id);
            return (
              <article
                key={s.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/50 hover:shadow-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent">
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
                  <button
                    onClick={() => toggleRoute(s.id)}
                    className={`w-full rounded-full border py-2 text-sm font-semibold transition ${
                      inRoute
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-foreground hover:border-accent hover:text-accent"
                    }`}
                  >
                    {inRoute ? (
                      <span className="inline-flex items-center justify-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> On my route
                      </span>
                    ) : "Add to my route"}
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
