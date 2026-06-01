"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";
import { timeAgo } from "@/lib/listings";
import type { Listing } from "@/lib/listings";
import { SellerBadgesCompact } from "@/components/SellerBadges";

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
    <article className="group relative flex w-full flex-col overflow-hidden bg-card transition hover:-translate-x-px hover:-translate-y-px" style={{border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)"}}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {isBlock && (
          <span
            className={`absolute left-2 top-2 px-2 py-0.5 font-display text-xs tracking-widest ${
              isEstate ? "bg-amber-400 text-amber-950" : "bg-primary text-primary-foreground"
            }`}
            style={{border: "1.5px solid oklch(0.14 0.02 240)", boxShadow: "2px 2px 0 oklch(0.14 0.02 240)"}}
          >
            {isEstate ? "ESTATE" : "GARAGE"}
          </span>
        )}
        <button
          aria-label={saved ? "Unsave" : "Save"}
          onClick={toggle}
          className={`absolute right-2 top-2 grid h-8 w-8 place-items-center transition ${
            saved ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
          style={{border: "1.5px solid oklch(0.14 0.02 240)"}}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`font-display text-2xl tracking-wide ${isBlock ? (isEstate ? "text-amber-600" : "text-primary") : "text-primary"}`}>
            {isBlock ? "FREE ENTRY" : `$${listing.price.toLocaleString()}`}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{listing.distance}</span>
        </div>
        {listing.condition && (
          <span className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground" style={{border: "1.5px solid oklch(0.14 0.02 240)"}}>
            {listing.condition}
          </span>
        )}
        <h3 className="mt-1 flex-1 line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {listing.location}
        </div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${isEstate ? "text-amber-600" : isBlock ? "text-primary" : "text-muted-foreground"}`}>
          {isBlock && listing.date ? (
            <><Calendar className="h-3 w-3 shrink-0" /><span>{listing.date}</span></>
          ) : (
            <><Clock className="h-3 w-3 shrink-0" /><span>{listing.postedHoursAgo != null ? timeAgo(listing.postedHoursAgo) : ""}</span></>
          )}
        </div>
        {listing.sellerTrust && (
          <div className="mt-2">
            <SellerBadgesCompact trust={listing.sellerTrust} />
          </div>
        )}
      </div>
    </article>
    </Link>
  );
}
