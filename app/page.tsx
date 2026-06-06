"use client";
import { useMemo } from "react";
import { getListings } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import Link from "next/link";

const INK = "oklch(0.16 0.01 60)";
const RED = "#c0392b";
const TEAL_HEX = "#2a7a6f";
const CREAM = "#f5f0e8";
const SERIF = "'DM Serif Display', 'Bodoni 72', Didot, serif";
const BODY = "'Libre Caslon Text', Georgia, serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const SANS = "'Archivo Black', 'Barlow', system-ui, sans-serif";

export default function Landing() {
  const { city } = useCityContext();
  const listings = useMemo(() => city ? getListings(city) : [], [city]);
  const sales = listings.filter((l) => l.isGarageSale);
  const lateEdition = listings.filter((l) => !l.isGarageSale).slice(0, 8);
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  const edition = city ? `${city.name.toUpperCase()} EDITION · ` : "";

  return (
    <div className="newspaper min-h-screen" style={{ color: INK }}>

      {/* ── MASTHEAD ── */}
      <header style={{ borderBottom: `2px solid ${INK}` }}>
        {/* Top strip */}
        <div style={{ borderBottom: `1px solid ${INK}` }}>
          <div
            className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2"
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            <span style={{ opacity: 0.75 }}>Vol. I · No. 01</span>
            <span className="hidden md:block" style={{ opacity: 0.75 }}>{edition}{today}</span>
            <span style={{ opacity: 0.75 }}>Free Online</span>
          </div>
        </div>

        {/* Brand row */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-4">
          <div className="flex items-end gap-3">
            <Link href="/" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(3rem,7vw,5rem)", color: INK, lineHeight: 1, textDecoration: "none" }}>
              Dibz<span style={{ color: RED }}>.</span>
            </Link>
            <span className="mb-1.5 hidden md:block" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.65, lineHeight: 1.5 }}>
              The Neighborhood<br />Classifieds Co.
            </span>
          </div>

          <nav className="flex items-center gap-x-4 overflow-x-auto" style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>
            {[["01", "Browse", "/browse"], ["02", "The Map", "/map"], ["03", "Sales", "/garage-sales"]].map(([n, label, href]) => (
              <Link key={href} href={href} style={{ textDecoration: "none", color: INK, borderBottom: "2px solid transparent", transition: "border-color 0.15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = RED)}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                <span className="hidden md:inline" style={{ color: RED, fontFamily: MONO, fontWeight: 700 }}>{n}/ </span>{label}
              </Link>
            ))}
            <Link
              href="/dashboard?new=1"
              style={{ background: INK, color: CREAM, padding: "7px 12px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", fontWeight: 900, boxShadow: `3px 3px 0 ${RED}`, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              + Post an Ad
            </Link>
          </nav>
        </div>

        {/* Double rule — thin above thick, matches Lovable */}
        <div style={{ height: 1, background: INK, opacity: 0.18 }} />
        <div style={{ height: 1, background: "transparent" }} />
        <div style={{ height: 4, background: INK }} />
      </header>

      {/* ── HERO: 3-col newspaper ── */}
      <section className="mx-auto max-w-7xl px-6 py-10" style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="grid gap-8 md:grid-cols-12">

          {/* Left col — Upcoming Sales */}
          <div className="hidden md:block md:col-span-3 md:border-r-2 md:pr-6" style={{ borderColor: INK }}>
            <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.3em", color: RED }}>▶ This Weekend</p>
            <div className="flex items-center justify-between pb-1 mt-3" style={{ borderBottom: `1px solid ${INK}` }}>
              <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.7 }}>Upcoming Sales</span>
              <Link href="/garage-sales" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: RED, textDecoration: "none" }}>All →</Link>
            </div>
            <ol className="mt-2">
              {sales.slice(0, 5).map((s, i) => (
                <li key={s.id} style={{ borderBottom: `1px dotted ${INK}`, paddingTop: 8, paddingBottom: 8 }}>
                  <Link href={`/listing/${s.id}`} style={{ textDecoration: "none", color: INK, display: "block" }}>
                    <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: RED, marginBottom: 2 }}>
                      {s.saleType === "estate" ? "Estate Sale" : "Garage Sale"} · No. {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                      {s.title}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7, marginTop: 3, display: "flex", justifyContent: "space-between" }}>
                      <span>◉ {s.location.split(",")[0]}</span>
                      {s.date && <span style={{ color: TEAL_HEX }}>{s.date.split("·")[0].trim()}</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            {sales.length === 0 && (
              <p style={{ fontFamily: MONO, fontSize: 10, opacity: 0.4, marginTop: 12 }}>No sales yet — pick a city above.</p>
            )}
          </div>

          {/* Center headline col — no border on center itself; left/right cols carry the rules */}
          <div className="md:col-span-6 relative" style={{ paddingLeft: 24, paddingRight: 24 }}>
            <div className="hidden md:flex justify-between mb-2" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.3 }}>
              <span>╋ trim</span><span>trim ╋</span>
            </div>

            {/* Giant headline — 4 lines matching Lovable exactly */}
            <div style={{ position: "relative" }}>
              <h1 style={{ fontFamily: SERIF, fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.02em", color: INK, fontStyle: "italic", margin: 0, fontSize: "clamp(4rem,14vw,9rem)" }}>
                <span className="block">Scroll</span>
                <span className="block">Less<span style={{ color: RED }}>,</span></span>
                <span className="block">Find</span>
                <span className="block"><span style={{ color: RED }}>More</span><span style={{ fontFamily: BODY, fontStyle: "normal", color: INK }}>.</span></span>
              </h1>
              {/* Halftone dot block — exact Lovable values */}
              <span aria-hidden style={{
                position: "absolute", right: "calc(0.25rem * -4)", top: "33.3333%",
                width: "calc(0.25rem * 40)", height: "calc(0.25rem * 40)",
                backgroundImage: `radial-gradient(oklch(42% .09 195) 1.2px, transparent 1.4px)`,
                backgroundSize: "6px 6px", display: "block", pointerEvents: "none",
              }} />
            </div>

            {/* Sub-copy LEFT, CTAs stacked RIGHT */}
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65, opacity: 0.8, maxWidth: 280 }}>
                Garage sales, estate sales &amp; curbside treasures — plotted on a real map of your real neighborhood. <em>Click. Claim. Carry it home.</em>
              </p>
              <div className="flex flex-col gap-2 shrink-0" style={{ minWidth: 220 }}>
                <Link href="/browse" className="btn-zine" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: INK, color: CREAM,
                  border: `2px solid ${INK}`,
                  padding: "11px 18px", fontFamily: SANS,
                  fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
                  textDecoration: "none", fontWeight: 900, textAlign: "center",
                  boxShadow: `${RED} 5px 5px 0px 0px`,
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                  cursor: "pointer",
                }}>
                  Browse the Map →
                </Link>
                <Link href="/dashboard?new=1" className="btn-zine btn-zine-alt" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: CREAM, color: INK,
                  border: `2px solid ${INK}`,
                  padding: "11px 18px", fontFamily: SANS,
                  fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
                  textDecoration: "none", fontWeight: 900, textAlign: "center",
                  boxShadow: `${TEAL_HEX} 5px 5px 0px 0px`,
                  transition: "transform 0.08s ease, box-shadow 0.08s ease",
                  cursor: "pointer",
                }}>
                  Post Your Sale
                </Link>
              </div>
            </div>
          </div>

          {/* Right late edition col */}
          <aside className="md:col-span-3 md:border-l-2 md:pl-6" style={{ borderColor: INK }}>
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: `1px solid ${INK}` }}>
              <span style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>Latest Edition</span>
              <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: RED, fontWeight: 700 }}>Live</span>
            </div>
            <ol className="mt-2">
              {lateEdition.map((l, i) => (
                <li key={l.id} style={{ borderBottom: `1px dotted ${INK}`, paddingTop: 9, paddingBottom: 9 }}>
                  <Link href={`/listing/${l.id}`} style={{ textDecoration: "none", color: INK, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {/* № label */}
                      <div style={{ fontFamily: MONO, fontSize: 9, opacity: 0.8, letterSpacing: "0.05em", marginBottom: 2 }}>
                        № {String(i + 1).padStart(2, "0")} ·{" "}
                        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, fontWeight: 700, opacity: 1, letterSpacing: "-0.01em" }}>{l.title}</span>
                      </div>
                      {/* Category · location */}
                      <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85 }}>
                        {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Garage") : l.category} · {l.location.split(",")[0]}
                      </div>
                    </div>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, fontWeight: 700, color: l.isGarageSale ? TEAL_HEX : RED, flexShrink: 0 }}>
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
      <div style={{ background: INK, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, overflow: "hidden" }}>
        <div className="flex gap-10 whitespace-nowrap py-2 text-xs uppercase tracking-widest animate-[marquee_50s_linear_infinite]" style={{ color: "oklch(0.965 0.018 85)", fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 12, letterSpacing: "1.2px" }}>
          {[0, 1].map((i) => (
            <div key={i} className="flex shrink-0 gap-10 px-5">
              <span>✦ Neighborhood Garage Sale · Sat 9am · Orchard Breeze</span>
              <span style={{ color: "oklch(0.52 0.14 178)" }}>✦ Estate Sale — 3 Generations · Sun Jun 9 · Fairmount</span>
              <span>✦ Block Party Multi-Family · Sat Jun 15 · College Hill</span>
              <span style={{ color: "oklch(0.78 0.14 82)" }}>✦ Moving Sale · Everything Must Go</span>
              <span>✦ Free Piano · You Haul · Riverside</span>
            </div>
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
            <div key={l} style={{ padding: "24px", background: "var(--background)" }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, lineHeight: 1, color: INK }}>{n}</div>
              <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{l}</div>
              <div className="mt-1" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.65 }}>— {s.replace("— ", "")}</div>
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
            <Link href="/garage-sales" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: INK, textDecoration: "none", opacity: 0.7 }}>
              All sales →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sales.slice(0, 3).map((s, i) => {
              const dotColor = i === 0 ? TEAL_HEX : i === 1 ? RED : INK;
              const saleLabel = s.saleType === "estate" ? "Estate Sale" : s.isGarageSale ? "Garage Sale" : "Multi Sale";
              return (
                <Link key={s.id} href={`/listing/${s.id}`} style={{ textDecoration: "none", color: INK, display: "block" }}>
                  <article style={{ border: `2px solid ${INK}`, position: "relative", background: CREAM }}>
                    {/* Image header */}
                    <div style={{ height: 160, borderBottom: `2px solid ${INK}`, position: "relative", overflow: "hidden" }}>
                      <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8) contrast(1.05)" }} />
                      {/* Label badge */}
                      <div style={{
                        position: "absolute", top: 10, left: 10,
                        border: `2px solid ${INK}`, background: CREAM,
                        padding: "3px 8px", fontFamily: SANS, fontSize: 9,
                        textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900,
                      }}>
                        {saleLabel} · No. {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    {/* Copy */}
                    <div style={{ padding: "16px 20px" }}>
                      {s.date && <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: TEAL_HEX, marginBottom: 8 }}>{s.date.toUpperCase()}</p>}
                      <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 20, lineHeight: 1.25 }}>{s.title}</h3>
                      <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: TEAL_HEX }} />
                        {s.location}
                      </p>
                      {s.description && (
                        <p style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.6, marginTop: 10 }} className="line-clamp-2">{s.description}</p>
                      )}
                      <div style={{ borderTop: `1px dotted ${INK}`, marginTop: 14, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em" }}>RSVP Free</span>
                        <span style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: RED, fontWeight: 700 }}>View Listing →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
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
            <p className="hidden md:block" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.65 }}>
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
                <div style={{ position: "absolute", top: 8, right: 0, fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6 }}>Step</div>
                <h3 style={{ fontFamily: SANS, fontSize: 20, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800, marginTop: -16 }}>{s.t}.</h3>
                <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.7, marginTop: 8, maxWidth: 280, opacity: 0.75 }}>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SATURDAY DISPATCH CTA ── */}
      <section style={{ borderBottom: `2px solid ${INK}`, position: "relative", overflow: "hidden" }}>
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", color: RED }}>▼ Subscribe ▼</p>
          <h2 className="mx-auto mt-4" style={{ maxWidth: 680, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.8rem,5vw,4rem)", lineHeight: 1.05 }}>
            The Saturday <span style={{ fontStyle: "normal", textShadow: `2px 2px 0 ${RED}` }}>Dispatch</span>, delivered to your inbox at 6 AM.
          </h2>
          <p className="mx-auto mt-4" style={{ maxWidth: 480, fontFamily: BODY, fontSize: 15, lineHeight: 1.65 }}>
            Every sale within a 5-mile radius, ranked by what your neighbors are actually rushing to. Free. Forever.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@address.here"
              className="flex-1"
              style={{ border: `2px solid ${INK}`, padding: "12px 16px", fontFamily: MONO, fontSize: 13, outline: "none", background: "transparent" }}
            />
            <button
              type="submit"
              style={{ background: INK, color: CREAM, padding: "12px 24px", fontFamily: SANS, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: `4px 4px 0 ${RED}` }}
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
            <p className="mt-3" style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, lineHeight: 1.6 }}>
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
        .newspaper h1, .newspaper h2, .newspaper h3, .newspaper h4 {
          font-family: "DM Serif Display", "Bodoni 72", Didot, serif;
          letter-spacing: -0.02em;
        }
        .btn-zine:hover { transform: translate(-2px, -2px) !important; box-shadow: ${RED} 7px 7px 0px 0px !important; }
        .btn-zine:active { transform: translate(3px, 3px) !important; box-shadow: ${RED} 2px 2px 0px 0px !important; }
        .btn-zine-alt:hover { transform: translate(-2px, -2px) !important; box-shadow: ${TEAL_HEX} 7px 7px 0px 0px !important; }
        .btn-zine-alt:active { transform: translate(3px, 3px) !important; box-shadow: ${TEAL_HEX} 2px 2px 0px 0px !important; }
      `}</style>
    </div>
  );
}
