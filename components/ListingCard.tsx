import { Heart, MapPin, Calendar } from "lucide-react";
import type { Listing } from "@/lib/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  const isSale = listing.isGarageSale;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {isSale && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 font-display text-xs tracking-widest text-accent-foreground shadow-glow">
            GARAGE SALE
          </span>
        )}
        <button
          aria-label="Save"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:bg-primary hover:text-primary-foreground"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-2xl text-primary">
            {isSale ? "FREE ENTRY" : `$${listing.price}`}
          </span>
          <span className="text-xs text-muted-foreground">{listing.distance}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.location}
        </div>
        {isSale && listing.date && (
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-accent">
            <Calendar className="h-3 w-3" />
            {listing.date}
          </div>
        )}
      </div>
    </article>
  );
}
