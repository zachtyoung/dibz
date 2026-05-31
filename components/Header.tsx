"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Plus, Search, Tag } from "lucide-react";
import { useCityContext } from "@/components/CityProvider";
import { CityPrompt } from "@/components/CityPrompt";

export function Header() {
  const { city, setCity } = useCityContext();
  const [picking, setPicking] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Tag className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wider">
            DIBZ<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink href="/">Browse</NavLink>
          <NavLink href="/map">Map</NavLink>
          <NavLink href="/garage-sales">Garage Sales</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </nav>

        <div className="relative ml-auto hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search couches, bikes, garage sales…"
            className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {picking && <CityPrompt onCity={(c) => { setCity(c); setPicking(false); }} />}
        <button
          onClick={() => setPicking(true)}
          className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-sm text-foreground hover:border-primary md:flex"
        >
          <MapPin className="h-4 w-4 text-primary" />
          {city ? city.name : "Pick city"}
        </button>

        <button className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent hover:shadow-glow">
          <Plus className="h-4 w-4" strokeWidth={3} />
          <span className="hidden sm:inline">Sell</span>
        </button>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        <NavLink href="/">Browse</NavLink>
        <NavLink href="/map">Map</NavLink>
        <NavLink href="/garage-sales">Garage Sales</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-surface font-semibold text-primary"
          : "text-muted-foreground hover:bg-surface hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
