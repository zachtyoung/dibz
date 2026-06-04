"use client";
import { useMemo } from "react";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import Link from "next/link";

const INK = "#1a1a18";
const RED = "#c0392b";
const TEAL_HEX = "#2a7a6f";
const CREAM = "#f5f0e8";
const SERIF = "'DM Serif Display', 'Playfair Display', Georgia, serif";
const BODY = "'Libre Caslon Text', Georgia, serif";
const MONO = "'Barlow', 'JetBrains Mono', 'Courier New', monospace";
const SANS = "'Archivo Black', 'Barlow', system-ui, sans-serif";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale);
  const lateEdition = listings.slice(0, 5);
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  const edition = city ? `${city.name.toUpperCase()} EDITION · ` : "";

  return (
    <div className="newspaper min-h-screen" style={{ color: INK }}>

      {/* ── MASTHEAD ── */}
      <header style={{ borderBottom: `2px solid ${INK}` }}>
        {/* Top strip */}
        <div
          className="flex items-center justify-between px-6 py-2"
          style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", borderBottom: `1px solid ${INK}` }}
        >
          <span style={{ opacity: 0.6 }}>Vol. I · No. 01</span>
          <span className="hidden md:block" style={{ opacity: 0.6 }}>{edition}{today}</span>
          <span style={{ opacity: 0.6 }}>Free Online</span>
        </div>

        {/* Brand row */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-4">
          <div className="flex items-end gap-3">
            <Link href="/" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(3rem,7vw,5rem)", color: INK, lineHeight: 1, textDecoration: "none" }}>
              Dibz<span style={{ color: RED }}>.</span>
            </Link>
            <span className="mb-1.5 hidden md:block" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.45, lineHeight: 1.5 }}>
              The Neighborhood<br />Classifieds Co.
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1" style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {[["01", "Browse", "/browse"], ["02", "The Map", "/map"], ["03", "Sales", "/garage-sales"], ["04", "Dashboard", "/dashboard"]].map(([n, label, href]) => (
              <Link key={href} href={href} style={{ textDecoration: "none", color: INK, borderBottom: "2px solid transparent", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                <span style={{ color: RED, fontFamily: MONO, fontWeight: 700 }}>{n}/ </span>{label}
              </Link>
            ))}
            <Link
              href="/dashboard?new=1"
              style={{ background: INK, color: CREAM, padding: "6px 14px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", fontWeight: 700 }}
            >
              + Post an Ad
            </Link>
          </nav>
        </div>

        {/* Double rule */}
        <div style={{ height: 1, background: INK, opacity: 0.25 }} />
        <div style={{ height: 4, background: INK }} />
      </header>

      {/* ── HERO: 3-col newspaper ── */}
      <section className="mx-auto max-w-7xl px-6 py-10" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="grid gap-8 md:grid-cols-12">

          {/* Left editorial col */}
          <div className="hidden md:block md:col-span-3 md:border-r-2 md:pr-6" style={{ borderColor: INK }}>
            <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED }}>▶ Feature — Page One</p>
            <p className="mt-3" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.5 }}>By the Editors</p>
            <p className="mt-4" style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.75 }}>
              <span style={{ float: "left", fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "5em", lineHeight: 0.75, marginRight: 6, marginTop: 8, color: RED }}>E</span>
              very Saturday morning, before the coffee is cold, somebody on your block is dragging a perfectly good armchair onto a lawn. The question has always been the same: <em>who calls dibz first?</em>
            </p>
            <p className="mt-4" style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.75 }}>
              Garage sales, estate sales &amp; curbside treasures — plotted on a real map of your real neighborhood. <em>Click. Claim. Carry it home.</em>
            </p>
            <div className="mt-6 flex items-center gap-2" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, background: RED }} />
              Continued on Pg. 2
            </div>
          </div>

          {/* Center headline col */}
          <div className="md:col-span-6 relative" style={{ borderLeft: `1px solid ${INK}`, borderRight: `1px solid ${INK}`, paddingLeft: 24, paddingRight: 24 }}>
            <div className="hidden md:flex justify-between mb-2" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.3 }}>
              <span>╋ trim</span><span>trim ╋</span>
            </div>

            {/* Giant headline — "Dibz it," on one line, then before / they do. */}
            <div style={{ position: "relative" }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "clamp(3.5rem,8vw,7.5rem)", lineHeight: 0.9, letterSpacing: "-0.03em", color: INK, fontStyle: "italic" }}>
                <span className="block" style={{ whiteSpace: "nowrap" }}>Dibz <span style={{ color: RED }}>it,</span></span>
                <span className="block">before</span>
                <span className="block">they do<span style={{ color: RED }}>.</span></span>
              </h1>
              {/* Halftone teal block — right side like mockup */}
              <span aria-hidden style={{
                position: "absolute", right: -8, top: "25%",
                width: 130, height: 150,
                backgroundImage: `radial-gradient(${TEAL_HEX} 1.2px, transparent 1.4px)`,
                backgroundSize: "6px 6px", opacity: 0.3, zIndex: 0, pointerEvents: "none",
              }} />
            </div>

            {/* Sub-copy LEFT, CTAs stacked RIGHT */}
            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65, opacity: 0.8, maxWidth: 320 }}>
                Garage sales, estate sales &amp; curbside treasures — plotted on a real map of your real neighborhood. <em>Click. Claim. Carry it home.</em>
              </p>
              <div className="flex flex-col gap-3 shrink-0" style={{ minWidth: 220 }}>
                <Link href="/browse" style={{ display: "block", background: INK, color: "#f5f0e8", padding: "14px 22px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", fontWeight: 700, textAlign: "center" }}>
                  Browse the Map →
                </Link>
                <Link href="/dashboard?new=1" style={{ display: "block", border: `2px solid ${INK}`, color: INK, padding: "12px 22px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", fontWeight: 700, textAlign: "center", background: "transparent" }}>
                  Post Your Sale
                </Link>
              </div>
            </div>
          </div>

          {/* Right late edition col */}
          <aside className="md:col-span-3 md:border-l-2 md:pl-6" style={{ borderColor: INK }}>
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${INK}` }}>
              <span style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>Late Edition</span>
              <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: RED, fontWeight: 700 }}>Live</span>
            </div>
            <ol className="mt-3">
              {lateEdition.map((l, i) => (
                <li key={l.id} style={{ borderBottom: `1px solid ${INK}`, paddingTop: 8, paddingBottom: 8 }}>
                  <Link href={`/listing/${l.id}`} style={{ textDecoration: "none", color: INK, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, opacity: 0.35, flexShrink: 0 }}>№ {String(i + 1).padStart(2, "0")}</span>
                        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{l.title}</span>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.4, marginTop: 2 }}>
                        {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Garage") : l.category} · {l.location.split(" ").slice(0, 2).join(" ")}
                      </div>
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: l.isGarageSale ? TEAL_HEX : RED, flexShrink: 0, paddingTop: 2 }}>
                      {l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            {lateEdition.length === 0 && (
              <p style={{ fontFamily: MONO, fontSize: 10, opacity: 0.4, marginTop: 12 }}>No listings yet — pick a city above.</p>
            )}
          </aside>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background: INK, color: CREAM, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, overflow: "hidden" }}>
        <div className="marquee-track" style={{ display: "flex", whiteSpace: "nowrap", padding: "8px 0", fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {(sales.length > 0 ? sales : listings.slice(0, 4)).map((s) => (
                <span key={s.id} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: TEAL_HEX, padding: "0 16px" }}>✦</span>
                  <span style={{ padding: "0 16px" }}>{s.title.toUpperCase()}</span>
                  {s.date && <span style={{ padding: "0 16px", color: TEAL_HEX }}>{s.date.toUpperCase()}</span>}
                  <span style={{ padding: "0 16px", opacity: 0.3 }}>·</span>
                  <span style={{ padding: "0 16px", opacity: 0.6 }}>{s.location}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── ALMANAC ── */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", color: RED }}>§ The Almanac</p>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4" style={{ border: `2px solid ${INK}`, gap: 1, background: INK }}>
          {[
            ["12,481", "Neighbors", "+312 this wk"],
            ["340", "Sales this wknd", "— 8 cities"],
            ["0%", "Platform fees", "— always"],
            ["Free", "To post forever", "— no kidding"],
          ].map(([n, l, s]) => (
            <div key={l} style={{ padding: "24px" }}>
              <div style={{ fontFamily: SERIF, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, lineHeight: 1, color: INK }}>{n}</div>
              <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{l}</div>
              <div className="mt-1" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.45 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THIS WEEKEND ── */}
      {sales.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 flex items-end justify-between pb-2" style={{ borderBottom: `2px solid ${INK}` }}>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.75rem,3vw,2.5rem)", lineHeight: 1 }}>
              This Weekend{city ? ` in ${city.name}` : ""}
            </h2>
            <Link href="/garage-sales" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: INK, textDecoration: "none", opacity: 0.5 }}>
              All sales →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sales.slice(0, 3).map((s, i) => (
              <Link key={s.id} href={`/listing/${s.id}`} style={{ textDecoration: "none", color: INK, display: "block" }}>
                <article style={{ border: `2px solid ${INK}` }}>
                  {/* Photo with label bar */}
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", borderBottom: `2px solid ${INK}` }}>
                    <img
                      src={s.image}
                      alt={s.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.75) contrast(1.05)" }}
                    />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: INK, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: CREAM, opacity: 0.8 }}>
                        {s.saleType === "estate" ? "Estate" : "Garage"} Sale · No. {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.date && (
                        <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: TEAL_HEX }}>
                          {s.date.split("·")[0].trim().toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Copy */}
                  <div style={{ padding: "16px 20px" }}>
                    {s.date && <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", color: RED, marginBottom: 6 }}>{s.date.toUpperCase()}</p>}
                    <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>{s.title}</h3>
                    <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.5, marginTop: 4 }}>◉ {s.location}</p>
                    {s.description && (
                      <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.6, marginTop: 10, opacity: 0.7 }} className="line-clamp-2">{s.description}</p>
                    )}
                    <div style={{ borderTop: `1px dotted ${INK}`, marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.5 }}>RSVP free</span>
                      <span style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: RED }}>View Listing →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-10 flex items-end justify-between">
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2.5rem,5vw,3.5rem)", lineHeight: 1 }}>
              How <span style={{ color: RED }}>it</span> works.
            </h2>
            <p className="hidden md:block" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.4 }}>
              Three acts. No middleman.
            </p>
          </div>
          <ol className="grid gap-10 md:grid-cols-3">
            {[
              { n: "I",   t: "Spot it",        d: "Browse the map or the classifieds feed. Real photos, real prices, real porches in your neighborhood." },
              { n: "II",  t: "Call dibz",       d: "One tap reserves the item. The seller gets a ping, you get the address and a 30-minute hold." },
              { n: "III", t: "Carry it home",   d: "Show up, hand over cash or tap to pay. We never touch the money. We never take a cut." },
            ].map((s) => (
              <li key={s.n} style={{ listStyle: "none", position: "relative" }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "7rem", lineHeight: 1, color: RED, opacity: 0.85 }}>{s.n}</div>
                <div style={{ position: "absolute", top: 8, right: 0, fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.35 }}>Step</div>
                <h3 style={{ fontFamily: SANS, fontSize: 20, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800, marginTop: -16 }}>{s.t}.</h3>
                <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.7, marginTop: 8, maxWidth: 280, opacity: 0.75 }}>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SATURDAY DISPATCH CTA ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, position: "relative", overflow: "hidden" }}>
        <div className="mx-auto max-w-7xl px-6 py-20 text-center" style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", color: RED }}>▼ Subscribe ▼</p>
          <h2 className="mx-auto mt-4" style={{ maxWidth: 680, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 0.95 }}>
            The Saturday Dispatch, delivered to your inbox at 6 AM.
          </h2>
          <p className="mx-auto mt-4" style={{ maxWidth: 480, fontFamily: SERIF, fontSize: 15, lineHeight: 1.65, opacity: 0.7 }}>
            Every sale within a 5-mile radius, ranked by what your neighbors are actually rushing to. Free. Forever.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@address.here"
              className="flex-1"
              style={{ border: `2px solid ${INK}`, padding: "12px 16px", fontFamily: MONO, fontSize: 13, outline: "none" }}
            />
            <button
              type="submit"
              style={{ background: INK, color: CREAM, padding: "12px 24px", fontFamily: MONO, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              Sign Up
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: INK, color: CREAM, borderTop: `2px solid ${INK}` }}>
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
          <div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "2rem", lineHeight: 1 }}>
              Dibz<span style={{ color: RED }}>.</span>
            </div>
            <p className="mt-3" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, lineHeight: 1.6 }}>
              The Neighborhood Classifieds Co.<br />Built for neighbors, by neighbors.
            </p>
          </div>
          {[
            { h: "§ Sections", links: [["Browse", "/browse"], ["The Map", "/map"], ["Sales", "/garage-sales"], ["Dashboard", "/dashboard"]] },
            { h: "§ Sell",     links: [["Post an Ad", "/dashboard?new=1"], ["Rules", "/rules"], ["Dashboard", "/dashboard"]] },
            { h: "§ Account",  links: [["Profile", "/profile"]] },
          ].map((col) => (
            <div key={col.h}>
              <p style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: TEAL_HEX, marginBottom: 10 }}>{col.h}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: CREAM, opacity: 0.6, textDecoration: "none" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, padding: "12px 24px", textAlign: "center", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.4 }}>
          © 1996–{new Date().getFullYear()} Dibz Press · Made with newsprint &amp; nerve
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-25%); } }
        .marquee-track { animation: marquee 50s linear infinite; width: max-content; }
        .marquee-track:hover { animation-play-state: paused; }
        /* Override global h rule for newspaper page */
        .newspaper h1, .newspaper h2, .newspaper h3, .newspaper h4 {
          font-family: "DM Serif Display", "Playfair Display", Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
