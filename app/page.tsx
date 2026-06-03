"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { ArrowRight, MapPin, Tag, Map, Navigation, DollarSign, Search } from "lucide-react";
import Link from "next/link";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";
const CREAM = "oklch(0.955 0.016 84)";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale).length;
  const heroListings = listings.slice(0, 5);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* ── HERO: full-bleed editorial ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, background: CREAM }}>

        {/* Top bar: city badge + overline */}
        <div
          className="flex items-center justify-between px-4 py-3 md:px-8"
          style={{ borderBottom: `2px solid ${INK}` }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Your neighborhood marketplace
          </span>
          {sales > 0 && (
            <Link
              href="/garage-sales"
              className="inline-flex items-center gap-1.5 bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-teal-600"
              style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
            >
              <MapPin className="h-3 w-3" /> {sales} sales this weekend
            </Link>
          )}
        </div>

        {/* Giant headline — full width, oversized */}
        <div className="px-4 pt-8 pb-0 md:px-8 md:pt-10">
          <h1
            className="font-display leading-[0.82] tracking-tight"
            style={{
              fontSize: "clamp(5.5rem, 16vw, 14rem)",
              color: INK,
              lineHeight: 0.82,
            }}
          >
            DIBZ IT<br />
            <span style={{ color: TEAL, WebkitTextStroke: `1px ${TEAL}` }}>BEFORE<br />THEY DO.</span>
          </h1>
        </div>

        {/* Photo collage row — sits right under the headline */}
        {heroListings.length > 0 && (
          <div
            className="mt-6 flex"
            style={{ borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}
          >
            {heroListings.map((l, i) => (
              <Link
                href={`/listing/${l.id}`}
                key={l.id}
                className="group relative overflow-hidden"
                style={{
                  flex: i === 0 ? "2 1 0" : "1 1 0",
                  aspectRatio: i === 0 ? "16/9" : "3/4",
                  borderRight: i < heroListings.length - 1 ? `2px solid ${INK}` : undefined,
                }}
              >
                <img
                  src={l.image}
                  alt={l.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="font-display text-xs tracking-widest text-white/70 uppercase">
                    {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Garage") : l.category}
                  </div>
                  <div className="font-display text-lg leading-tight text-white">{l.title}</div>
                  {!l.isGarageSale && (
                    <div className="font-display text-xl text-primary">${l.price.toLocaleString()}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom action row */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8"
          style={{ borderTop: heroListings.length === 0 ? `2px solid ${INK}` : undefined }}
        >
          <p className="max-w-xs text-sm font-semibold text-muted-foreground">
            Garage sales, estate sales & local deals — on a real map, near you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="group inline-flex items-center gap-2 bg-primary px-6 py-3 font-display text-xl tracking-widest text-white transition hover:bg-teal-600"
              style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
            >
              Browse listings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/garage-sales"
              className="inline-flex items-center gap-2 bg-surface px-6 py-3 font-display text-xl tracking-widest text-foreground transition hover:bg-muted"
              style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
            >
              <MapPin className="h-4 w-4" /> Sales
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-surface px-6 py-3 font-display text-xl tracking-widest text-foreground transition hover:bg-muted"
              style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
            >
              <Map className="h-4 w-4" /> Map
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ borderBottom: `2px solid ${INK}`, background: INK }}>
        <div className="mx-auto flex max-w-7xl">
          {[
            { n: "12K+", label: "Active listings" },
            { n: "340", label: "Weekend sales" },
            { n: "0%", label: "Seller fees" },
            { n: "Free", label: "Always" },
          ].map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center py-5 px-4" style={{ borderRight: `2px solid oklch(0.25 0.02 240)` }}>
              <span className="font-display text-4xl leading-none" style={{ color: TEAL }}>{s.n}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-2.5" style={{ borderBottom: `2px solid ${INK}`, background: TEAL }}>
        <div className="marquee-track flex gap-0 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex shrink-0 items-center font-display text-2xl tracking-[0.15em] text-white/90">
              <span className="px-8">FREE TO LIST</span>
              <span className="text-white/30">◆</span>
              <span className="px-8">GARAGE SALES</span>
              <span className="text-white/30">◆</span>
              <span className="px-8">ESTATE SALES</span>
              <span className="text-white/30">◆</span>
              <span className="px-8">ZERO FEES</span>
              <span className="text-white/30">◆</span>
              <span className="px-8">MAP EVERY DEAL</span>
              <span className="text-white/30">◆</span>
              <span className="px-8">SELL LOCAL</span>
              <span className="text-white/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderBottom: `2px solid ${INK}` }}>
        <div
          className="flex items-center gap-6 px-4 py-5 md:px-8"
          style={{ borderBottom: `2px solid ${INK}` }}
        >
          <h2 className="font-display text-4xl" style={{ color: INK }}>How it works</h2>
          <div className="h-[2px] flex-1" style={{ background: `${INK}20` }} />
        </div>
        <div className="grid md:grid-cols-3" style={{ borderBottom: `2px solid ${INK}` }}>
          <HowStep n="01" icon={<Search className="h-5 w-5" />} title="Find it" body="Browse listings and garage sales nearby — filter by distance, category, condition." href="/browse" />
          <HowStep n="02" icon={<Navigation className="h-5 w-5" />} title="Route it" body="Build your weekend route. We calculate door-to-door drive time automatically." href="/garage-sales" bordered />
          <HowStep n="03" icon={<DollarSign className="h-5 w-5" />} title="Dibz it" body="List anything for free. No fees ever. Just neighbors buying and selling." href="/dashboard?new=1" />
        </div>
      </section>

      {/* ── SELL BAND ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, background: INK }}>
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>
                Sellers
              </div>
              <h2 className="font-display leading-none text-white" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
                Got stuff to sell?
              </h2>
              <p className="mt-3 max-w-sm text-base font-medium text-white/50">
                Post your garage sale or individual items. Always free, always local.
              </p>
            </div>
            <Link
              href="/dashboard?new=1"
              className="group inline-flex shrink-0 items-center gap-3 bg-primary px-8 py-4 font-display text-2xl tracking-widest text-white transition hover:bg-teal-500"
              style={{ border: `2px solid ${TEAL}`, boxShadow: `5px 5px 0 oklch(0.38 0.12 178)` }}
            >
              Post for free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: CREAM }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-0 py-12 md:grid-cols-4" style={{ borderBottom: `2px solid ${INK}` }}>
            <div className="col-span-2 pb-8 pr-8 md:col-span-1 md:pb-0" style={{ borderRight: `2px solid ${INK}` }}>
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-primary"
                style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div className="font-display text-4xl tracking-wider" style={{ color: INK }}>DIBZ</div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">
                The neighborhood marketplace. Built for neighbors, not corporations.
              </p>
            </div>
            <FooterCol title="Explore" links={[{ label: "Browse", href: "/browse" }, { label: "Map", href: "/map" }, { label: "Garage sales", href: "/garage-sales" }]} />
            <FooterCol title="Sell" links={[{ label: "Post a listing", href: "/dashboard?new=1" }, { label: "Dashboard", href: "/dashboard" }, { label: "Rules", href: "/rules" }]} />
            <FooterCol title="Account" links={[{ label: "Profile", href: "/profile" }]} />
          </div>
          <div className="flex flex-col items-center justify-between gap-2 py-5 text-xs font-semibold text-muted-foreground md:flex-row">
            <span>© 2025 Dibz. Built for neighbors.</span>
            <span>Free to list · Free to browse · Zero fees</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
        .marquee-track {
          animation: marquee 32s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function HowStep({ n, icon, title, body, href, bordered }: {
  n: string; icon: React.ReactNode; title: string; body: string; href: string; bordered?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block px-8 py-10 transition hover:bg-muted/40"
      style={bordered ? { borderLeft: `2px solid ${INK}`, borderRight: `2px solid ${INK}` } : {}}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center bg-primary text-white transition group-hover:bg-teal-600"
          style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
        >
          {icon}
        </div>
        <span className="font-display text-7xl leading-none" style={{ color: `${INK}10` }}>{n}</span>
      </div>
      <h3 className="mt-5 font-display text-3xl" style={{ color: INK }}>{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Go <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="px-8 pt-8 md:pt-0" style={{ borderRight: `2px solid ${INK}` }}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <div className="flex flex-col gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm font-semibold text-foreground transition hover:text-primary">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
