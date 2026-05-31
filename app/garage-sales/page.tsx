"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { getCityBySlug } from "@/lib/cities";
import { Calendar, MapPin, Plus, Users } from "lucide-react";

const SF = getCityBySlug("san-francisco-ca")!;

export default function GarageSales() {
  const { city } = useCityContext();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const sales = listings.filter((l) => l.isGarageSale);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

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
          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:shadow-glow">
            <Plus className="h-4 w-4" strokeWidth={3} /> Post your sale
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-[420px] overflow-hidden rounded-3xl border border-border">
          <ListingsMap listings={sales} center={center} zoom={12} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <h2 className="mb-6 font-display text-3xl tracking-wide md:text-4xl">
          {sales.length} sales in {activeCity.name}
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((s) => (
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
                <button className="w-full rounded-full border border-border bg-surface py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent">
                  Add to my route
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
