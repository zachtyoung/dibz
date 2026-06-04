"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";
import { timeAgo } from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { SellerBadgesCompact } from "@/components/SellerBadges";

const INK = "oklch(0.14 0.02 240)";
const RED = "#c0392b";
const TEAL = "oklch(0.52 0.14 178)";
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
        className="group relative flex w-full overflow-hidden bg-card transition hover:-translate-x-px hover:-translate-y-px"
        style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
      >
        {/* Photo — left column, fixed width, contained */}
        <div className="relative shrink-0 overflow-hidden" style={{ width: 96, borderRight: `2px solid ${INK}` }}>
          <img
            src={listing.image}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            style={{ filter: "saturate(0.75) contrast(1.05)" }}
          />
          {/* Sale type ribbon */}
          {isBlock && (
            <div
              className="absolute bottom-0 left-0 right-0 py-0.5 text-center font-display text-[9px] tracking-widest"
              style={{ background: isEstate ? "#b7791f" : RED, color: "white" }}
            >
              {isEstate ? "ESTATE" : "GARAGE"}
            </div>
          )}
        </div>

        {/* Copy — classified ad style */}
        <div className="flex flex-1 flex-col justify-between p-3">
          {/* Top: price + distance */}
          <div className="flex items-start justify-between gap-1">
            <span
              className="font-display leading-none"
              style={{
                fontSize: 22,
                color: isBlock ? (isEstate ? "#b7791f" : RED) : INK,
                letterSpacing: "0.02em",
              }}
            >
              {isBlock ? "FREE" : `$${listing.price.toLocaleString()}`}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground">{listing.distance}</span>
              <button
                aria-label={saved ? "Unsave" : "Save"}
                onClick={toggle}
                className={`grid h-6 w-6 place-items-center transition ${
                  saved ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Title — serif italic, newspaper classified feel */}
          <h3
            className="mt-1 flex-1 line-clamp-2 leading-snug"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: 13,
              fontWeight: 700,
              color: INK,
            }}
          >
            {listing.title}
          </h3>

          {/* Condition tag */}
          {listing.condition && (
            <span
              className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider text-muted-foreground"
              style={{ border: `1px solid ${INK}`, padding: "1px 4px" }}
            >
              {listing.condition}
            </span>
          )}

          {/* Footer: location + time */}
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {listing.location}
            </div>
            <div
              className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: isEstate ? "#b7791f" : isBlock ? RED : "oklch(0.40 0.025 220)" }}
            >
              {isBlock && listing.date ? (
                <><Calendar className="h-2.5 w-2.5 shrink-0" /><span>{listing.date}</span></>
              ) : (
                <><Clock className="h-2.5 w-2.5 shrink-0" /><span>{listing.postedHoursAgo != null ? timeAgo(listing.postedHoursAgo) : ""}</span></>
              )}
            </div>
            {listing.sellerTrust && (
              <div className="mt-1">
                <SellerBadgesCompact trust={listing.sellerTrust} />
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
