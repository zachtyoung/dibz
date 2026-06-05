"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, LayoutDashboard, User, Search, Plus } from "lucide-react";
import { useCityContext } from "@/components/CityProvider";
import { CityPrompt } from "@/components/CityPrompt";

const MOCK_USER = { initials: "ZY", name: "Zach Young" };
const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', 'Bodoni 72', Didot, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', 'Helvetica Neue', sans-serif";

export function Header() {
  const { city, setCity } = useCityContext();
  const [picking, setPicking]   = useState(false);
  const [flash, setFlash]       = useState(false);
  const [query, setQuery]       = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const prevCityRef = useRef(city?.slug);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (city?.slug && city.slug !== prevCityRef.current) {
      prevCityRef.current = city.slug;
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
  }, [city?.slug]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
    setShowSearch(false);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  }).toUpperCase();
  const edition = city ? `${city.name.toUpperCase()} EDITION · ` : "";

  return (
    <header className="sticky top-0 z-40 bg-background" style={{ borderBottom: `4px solid ${INK}` }}>
      <style>{`
        @keyframes city-slam {
          0%   { transform: scale(1.3) rotate(-2deg); background: ${RED}; color: white; }
          40%  { transform: scale(0.9) rotate(1deg); }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .city-slam { animation: city-slam 0.6s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
      `}</style>

      {picking && (
        <CityPrompt
          onCity={(c) => { setCity(c); setPicking(false); }}
          onClose={() => setPicking(false)}
          currentCity={city}
        />
      )}

      {/* Top strip */}
      <div style={{ borderBottom: `1px solid ${INK}`, opacity: 0.25 }} />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
        <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.7, color: INK }}>
          Vol. I · No. 01
        </span>
        <button
          onClick={() => setPicking(true)}
          className={`hidden md:flex items-center gap-1.5${flash ? " city-slam" : ""}`}
          style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.7, color: INK, background: "none", border: "none", cursor: "pointer" }}
        >
          <MapPin className="h-3 w-3" style={{ color: RED }} />
          {edition}{today}
        </button>
        <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.7, color: INK }}>
          Free Online
        </span>
      </div>
      <div style={{ height: 1, background: INK, opacity: 0.18 }} />

      {/* Brand row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 px-6 py-3">
        {/* Wordmark */}
        <div className="flex items-end gap-3">
          <Link href="/" style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2rem,5vw,3.5rem)", color: INK, lineHeight: 1, textDecoration: "none" }}>
            Dibz<span style={{ color: RED }}>.</span>
          </Link>
          <span className="mb-1 hidden md:block" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6, lineHeight: 1.5, color: INK }}>
            The Neighborhood<br />Classifieds Co.
          </span>
        </div>

        {/* Nav + actions */}
        <div className="flex items-center gap-x-4 overflow-x-auto">
          {/* Nav links */}
          <nav className="flex items-center gap-x-4" style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>
            {[["Browse", "/browse"], ["The Map", "/map"], ["Sales", "/garage-sales"]].map(([label, href]) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{
                  textDecoration: "none", color: INK, whiteSpace: "nowrap",
                  borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
                  transition: "border-color 0.15s", paddingBottom: 2,
                }}>
                  {label}
                </Link>
              );
            })}
            {/* Dashboard — desktop only */}
            <Link href="/dashboard" className="hidden md:inline" style={{
              textDecoration: "none", color: INK, whiteSpace: "nowrap",
              borderBottom: pathname.startsWith("/dashboard") ? `2px solid ${RED}` : "2px solid transparent",
              transition: "border-color 0.15s", paddingBottom: 2,
            }}>
              Dashboard
            </Link>
          </nav>

          {/* Search toggle */}
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="hidden md:flex items-center gap-1.5 transition hover:opacity-70"
            style={{ color: INK, background: "none", border: "none", cursor: "pointer" }}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* City picker — mobile */}
          <button
            onClick={() => setPicking(true)}
            className={`flex items-center gap-1 md:hidden${flash ? " city-slam" : ""}`}
            style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: INK, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <MapPin className="h-3 w-3" style={{ color: RED }} />
            {city ? city.name : "City"}
          </button>

          {/* Post an Ad */}
          <Link
            href="/dashboard?new=1"
            style={{ background: INK, color: CREAM, padding: "7px 12px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", fontWeight: 900, boxShadow: `3px 3px 0 ${RED}`, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            + Post an Ad
          </Link>

          {/* Avatar dropdown */}
          <AvatarMenu />
        </div>
      </div>

      {/* Thick bottom rule */}
      <div style={{ height: 1, background: INK, opacity: 0.18 }} />
      <div style={{ height: 1, background: "transparent" }} />
      <div style={{ height: 4, background: INK }} />

      {/* Search bar — slides in when toggled */}
      {showSearch && (
        <form onSubmit={handleSearch} className="mx-auto flex max-w-7xl gap-2 px-6 py-2" style={{ borderBottom: `2px solid ${INK}` }}>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search couches, bikes, estate sales…"
            className="flex-1 bg-background focus:outline-none"
            style={{ border: `2px solid ${INK}`, padding: "8px 14px", fontFamily: MONO, fontSize: 12, color: INK }}
          />
          <button type="submit" style={{ background: INK, color: CREAM, padding: "8px 16px", fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, border: "none", cursor: "pointer" }}>
            Search
          </button>
        </form>
      )}
    </header>
  );
}

function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={MOCK_USER.name}
        style={{
          width: 32, height: 32, display: "grid", placeItems: "center",
          fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK,
          background: "transparent", border: `2px solid ${INK}`,
          boxShadow: `2px 2px 0 ${INK}`, cursor: "pointer", letterSpacing: "0.05em",
        }}
      >
        {MOCK_USER.initials}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          background: "var(--background)", border: `2px solid ${INK}`,
          boxShadow: `4px 4px 0 ${INK}`, minWidth: 160, zIndex: 50,
        }}>
          <Link href="/dashboard" onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, textDecoration: "none", color: INK, borderBottom: `1px solid ${INK}` }}
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <Link href="/profile" onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, textDecoration: "none", color: INK }}
          >
            <User className="h-3.5 w-3.5" /> Profile
          </Link>
        </div>
      )}
    </div>
  );
}
