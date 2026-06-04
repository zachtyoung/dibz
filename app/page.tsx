"use client";
import { useMemo } from "react";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

const INK = "oklch(0.14 0.02 240)";
const RED = "#c0392b";
const TEAL = "oklch(0.52 0.14 178)";
const CREAM = "oklch(0.955 0.016 84)";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale);
  const items = listings.filter((l) => !l.isGarageSale);
  const lateEdition = listings.slice(0, 6);

  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: SERIF }}>

      {/* ── MASTHEAD ── */}
      <header style={{ borderBottom: `1px solid ${INK}` }}>
        {/* Top rule */}
        <div
          className="flex items-center justify-between px-4 py-1.5 md:px-8"
          style={{ borderBottom: `1px solid ${INK}`, fontSize: 10, fontFamily: "'Barlow', sans-serif", letterSpacing: "0.15em", fontWeight: 700 }}
        >
          <span style={{ color: INK, opacity: 0.6 }}>THE NEIGHBORHOOD CLASSIFIEDS CO.</span>
          <span style={{ color: INK, opacity: 0.6 }}>{today} · FREE ONLINE</span>
        </div>

        {/* Brand + nav */}
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-baseline gap-1">
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: INK, lineHeight: 1 }}>
                Dibz.
              </span>
              <span
                className="hidden md:block text-[10px] font-bold uppercase tracking-widest self-end pb-1"
                style={{ fontFamily: "'Barlow', sans-serif", color: INK, opacity: 0.45, letterSpacing: "0.2em" }}
              >
                The Neighborhood<br />Classifieds Co.
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {[
              { n: "01", label: "BROWSE", href: "/browse" },
              { n: "02", label: "THE MAP", href: "/map" },
              { n: "03", label: "SALES", href: "/garage-sales" },
              { n: "04", label: "DASHBOARD", href: "/dashboard" },
            ].map(({ n, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-baseline gap-1 transition hover:opacity-70"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                <span style={{ fontSize: 9, color: RED, fontWeight: 700 }}>{n}/</span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: INK }}>{label}</span>
              </Link>
            ))}
          </nav>

          <Link
            href="/dashboard?new=1"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:opacity-90"
            style={{ fontFamily: "'Barlow', sans-serif", background: INK, letterSpacing: "0.15em" }}
          >
            + Post an Ad
          </Link>
        </div>

        {/* Section rule */}
        <div style={{ height: 3, background: INK }} />
      </header>

      {/* ── HERO: 3-column newspaper layout ── */}
      <section className="mx-auto max-w-7xl px-4 md:px-8" style={{ borderBottom: `1px solid ${INK}` }}>
        <div className="grid md:grid-cols-[220px_1fr_260px]" style={{ minHeight: "70vh" }}>

          {/* Left col: editorial copy */}
          <div className="hidden flex-col justify-between py-8 pr-6 md:flex" style={{ borderRight: `1px solid ${INK}` }}>
            <div>
              <div
                className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "'Barlow', sans-serif", color: RED }}
              >
                <span>▶</span> Feature — Page One
              </div>
              <div className="mb-2 text-[10px] uppercase tracking-widest opacity-50" style={{ fontFamily: "'Barlow', sans-serif", color: INK }}>
                By the Editors
              </div>

              {/* Drop cap paragraph */}
              <p style={{ fontSize: 13, lineHeight: 1.7, color: INK }}>
                <span
                  style={{
                    float: "left", fontFamily: SERIF, fontStyle: "italic",
                    fontSize: "3.8em", lineHeight: 0.8, marginRight: 4, marginTop: 6,
                    color: RED, fontWeight: 700,
                  }}
                >E</span>
                very Saturday morning, before the coffee is cold, somebody on your block is dragging a perfectly good armchair onto a lawn. The question has always been the same: <em>who calls dibz first?</em>
              </p>

              <p className="mt-4" style={{ fontSize: 13, lineHeight: 1.7, color: INK }}>
                Garage sales, estate sales &amp; curbside treasures — plotted on a real map of your real neighborhood. <em>Click. Claim. Carry it home.</em>
              </p>
            </div>

            <div>
              <div style={{ width: 20, height: 2, background: RED, marginBottom: 6 }} />
              <p style={{ fontSize: 10, fontFamily: "'Barlow', sans-serif", color: INK, opacity: 0.5, letterSpacing: "0.05em" }}>
                ■ CONTINUED ON PG. 2
              </p>
            </div>
          </div>

          {/* Center col: giant headline + CTAs */}
          <div className="flex flex-col justify-between py-8 md:px-8">
            {/* TRIM marks */}
            <div className="hidden justify-between text-[9px] md:flex" style={{ fontFamily: "'Barlow', sans-serif", color: INK, opacity: 0.3, letterSpacing: "0.15em" }}>
              <span>↕ TRIM</span>
              <span>TRIM ↕</span>
            </div>

            {/* Giant headline */}
            <h1
              className="flex-1 flex items-center"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: "clamp(4.5rem, 11vw, 9rem)",
                lineHeight: 0.9,
                color: INK,
                letterSpacing: "-0.02em",
              }}
            >
              <span>
                Dibz{" "}
                <span style={{ color: RED }}>it,</span>
                <br />
                before
                <br />
                they do.
                <span style={{ color: RED }}>.</span>
              </span>
            </h1>

            {/* Sub + CTAs */}
            <div>
              <p className="mb-6 max-w-sm" style={{ fontSize: 15, lineHeight: 1.6, color: INK, opacity: 0.75 }}>
                Garage sales, estate sales &amp; curbside treasures — plotted on a real map of your real neighborhood.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:opacity-90"
                  style={{ fontFamily: "'Barlow', sans-serif", background: INK, letterSpacing: "0.12em" }}
                >
                  Browse the map <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/dashboard?new=1"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition hover:bg-muted"
                  style={{ fontFamily: "'Barlow', sans-serif", border: `2px solid ${INK}`, letterSpacing: "0.12em", color: INK }}
                >
                  Post your sale
                </Link>
              </div>
            </div>
          </div>

          {/* Right col: Late Edition listings sidebar */}
          <div className="hidden flex-col py-8 pl-6 md:flex" style={{ borderLeft: `1px solid ${INK}` }}>
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ fontFamily: "'Barlow', sans-serif", color: INK }}
              >
                Late Edition
              </span>
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
                style={{ fontFamily: "'Barlow', sans-serif", background: RED }}
              >
                Live
              </span>
            </div>

            <div className="flex flex-col divide-y" style={{ borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
              {lateEdition.map((l, i) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="flex items-start gap-3 py-3 transition hover:opacity-70"
                >
                  {/* Number */}
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 9, fontWeight: 700, color: INK, opacity: 0.35, minWidth: 24, paddingTop: 2 }}>
                    № {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Thumb */}
                  <div className="shrink-0 overflow-hidden" style={{ width: 40, height: 40, border: `1px solid ${INK}` }}>
                    <img src={l.image} alt={l.title} className="h-full w-full object-cover" style={{ filter: "saturate(0.7)" }} />
                  </div>
                  {/* Copy */}
                  <div className="flex-1 min-w-0">
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.3 }} className="line-clamp-2">
                      {l.title}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 9, color: INK, opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Garage") : l.category} · {l.location.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 800,
                          color: l.isGarageSale ? TEAL : RED,
                        }}
                      >
                        {l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/browse"
              className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest transition hover:opacity-70"
              style={{ fontFamily: "'Barlow', sans-serif", color: INK }}
            >
              All listings →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden py-2" style={{ background: INK }}>
        <div className="marquee-track flex whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex shrink-0 items-center" style={{ fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "white", opacity: 0.8 }}>
              {sales.map((s) => (
                <span key={s.id} className="flex items-center">
                  <span className="px-4" style={{ color: TEAL === "oklch(0.52 0.14 178)" ? "#4ecdc4" : TEAL }}>
                    {s.saleType === "estate" ? "ESTATE SALE" : "GARAGE SALE"}
                  </span>
                  <span className="px-4 opacity-50">·</span>
                  <span className="px-4">{s.title.toUpperCase()}</span>
                  <span className="px-4 opacity-50">·</span>
                  <span className="px-4" style={{ color: "#4ecdc4" }}>{s.date?.toUpperCase()}</span>
                  <span className="px-4 opacity-30">◆</span>
                </span>
              ))}
              {sales.length === 0 && (
                <>
                  <span className="px-6">FREE TO LIST</span><span className="px-4 opacity-30">◆</span>
                  <span className="px-6">GARAGE SALES</span><span className="px-4 opacity-30">◆</span>
                  <span className="px-6">ZERO FEES</span><span className="px-4 opacity-30">◆</span>
                </>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── ALMANAC STATS ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div
          className="mb-4 text-[10px] font-bold uppercase tracking-widest"
          style={{ fontFamily: "'Barlow', sans-serif", color: RED }}
        >
          § The Almanac
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${INK}` }}>
          {[
            { n: "12,481", label: "Neighbors", sub: "+312 this wk" },
            { n: "340",    label: "Sales this wknd", sub: "— 8 cities" },
            { n: "0%",     label: "Platform fees", sub: "— always" },
            { n: "Free",   label: "To post forever", sub: "— no kidding" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-5"
              style={{ borderRight: i < 3 ? `1px solid ${INK}` : undefined }}
            >
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: INK, lineHeight: 1 }}>
                {s.n}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "'Barlow', sans-serif", color: INK }}>
                {s.label}
              </div>
              <div className="text-[10px]" style={{ fontFamily: "'Barlow', sans-serif", color: INK, opacity: 0.4 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THIS WEEKEND ── */}
      {sales.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
          <div className="mb-6 flex items-baseline justify-between" style={{ borderBottom: `1px solid ${INK}`, paddingBottom: 8 }}>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: INK }}>
              This Weekend{city ? ` in ${city.name}` : ""}
            </h2>
            <Link
              href="/garage-sales"
              style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: INK, opacity: 0.5 }}
            >
              ALL SALES →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {sales.slice(0, 3).map((s, i) => (
              <Link key={s.id} href={`/listing/${s.id}`} className="group block transition hover:opacity-90">
                <div className="relative overflow-hidden" style={{ border: `1px solid ${INK}`, aspectRatio: "4/3" }}>
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    style={{ filter: "saturate(0.8) contrast(1.05)" }}
                  />
                  {/* Label overlay */}
                  <div
                    className="absolute left-0 right-0 top-0 flex items-center justify-between px-3 py-1.5"
                    style={{ background: INK }}
                  >
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "white", opacity: 0.8 }}>
                      {s.saleType === "estate" ? "ESTATE SALE" : "GARAGE SALE"} · NO. {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.date && (
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 9, fontWeight: 700, color: "#4ecdc4", letterSpacing: "0.1em" }}>
                        {s.date.split("·")[0].trim().toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.3 }}>
                    {s.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 shrink-0" style={{ color: INK, opacity: 0.4 }} />
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: 10, color: INK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {s.location}
                    </span>
                  </div>
                  {s.description && (
                    <p className="mt-1 line-clamp-2" style={{ fontFamily: SERIF, fontSize: 12, lineHeight: 1.5, color: INK, opacity: 0.6 }}>
                      {s.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${INK}`, background: INK }}>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 32, marginBottom: 24 }}>
            <div className="col-span-2 md:col-span-1">
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "1.75rem", color: "white", lineHeight: 1 }}>Dibz.</div>
              <p className="mt-2 text-xs leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif", color: "white", opacity: 0.4 }}>
                The neighborhood marketplace. Built for neighbors, not corporations.
              </p>
            </div>
            {[
              { title: "Explore", links: [{ label: "Browse", href: "/browse" }, { label: "Map", href: "/map" }, { label: "Garage sales", href: "/garage-sales" }] },
              { title: "Sell", links: [{ label: "Post a listing", href: "/dashboard?new=1" }, { label: "Dashboard", href: "/dashboard" }, { label: "Rules", href: "/rules" }] },
              { title: "Account", links: [{ label: "Profile", href: "/profile" }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "'Barlow', sans-serif", color: "white", opacity: 0.35 }}>{col.title}</p>
                <div className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} className="text-sm font-semibold transition hover:opacity-100" style={{ fontFamily: "'Barlow', sans-serif", color: "white", opacity: 0.6 }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <span className="text-xs" style={{ fontFamily: "'Barlow', sans-serif", color: "white", opacity: 0.3 }}>© 2025 Dibz. Built for neighbors.</span>
            <span className="text-xs" style={{ fontFamily: "'Barlow', sans-serif", color: "white", opacity: 0.3 }}>Free to list · Free to browse · Zero fees</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-25%); } }
        .marquee-track { animation: marquee 40s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
        h1, h2, h3, h4 { font-family: 'Playfair Display', Georgia, serif !important; }
      `}</style>
    </div>
  );
}
