"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Plus, Search, Tag } from "lucide-react";
import { useCityContext } from "@/components/CityProvider";
import { CityPrompt } from "@/components/CityPrompt";

const MOCK_USER = { initials: "ZY", name: "Zach Young" };
const INK = "oklch(0.14 0.02 240)";

export function Header() {
  const { city, setCity } = useCityContext();
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/map?q=${encodeURIComponent(q)}` : "/map");
  }

  return (
    <header className="sticky top-0 z-40 bg-surface" style={{ borderBottom: `2px solid ${INK}` }}>

      {/* ── Main bar ── */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground"
            style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
          >
            <Tag className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wider" style={{ color: INK }}>
            DIBZ
          </span>
        </Link>

        {/* Push sell+profile to right on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Desktop nav */}
        <nav className="ml-3 hidden items-center gap-0.5 md:flex">
          <NavLink href="/browse">Browse</NavLink>
          <NavLink href="/map">Map</NavLink>
          <NavLink href="/garage-sales">Sales</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </nav>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="relative ml-auto hidden flex-1 max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search couches, bikes, estate sales…"
            className="w-full bg-background py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none"
            style={{ border: `2px solid ${INK}` }}
          />
        </form>

        {picking && <CityPrompt onCity={(c) => { setCity(c); setPicking(false); }} onClose={() => setPicking(false)} currentCity={city} />}

        {/* Desktop city picker */}
        <button
          onClick={() => setPicking(true)}
          className="hidden items-center gap-1.5 bg-background px-3 py-1.5 text-sm font-semibold text-foreground md:flex"
          style={{ border: `2px solid ${INK}` }}
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {city ? city.name : "Pick city"}
        </button>

        {/* Sell CTA */}
        <button
          onClick={() => router.push("/dashboard?new=1")}
          className="flex items-center gap-1.5 bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-teal-600"
          style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          <span className="hidden sm:inline">Sell</span>
        </button>

        {/* Profile */}
        <Link href="/profile" className="group" title={MOCK_USER.name}>
          <div
            className="grid h-8 w-8 place-items-center bg-surface font-display text-sm text-foreground transition group-hover:bg-muted"
            style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
          >
            {MOCK_USER.initials}
          </div>
        </Link>
      </div>

      {/* ── Mobile second row: search + city + nav ── */}
      <div className="md:hidden" style={{ borderTop: `2px solid ${INK}` }}>
        {/* City picker row */}
        <div className="flex items-center" style={{ borderBottom: `2px solid ${INK}` }}>
          <button
            onClick={() => setPicking(true)}
            className="flex w-full items-center gap-2 bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{city ? city.name : "Pick city"}</span>
          </button>
        </div>

        {/* Nav row */}
        <nav className="flex items-center overflow-x-auto">
          <NavLink href="/browse">Browse</NavLink>
          <NavLink href="/map">Map</NavLink>
          <NavLink href="/garage-sales">Sales</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-bold tracking-wide transition whitespace-nowrap ${
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      }`}
      style={active ? { borderRight: `2px solid ${INK}`, borderLeft: `2px solid ${INK}` } : {}}
    >
      {children}
    </Link>
  );
}
