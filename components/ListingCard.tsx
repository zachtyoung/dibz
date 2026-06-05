"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";
import { timeAgo } from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { SellerBadgesCompact } from "@/components/SellerBadges";

const INK = "oklch(0.16 0.01 60)";
const RED = "#c0392b";
const TEAL = "oklch(0.48 0.13 178)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO = "'JetBrains Mono', 'Courier New', monospace";
const SANS = "'Archivo Black', system-ui, sans-serif";
const FAVS_KEY = "dibz-favorites";

function useFavorite(id: string) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const favs: string[] = JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]");
      setSaved(favs.includes(id));
    } catch {}
  }, [id]);
  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = !prev;
      try {
        const favs: string[] = JSON.parse(localStorage.getItem(FAVS_KEY) ?? "[]");
        const updated = next ? [...favs, id] : favs.filter((f) => f !== id);
        localStorage.setItem(FAVS_KEY, JSON.stringify(updated));
      } catch {}
      return next;
    });
  }
  return { saved, toggle };
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { saved, toggle } = useFavorite(listing.id);
  const isBlock = listing.isGarageSale;
  const isEstate = listing.saleType === "estate";

  return (
    <Link href={`/listing/${listing.id}`} className="flex">
      <article
        className="group relative flex w-full flex-col overflow-hidden bg-card transition hover:-translate-x-px hover:-translate-y-px"
        style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
      >
        {/* Photo — top, fixed aspect ratio */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", borderBottom: `2px solid ${INK}` }}>
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            style={{ filter: "saturate(0.75) contrast(1.05)" }}
          />
          {isBlock && (
            <div
              className="absolute left-0 top-0 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
              style={{ background: isEstate ? "#b7791f" : RED, color: "white" }}
            >
              {isEstate ? "Estate" : "Garage"}
            </div>
          )}
          <button
            aria-label={saved ? "Unsave" : "Save"}
            onClick={toggle}
            className={`absolute right-2 top-2 grid h-6 w-6 place-items-center bg-card/80 backdrop-blur-sm transition ${
              saved ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            style={{ border: `1.5px solid ${INK}` }}
          >
            <Heart className={`h-3 w-3 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Copy */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: isBlock ? (isEstate ? "#b7791f" : RED) : INK, lineHeight: 1 }}>
              {isBlock ? "Free" : `$${listing.price.toLocaleString()}`}
            </span>
            <h3 className="mt-1 line-clamp-2 leading-snug" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>
              {listing.title}
            </h3>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center gap-1" style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, opacity: 0.7 }}>
              <span className="truncate">◉ {listing.location.split(",")[0]}</span>
              {listing.distance && <span className="ml-auto shrink-0">{listing.distance}</span>}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: isBlock ? RED : INK, opacity: isBlock ? 1 : 0.6 }}>
              {isBlock && listing.date ? listing.date.split("·")[0].trim() : listing.postedHoursAgo != null ? timeAgo(listing.postedHoursAgo) : ""}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
