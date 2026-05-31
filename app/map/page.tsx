"use client";
import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { getListings, CATEGORIES } from "@/lib/listings";
import { useCityContext } from "@/components/CityProvider";
import { getCityBySlug } from "@/lib/cities";

const SF = getCityBySlug("san-francisco-ca")!;

function MapContent() {
  const { city, loading } = useCityContext();
  const activeCity = city ?? SF;
  const [cat, setCat] = useState("All");
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase().trim() ?? "";
  const listings = useMemo(() => getListings(activeCity), [activeCity]);
  const filtered = useMemo(() => {
    let result = cat === "All" ? listings : listings.filter((l) => l.category === cat);
    if (q) result = result.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.seller.toLowerCase().includes(q)
    );
    return result;
  }, [listings, cat, q]);
  const center: [number, number] = [activeCity.lat, activeCity.lng];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      {/* List panel */}
      <aside className="order-2 flex w-full flex-col border-r border-border/60 bg-background lg:order-1 lg:w-[480px] lg:max-w-[40vw]">
        <div className="border-b border-border/60 px-5 py-4">
          <h1 className="font-display text-3xl tracking-wide">
            {q ? `"${q}"` : "On the map"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Finding your city…"
              : `${filtered.length} ${filtered.length === 1 ? "result" : "results"} in ${activeCity.name}`}
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 lg:flex-1 lg:overflow-y-auto">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </aside>

      {/* Map */}
      <div className="relative order-1 h-[46vh] min-h-[340px] shrink-0 bg-surface lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
        <ListingsMap listings={filtered} center={center} height="100%" />
      </div>
    </div>
  );
}

export default function MapView() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <Suspense fallback={null}>
        <MapContent />
      </Suspense>
    </div>
  );
}
