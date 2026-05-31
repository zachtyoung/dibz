"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { getListings, CATEGORIES } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { getCityBySlug } from "@/lib/cities";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

const SF = getCityBySlug("san-francisco-ca")!;

export default function Browse() {
  const { city } = useCityContext();
  const activeCity = city ?? SF;
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const [cat, setCat] = useState("All");
  const filtered = useMemo(
    () => (cat === "All" ? listings : listings.filter((l) => l.category === cat)),
    [cat, listings],
  );
  const sales = listings.filter((l) => l.isGarageSale).length;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:gap-12 md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> {sales} garage sales this weekend
            </span>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] tracking-tight md:text-8xl">
              Your block,<br />
              <span className="text-primary">for sale.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              The neighborhood marketplace built around real maps and weekend garage sales — not endless scroll.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-accent hover:shadow-glow"
              >
                <MapPin className="h-4 w-4" /> Open the map
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 font-semibold text-foreground transition hover:border-primary"
              >
                This weekend&apos;s sales
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border/60 pt-6 max-w-md">
              <Stat n="12K+" label="Active listings" />
              <Stat n="340" label="Garage sales" />
              <Stat n="0%" label="Fees, ever" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-3">
              {listings.slice(0, 4).map((l, i) => (
                <div
                  key={l.id}
                  className={`overflow-hidden rounded-2xl border border-border ${i % 2 ? "translate-y-6" : ""}`}
                >
                  <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 backdrop-blur md:top-[65px]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Card grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-wide md:text-4xl">
            {activeCity.name} <span className="text-muted-foreground">/ {filtered.length} items</span>
          </h2>
          <Link href="/map" className="hidden text-sm font-medium text-primary hover:underline md:inline">
            View on map →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-primary">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
