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
  const heroListings = listings.slice(0, 4);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* ── HERO: full-bleed photo with headline overlaid ── */}
      <section
        className="relative"
        style={{ borderBottom: `2px solid ${INK}`, minHeight: "88vh" }}
      >
        {/* Background photo grid — absolute, fills entire hero */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4">
          {(heroListings.length >= 4 ? heroListings : [...heroListings, ...heroListings]).slice(0, 4).map((l, i) => (
            <div
              key={l.id}
              className="relative overflow-hidden"
              style={{ borderRight: i < 3 ? `2px solid ${INK}` : undefined }}
            >
              <img
                src={l.image}
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: "brightness(0.45) saturate(0.8)" }}
              />
            </div>
          ))}
          {/* Dark overlay for readability */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)" }} />
        </div>

        {/* Foreground content */}
        <div className="relative flex h-full flex-col justify-between px-4 py-8 md:px-10" style={{ minHeight: "88vh" }}>

          {/* Top row */}
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              Your neighborhood marketplace
            </span>
            {sales > 0 && (
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-teal-500"
                style={{ border: `2px solid rgba(255,255,255,0.3)`, boxShadow: `2px 2px 0 ${TEAL}` }}
              >
                <MapPin className="h-3 w-3" /> {sales} sales this weekend
              </Link>
            )}
          </div>

          {/* Giant headline — centered vertically */}
          <div className="flex flex-1 flex-col justify-center py-8">
            <h1
              className="font-display leading-[0.82] text-white"
              style={{ fontSize: "clamp(5rem, 17vw, 15rem)", textShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
            >
              DIBZ IT<br />
              <span style={{ color: TEAL, textShadow: `0 0 80px ${TEAL}55` }}>BEFORE<br />THEY DO.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base font-semibold text-white/70 md:text-lg">
              Garage sales, estate sales &amp; local deals — on a real map, near you.
            </p>
          </div>

          {/* Bottom: CTAs + listing labels */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="group inline-flex items-center gap-2 bg-primary px-6 py-3.5 font-display text-xl tracking-widest text-white transition hover:bg-teal-500"
                style={{ border: `2px solid rgba(255,255,255,0.2)`, boxShadow: `4px 4px 0 rgba(0,0,0,0.4)` }}
              >
                Browse listings
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/garage-sales"
                className="inline-flex items-center gap-2 bg-white/10 px-6 py-3.5 font-display text-xl tracking-widest text-white backdrop-blur-sm transition hover:bg-white/20"
                style={{ border: `2px solid rgba(255,255,255,0.25)` }}
              >
                <MapPin className="h-4 w-4" /> Sales
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 bg-white/10 px-6 py-3.5 font-display text-xl tracking-widest text-white backdrop-blur-sm transition hover:bg-white/20"
                style={{ border: `2px solid rgba(255,255,255,0.25)` }}
              >
                <Map className="h-4 w-4" /> Map
              </Link>
            </div>

            {/* Listing name tags floating bottom-right */}
            <div className="hidden flex-col items-end gap-1 md:flex">
              {heroListings.slice(0, 3).map((l) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="inline-flex items-center gap-2 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:text-white"
                  style={{ border: `1px solid rgba(255,255,255,0.15)` }}
                >
                  <span className="font-display text-sm" style={{ color: TEAL }}>
                    {l.isGarageSale ? "FREE ENTRY" : `$${l.price}`}
                  </span>
                  {l.title}
                  <ArrowRight className="h-3 w-3 opacity-50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ borderBottom: `2px solid ${INK}`, background: INK }}>
        <div className="mx-auto flex max-w-7xl">
          {[
            { n: "12K+", label: "Active listings" },
            { n: "340",  label: "Weekend sales"  },
            { n: "0%",   label: "Seller fees"    },
            { n: "Free", label: "Always"         },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-1 flex-col items-center py-5 px-2"
              style={{ borderRight: i < 3 ? `2px solid oklch(0.25 0.02 240)` : undefined }}
            >
              <span className="font-display text-4xl leading-none" style={{ color: TEAL }}>{s.n}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden py-2.5" style={{ borderBottom: `2px solid ${INK}`, background: TEAL }}>
        <div className="marquee-track flex whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex shrink-0 items-center font-display text-2xl tracking-[0.12em] text-white/90">
              <span className="px-8">FREE TO LIST</span><span className="text-white/30">◆</span>
              <span className="px-8">GARAGE SALES</span><span className="text-white/30">◆</span>
              <span className="px-8">ESTATE SALES</span><span className="text-white/30">◆</span>
              <span className="px-8">ZERO FEES</span><span className="text-white/30">◆</span>
              <span className="px-8">MAP EVERY DEAL</span><span className="text-white/30">◆</span>
              <span className="px-8">SELL LOCAL</span><span className="text-white/30">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, background: CREAM }}>
        <div className="flex items-center gap-6 px-4 py-5 md:px-8" style={{ borderBottom: `2px solid ${INK}` }}>
          <h2 className="font-display text-4xl" style={{ color: INK }}>How it works</h2>
          <div className="h-[2px] flex-1" style={{ background: `${INK}18` }} />
        </div>
        <div className="grid md:grid-cols-3">
          <HowStep n="01" icon={<Search className="h-5 w-5" />}     title="Find it"   body="Browse listings and garage sales nearby. Filter by distance, category, and condition." href="/browse" />
          <HowStep n="02" icon={<Navigation className="h-5 w-5" />} title="Route it"  body="Build your weekend route. Door-to-door drive time calculated automatically."           href="/garage-sales" bordered />
          <HowStep n="03" icon={<Tag className="h-5 w-5" />}        title="Dibz it"   body="See something you want? Call dibs before someone else does."                           href="/browse" />
        </div>
      </section>

      {/* ── SELL BAND ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, background: INK }}>
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>For sellers</div>
              <h2 className="font-display text-white" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.9 }}>
                Got stuff<br />to sell?
              </h2>
              <p className="mt-4 max-w-sm text-base font-medium text-white/50">
                Post your garage sale or individual items. Always free, always local.
              </p>
            </div>
            <Link
              href="/dashboard?new=1"
              className="group inline-flex shrink-0 items-center gap-3 bg-primary px-8 py-5 font-display text-2xl tracking-widest text-white transition hover:bg-teal-500"
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
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-primary" style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div className="font-display text-4xl tracking-wider" style={{ color: INK }}>DIBZ</div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">
                The neighborhood marketplace. Built for neighbors, not corporations.
              </p>
            </div>
            <FooterCol title="Explore" links={[{ label: "Browse",       href: "/browse"           }, { label: "Map",          href: "/map"              }, { label: "Garage sales", href: "/garage-sales"    }]} />
            <FooterCol title="Sell"    links={[{ label: "Post listing", href: "/dashboard?new=1"  }, { label: "Dashboard",    href: "/dashboard"        }, { label: "Rules",        href: "/rules"           }]} />
            <FooterCol title="Account" links={[{ label: "Profile",     href: "/profile"          }]} />
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
        .marquee-track { animation: marquee 32s linear infinite; width: max-content; }
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
      style={{
        borderTop: `2px solid ${INK}`,
        ...(bordered ? { borderLeft: `2px solid ${INK}`, borderRight: `2px solid ${INK}` } : {}),
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center bg-primary text-white transition group-hover:bg-teal-600" style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>
          {icon}
        </div>
        <span className="font-display text-7xl leading-none" style={{ color: `${INK}12` }}>{n}</span>
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
          <Link key={l.href} href={l.href} className="text-sm font-semibold text-foreground transition hover:text-primary">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}
