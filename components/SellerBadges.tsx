import type { SellerTrust } from "@/lib/listings";

const INK = "oklch(0.14 0.02 240)";

/* Single pill badge */
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}
      style={{ border: `1.5px solid ${INK}` }}
    >
      {label}
    </span>
  );
}

/* Star rating display */
export function StarRating({ rating, sales }: { rating: number; sales: number }) {
  if (rating === 0) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < full ? "text-amber-500" : i === full && half ? "text-amber-400" : "text-muted-foreground/30"
          }
        >
          ★
        </span>
      ))}
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span>· {sales} sales</span>
    </span>
  );
}

/* Compact badge strip — used on listing cards */
export function SellerBadgesCompact({ trust }: { trust: SellerTrust }) {
  return (
    <div className="flex flex-wrap gap-1">
      {trust.topSeller && <Badge label="Top seller" color="bg-amber-400/20 text-amber-700" />}
      {trust.idVerified && <Badge label="ID verified" color="bg-primary/10 text-primary" />}
      {trust.phoneVerified && !trust.idVerified && <Badge label="Verified" color="bg-primary/10 text-primary" />}
      {trust.vouched && <Badge label="Neighbor" color="bg-surface text-muted-foreground" />}
    </div>
  );
}

/* Full trust panel — used on listing detail page */
export function SellerTrustPanel({ trust, sellerName }: { trust: SellerTrust; sellerName: string }) {
  const INK_STYLE = { border: `2px solid ${INK}` };

  return (
    <div className="space-y-3">
      {/* Seller header */}
      <div className="flex items-center gap-3">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center bg-primary/15 font-display text-2xl text-primary"
          style={INK_STYLE}
        >
          {sellerName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-foreground">{sellerName}</p>
            {trust.topSeller && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-700" style={{ border: `1.5px solid ${INK}` }}>
                Top seller
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Member since {trust.memberSince}</p>
        </div>
      </div>

      {/* Star rating */}
      {trust.rating > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={trust.rating} sales={trust.sales} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface px-3 py-2.5" style={INK_STYLE}>
          <p className="font-display text-xl text-primary">{trust.responseRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Response rate</p>
        </div>
        <div className="bg-surface px-3 py-2.5" style={INK_STYLE}>
          <p className="font-display text-xl text-primary">{trust.responseTime}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg reply time</p>
        </div>
      </div>

      {/* Verification badges */}
      <div className="flex flex-wrap gap-2">
        <VerifyChip label="Phone verified" active={trust.phoneVerified} />
        <VerifyChip label="ID verified" active={trust.idVerified} />
        <VerifyChip label="Neighbor vouched" active={trust.vouched} />
      </div>
    </div>
  );
}

function VerifyChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground/50 line-through"
      }`}
      style={{ border: `2px solid oklch(0.14 0.02 240)` }}
    >
      <span className={`h-1.5 w-1.5 ${active ? "bg-primary" : "bg-muted-foreground/30"}`} />
      {label}
    </span>
  );
}
