"use client";
import { getCityBySlug } from "@/lib/cities";
import { useCityContext } from "@/components/CityProvider";
import { useListings } from "@/lib/useListings";

const FALLBACK = getCityBySlug("wichita-ks")!;

export function SaleTicker() {
  const { city } = useCityContext();
  const listings = useListings(city ?? FALLBACK);
  const sales = listings.filter((l) => l.isGarageSale);

  if (!sales.length) return null;

  const items = [...sales, ...sales, ...sales];

  return (
    <>
      {/* Spacer so page content doesn't hide behind fixed ticker */}
      <div style={{ height: 34 }} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden select-none"
        style={{
          borderTop: "2px solid oklch(0.14 0.02 240)",
          background: "oklch(0.955 0.016 84)",
          height: 34,
        }}
      >
        <div
          className="flex items-center h-full"
          style={{ animation: "marquee 36s linear infinite" }}
        >
          {items.map((l, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center"
              style={{ fontFamily: "'Courier New', 'Lucida Console', monospace", fontSize: 12 }}
            >
              <span style={{ color: "oklch(0.70 0.02 220)", padding: "0 14px" }}>*</span>
              <span style={{
                background: l.saleType === "estate" ? "#fbbf24" : "oklch(0.14 0.02 240)",
                color: l.saleType === "estate" ? "oklch(0.14 0.02 240)" : "oklch(0.955 0.016 84)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.10em",
                padding: "1px 5px",
                marginRight: 8,
              }}>
                {l.saleType === "estate" ? "ESTATE SALE" : "GARAGE SALE"}
              </span>
              <span style={{ color: "oklch(0.14 0.02 240)", fontWeight: 700, letterSpacing: "0.04em" }}>
                {l.title.toUpperCase()}
              </span>
              <span style={{ color: "oklch(0.52 0.14 178)", marginLeft: 10, fontWeight: 700 }}>
                {l.date?.split("·")[0].trim().toUpperCase()}
              </span>
              <span style={{ color: "oklch(0.55 0.02 220)", marginLeft: 10, fontSize: 11 }}>
                {l.location}
              </span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
