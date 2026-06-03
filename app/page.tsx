"use client";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { ArrowRight, MapPin, Tag, Map, Navigation, DollarSign, Search } from "lucide-react";
import Link from "next/link";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale).length;
  const heroListings = listings.slice(0, 6);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ borderBottom: `2px solid ${INK}`, background: "oklch(0.955 0.016 84)" }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid min-h-[82vh] grid-cols-1 gap-0 md:grid-cols-[1fr_420px] md:min-h-[78vh]">

            {/* Left: copy */}
            <div className="flex flex-col justify-center py-14 pr-0 md:py-20 md:pr-12" style={{ borderRight: `2px solid ${INK}` }}>

              {/* Overline pill */}
              {sales > 0 ? (
                <Link
                  href="/garage-sales"
                  className="inline-flex w-fit items-center gap-1.5 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-teal-600"
                  style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
                >
                  <MapPin className="h-3 w-3" /> {sales} sales near you this weekend
                </Link>
              ) : (
                <span
                  className="inline-flex w-fit items-center gap-1.5 bg-surface px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground"
                  style={{ border: `2px solid ${INK}` }}
                >
                  <MapPin className="h-3 w-3" /> Your neighborhood marketplace
                </span>
              )}

              {/* Headline */}
              <h1
                className="mt-4 font-display leading-[0.85] tracking-tight"
                style={{ fontSize: "clamp(4rem, 10vw, 7.5rem)", color: INK }}
              >
                Dibz it<br />
                <span style={{ color: TEAL, WebkitTextStroke: "0px" }}>before they<br />do.</span>
              </h1>

              <p className="mt-5 max-w-sm text-base font-medium leading-relaxed text-muted-foreground">
                The neighborhood marketplace built around real maps and weekend sales — garage, estate, and everything in between.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="group inline-flex items-center gap-2 bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-teal-600"
                  style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
                >
                  <Tag className="h-4 w-4" />
                  Browse listings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/garage-sales"
                  className="inline-flex items-center gap-2 bg-surface px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-foreground transition hover:bg-muted"
                  style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
                >
                  <MapPin className="h-4 w-4" /> Garage sales
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 flex items-stretch" style={{ border: `2px solid ${INK}`, maxWidth: 380 }}>
                <StatCell n="12K+" label="Listings" />
                <StatCell n="340" label="Sales" border />
                <StatCell n="0%" label="Fees" border />
              </div>

              {/* Secondary link */}
              <Link
                href="/map"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground transition hover:text-primary"
              >
                <Map className="h-3.5 w-3.5" /> Explore the map
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Right: collage grid */}
            <div className="relative hidden flex-col gap-0 md:flex" style={{ borderLeft: `2px solid ${INK}` }}>
              {/* Stacked images */}
              <div className="grid h-full grid-rows-3">
                {heroListings.slice(0, 3).map((l, i) => (
                  <div
                    key={l.id}
                    className="relative overflow-hidden"
                    style={{ borderBottom: i < 2 ? `2px solid ${INK}` : undefined }}
                  >
                    <img
                      src={l.image}
                      alt={l.title}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 py-2"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
                    >
                      <span className="font-display text-lg tracking-wide text-white drop-shadow">{l.title}</span>
                      {!l.isGarageSale && (
                        <span className="font-display text-xl text-white drop-shadow">${l.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Diagonal stamp overlay */}
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 10 }}
              >
                <div
                  className="font-display text-6xl tracking-[0.2em] text-white/10 select-none"
                  style={{ transform: "rotate(-35deg)", letterSpacing: "0.3em", fontSize: "5rem" }}
                >
                  DIBZ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div
        className="overflow-hidden py-3"
        style={{ borderBottom: `2px solid ${INK}`, background: TEAL }}
      >
        <div className="marquee-track flex gap-12 whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="flex shrink-0 items-center gap-12 font-display text-xl tracking-widest text-white/90">
              <span>FREE TO LIST</span>
              <span className="text-white/40">✦</span>
              <span>GARAGE SALES</span>
              <span className="text-white/40">✦</span>
              <span>ESTATE SALES</span>
              <span className="text-white/40">✦</span>
              <span>ZERO FEES</span>
              <span className="text-white/40">✦</span>
              <span>MAP EVERY DEAL</span>
              <span className="text-white/40">✦</span>
              <span>ROUTE PLANNER</span>
              <span className="text-white/40">✦</span>
              <span>SELL LOCAL</span>
              <span className="text-white/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-10 flex items-baseline gap-4">
            <h2 className="font-display text-5xl md:text-6xl" style={{ color: INK }}>How it works</h2>
            <div className="flex-1 h-[2px] bg-foreground/10" />
          </div>
          <div className="grid gap-0 md:grid-cols-3" style={{ border: `2px solid ${INK}` }}>
            <HowStep
              n="01"
              icon={<Search className="h-6 w-6" />}
              title="Find"
              body="Browse listings and garage sales near you — filtered by distance, category, and condition."
              href="/browse"
            />
            <HowStep
              n="02"
              icon={<Navigation className="h-6 w-6" />}
              title="Route"
              body="Add stops to your weekend route. We calculate drive time door-to-door."
              href="/garage-sales"
              bordered
            />
            <HowStep
              n="03"
              icon={<DollarSign className="h-6 w-6" />}
              title="Score"
              body="List anything free. No fees, no commissions. Just neighbors buying and selling."
              href="/map"
            />
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ── */}
      {heroListings.length >= 6 && (
        <section style={{ borderBottom: `2px solid ${INK}` }}>
          <div className="flex overflow-x-auto" style={{ gap: 0 }}>
            {heroListings.map((l, i) => (
              <Link
                href={`/listing/${l.id}`}
                key={l.id}
                className="group relative shrink-0 overflow-hidden"
                style={{
                  width: "16.666%",
                  aspectRatio: "1",
                  borderRight: i < 5 ? `2px solid ${INK}` : undefined,
                }}
              >
                <img
                  src={l.image}
                  alt={l.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="font-display text-sm tracking-widest text-white">VIEW</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SELL CTA BAND ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, background: "oklch(0.14 0.02 240)" }}>
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-5xl leading-tight text-white md:text-6xl">
                Got stuff to sell?
              </h2>
              <p className="mt-2 text-base font-medium text-white/60">
                Post your garage sale or individual items. Free, forever.
              </p>
            </div>
            <Link
              href="/dashboard?new=1"
              className="group inline-flex shrink-0 items-center gap-3 bg-primary px-8 py-4 font-display text-2xl tracking-widest text-white transition hover:bg-teal-500"
              style={{ border: "2px solid oklch(0.52 0.14 178)", boxShadow: "4px 4px 0 oklch(0.38 0.12 178)" }}
            >
              Post for free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div
            className="grid grid-cols-2 gap-0 py-12 md:grid-cols-4"
            style={{ borderBottom: `2px solid ${INK}` }}
          >
            {/* Brand */}
            <div className="col-span-2 pr-8 md:col-span-1" style={{ borderRight: `2px solid ${INK}` }}>
              <div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-primary"
                style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div className="font-display text-3xl tracking-wider" style={{ color: INK }}>DIBZ</div>
              <p className="mt-2 text-xs font-medium text-muted-foreground leading-relaxed">
                The neighborhood marketplace. Built for neighbors, not corporations.
              </p>
            </div>

            {/* Explore */}
            <div className="px-8 pt-8 md:pt-0" style={{ borderRight: `2px solid ${INK}` }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Explore</p>
              <FooterLinks links={[
                { label: "Browse", href: "/browse" },
                { label: "Map view", href: "/map" },
                { label: "Garage sales", href: "/garage-sales" },
              ]} />
            </div>

            {/* Sell */}
            <div className="px-8 pt-8 md:pt-0" style={{ borderRight: `2px solid ${INK}` }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sell</p>
              <FooterLinks links={[
                { label: "Post a listing", href: "/dashboard?new=1" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Rules", href: "/rules" },
              ]} />
            </div>

            {/* Account */}
            <div className="px-8 pt-8 md:pt-0">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</p>
              <FooterLinks links={[
                { label: "Profile", href: "/profile" },
              ]} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 py-5 text-xs font-medium text-muted-foreground md:flex-row">
            <span>© 2025 Dibz. Built for neighbors.</span>
            <span>Free to list · Free to browse · Zero fees</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .marquee-track {
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function StatCell({ n, label, border }: { n: string; label: string; border?: boolean }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-4 py-4"
      style={border ? { borderLeft: `2px solid ${INK}` } : {}}
    >
      <span className="font-display text-4xl leading-none" style={{ color: TEAL }}>{n}</span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

function HowStep({
  n, icon, title, body, href, bordered,
}: {
  n: string; icon: React.ReactNode; title: string; body: string; href: string; bordered?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block px-8 py-10 transition hover:bg-surface"
      style={bordered ? { borderLeft: `2px solid ${INK}`, borderRight: `2px solid ${INK}` } : {}}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center bg-primary text-white transition group-hover:bg-teal-600"
          style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
        >
          {icon}
        </div>
        <span className="font-display text-6xl leading-none text-foreground/8">{n}</span>
      </div>
      <h3 className="mt-5 font-display text-3xl tracking-wide" style={{ color: INK }}>{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
        Learn more <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm font-semibold text-foreground transition hover:text-primary"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
