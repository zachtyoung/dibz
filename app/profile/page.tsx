import Link from "next/link";
import { Header } from "@/components/Header";
import { LISTINGS } from "@/lib/listings";
import { MapPin, Star, CheckCircle2, Package, DollarSign, Heart, ArrowRight } from "lucide-react";

const INK = "oklch(0.14 0.02 240)";

const USER = {
  initials: "ZY",
  name: "Zach Young",
  location: "Wichita, KS",
  memberSince: "Mar 2023",
  rating: 4.9,
  sales: 38,
  responseRate: 97,
  responseTime: "< 1h",
  phoneVerified: true,
  idVerified: true,
  topSeller: true,
};

const MY_LISTINGS = LISTINGS.slice(0, 5);

export default function ProfilePage() {
  const totalViews = 1204;
  const saved = 8;
  const earnings = 2340;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 md:px-8">

        {/* Profile card */}
        <div
          className="mb-8 flex flex-col gap-6 bg-surface p-6 sm:flex-row sm:items-start"
          style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
        >
          {/* Avatar */}
          <div
            className="grid h-20 w-20 shrink-0 place-items-center bg-primary font-display text-4xl text-primary-foreground"
            style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
          >
            {USER.initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-4xl tracking-wide">{USER.name}</h1>
              {USER.topSeller && (
                <span
                  className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground bg-primary"
                  style={{ border: `1.5px solid ${INK}` }}
                >
                  Top Seller
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {USER.location} · Member since {USER.memberSince}
            </div>

            {/* Trust badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {USER.phoneVerified && (
                <Badge icon={<CheckCircle2 className="h-3 w-3" />} label="Phone verified" />
              )}
              {USER.idVerified && (
                <Badge icon={<CheckCircle2 className="h-3 w-3" />} label="ID verified" />
              )}
              <Badge icon={<Star className="h-3 w-3 fill-amber-400 text-amber-400" />} label={`${USER.rating} · ${USER.sales} sales`} />
              <Badge icon={null} label={`${USER.responseRate}% response · ${USER.responseTime}`} />
            </div>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 self-start px-4 py-2 text-xs font-bold uppercase tracking-widest transition hover:bg-muted"
            style={{ border: `2px solid ${INK}` }}
          >
            Edit profile
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mb-8 grid grid-cols-3"
          style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
        >
          <Stat icon={<Package className="h-5 w-5 text-primary" />} n={MY_LISTINGS.length.toString()} label="Active listings" />
          <Stat icon={<DollarSign className="h-5 w-5 text-primary" />} n={`$${earnings.toLocaleString()}`} label="Earned" border />
          <Stat icon={<Heart className="h-5 w-5 text-primary" />} n={saved.toString()} label="Saved items" border />
        </div>

        {/* My listings */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">My Listings</h2>
          <Link href="/dashboard" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            Manage all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-0" style={{ border: `2px solid ${INK}` }}>
          {MY_LISTINGS.map((l, i) => (
            <Link
              key={l.id}
              href={`/listing/${l.id}`}
              className="flex items-center gap-4 bg-surface p-3 transition hover:bg-muted"
              style={i > 0 ? { borderTop: `2px solid ${INK}` } : {}}
            >
              <img
                src={l.image}
                alt={l.title}
                className="h-14 w-14 shrink-0 object-cover"
                style={{ border: `1.5px solid ${INK}` }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{l.title}</div>
                <div className="text-xs text-muted-foreground">{l.location}</div>
              </div>
              <div className="shrink-0 font-display text-xl text-primary">
                {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Sale") : `$${l.price.toLocaleString()}`}
              </div>
            </Link>
          ))}
        </div>

      </main>

      <footer className="mt-10 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      style={{ border: `1.5px solid ${INK}` }}
    >
      {icon}
      {label}
    </span>
  );
}

function Stat({ icon, n, label, border }: { icon: React.ReactNode; n: string; label: string; border?: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-5"
      style={border ? { borderLeft: `2px solid ${INK}` } : {}}
    >
      {icon}
      <div className="font-display text-3xl">{n}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
