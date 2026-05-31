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
      <section className="relative overflow-hidden" style={{borderBottom: "2px solid oklch(0.14 0.02 240)"}}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-8 md:py-20">
          <div className="flex flex-col justify-center">
            <span
              className="inline-flex w-fit items-center gap-1.5 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground"
              style={{border: "2px solid oklch(0.14 0.02 240)", boxShadow: "2px 2px 0 oklch(0.14 0.02 240)"}}
            >
              <Sparkles className="h-3 w-3" /> {sales} sales near you this weekend
            </span>
            <h1 className="mt-5 font-display text-7xl leading-[0.88] tracking-tight md:text-9xl">
              Your block,<br />
              <span className="text-primary">for sale.</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-semibold text-muted-foreground">
              The neighborhood marketplace built around real maps and weekend sales — garage, estate, and everything in between.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/map"
                className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-teal-600"
                style={{border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)"}}
              >
                <MapPin className="h-4 w-4" /> Open the map
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                style={{border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)"}}
              >
                Browse sales
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-0 max-w-sm" style={{border: "2px solid oklch(0.14 0.02 240)"}}>
              <Stat n="12K+" label="Listings" />
              <Stat n="340" label="Sales" />
              <Stat n="0%" label="Fees" />
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            {listings.slice(0, 4).map((l, i) => (
              <div
                key={l.id}
                className={`overflow-hidden ${i % 2 ? "translate-y-8" : ""}`}
                style={{border: "2px solid oklch(0.14 0.02 240)", boxShadow: "4px 4px 0 oklch(0.14 0.02 240)"}}
              >
                <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="sticky top-[48px] z-30 bg-surface md:top-[52px]" style={{borderBottom: "2px solid oklch(0.14 0.02 240)"}}>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
              style={{border: "2px solid oklch(0.14 0.02 240)"}}
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
            {activeCity.name} <span className="text-primary">/ {filtered.length} items</span>
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
    <div className="px-4 py-3" style={{borderRight: "2px solid oklch(0.14 0.02 240)"}}>
      <div className="font-display text-3xl text-primary">{n}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
