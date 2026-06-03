"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { ArrowRight, MapPin, Tag, Map } from "lucide-react";
import Link from "next/link";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale).length;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-8 md:py-28">
          <div className="flex flex-col justify-center">
            {sales > 0 && (
              <Link
                href="/garage-sales"
                className="inline-flex w-fit items-center gap-1.5 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-teal-600 cursor-pointer"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "2px 2px 0 oklch(0.14 0.02 240)" }}
              >
                <MapPin className="h-3 w-3" /> {sales} sales near you this weekend
              </Link>
            )}
            <h1 className="mt-5 font-display text-6xl leading-[0.88] tracking-tight md:text-8xl">
              Dibz it<br />
              <span className="text-primary">before they do.</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-semibold text-muted-foreground">
              The neighborhood marketplace built around real maps and weekend sales — garage, estate, and everything in between.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-teal-600"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <Tag className="h-4 w-4" /> Browse listings
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <MapPin className="h-4 w-4" /> Garage sales
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
              >
                <Map className="h-4 w-4" /> Open map
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-0 max-w-sm" style={{ border: "2px solid oklch(0.14 0.02 240)" }}>
              <Stat n="12K+" label="Listings" />
              <Stat n="340" label="Sales" />
              <Stat n="0%" label="Fees" />
            </div>
          </div>

          <div className="relative hidden grid-cols-2 gap-3 pb-8 md:grid">
            {listings.slice(0, 4).map((l, i) => (
              <div
                key={l.id}
                className={`overflow-hidden ${i % 2 ? "translate-y-8" : ""}`}
                style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "4px 4px 0 oklch(0.14 0.02 240)" }}
              >
                <img src={l.image} alt={l.title} className="aspect-square w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-0 md:grid-cols-3" style={{ border: "2px solid oklch(0.14 0.02 240)" }}>
          <ValueProp
            title="Real maps"
            body="Every listing pinned. See what's near you before you go."
          />
          <ValueProp
            title="Weekend sales"
            body="Garage and estate sales with route planning built in."
            bordered
          />
          <ValueProp
            title="Zero fees"
            body="Free to list. Free to browse. No middlemen."
          />
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="px-4 py-3" style={{ borderRight: "2px solid oklch(0.14 0.02 240)" }}>
      <div className="font-display text-3xl text-primary">{n}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function ValueProp({ title, body, bordered }: { title: string; body: string; bordered?: boolean }) {
  return (
    <div
      className="px-8 py-10"
      style={bordered ? { borderLeft: "2px solid oklch(0.14 0.02 240)", borderRight: "2px solid oklch(0.14 0.02 240)" } : {}}
    >
      <h3 className="font-display text-2xl tracking-wide text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
