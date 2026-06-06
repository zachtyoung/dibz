import Link from "next/link";
import { Header } from "@/components/Header";
import { LISTINGS } from "@/lib/listings";
import { MapPin, Star, CheckCircle2, Package, DollarSign, Heart, ArrowRight } from "lucide-react";

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const TEAL  = "oklch(0.48 0.13 178)";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

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
  const saved = 8;
  const earnings = 2340;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Profile card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "24px", border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}`, marginBottom: 24, background: "var(--background)" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ width: 72, height: 72, flexShrink: 0, display: "grid", placeItems: "center", background: INK, color: CREAM, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 28, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${RED}` }}>
              {USER.initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1, color: INK, margin: 0 }}>{USER.name}</h1>
                {USER.topSeller && (
                  <span style={{ fontFamily: SANS, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 900, color: CREAM, background: INK, padding: "3px 8px", border: `1.5px solid ${INK}`, boxShadow: `2px 2px 0 ${RED}` }}>
                    Top Seller
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: MONO, fontSize: 10, color: INK, opacity: 0.55, marginTop: 6 }}>
                <MapPin style={{ width: 11, height: 11 }} />
                {USER.location} · Member since {USER.memberSince}
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {USER.phoneVerified && (
                  <Badge icon={<CheckCircle2 style={{ width: 10, height: 10, color: TEAL }} />} label="Phone verified" />
                )}
                {USER.idVerified && (
                  <Badge icon={<CheckCircle2 style={{ width: 10, height: 10, color: TEAL }} />} label="ID verified" />
                )}
                <Badge icon={<Star style={{ width: 10, height: 10, fill: "#f59e0b", color: "#f59e0b" }} />} label={`${USER.rating} · ${USER.sales} sales`} />
                <Badge icon={null} label={`${USER.responseRate}% response · ${USER.responseTime}`} />
              </div>
            </div>

            <Link href="/dashboard"
              style={{ flexShrink: 0, alignSelf: "flex-start", padding: "8px 16px", fontFamily: SANS, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900, color: INK, background: "transparent", border: `2px solid ${INK}`, textDecoration: "none", boxShadow: `2px 2px 0 ${INK}` }}
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats row — almanac style */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `2px solid ${INK}`, background: INK, gap: 1, marginBottom: 32 }}>
          {[
            { icon: <Package style={{ width: 18, height: 18, color: INK, opacity: 0.5 }} />, n: MY_LISTINGS.length.toString(), label: "Active listings" },
            { icon: <DollarSign style={{ width: 18, height: 18, color: INK, opacity: 0.5 }} />, n: `$${earnings.toLocaleString()}`, label: "Earned" },
            { icon: <Heart style={{ width: 18, height: 18, color: INK, opacity: 0.5 }} />, n: saved.toString(), label: "Saved items" },
          ].map(({ icon, n, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "20px 16px", background: "var(--background)" }}>
              {icon}
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.5rem,3vw,2rem)", color: INK, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: SANS, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900, color: INK, opacity: 0.5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* My listings */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 24, color: INK, margin: 0 }}>My Listings</h2>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: SANS, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, color: TEAL, textDecoration: "none" }}>
            Manage all <ArrowRight style={{ width: 11, height: 11 }} />
          </Link>
        </div>

        <div style={{ border: `2px solid ${INK}` }}>
          {MY_LISTINGS.map((l, i) => (
            <Link key={l.id} href={`/listing/${l.id}`}
              className="profile-listing-row"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderTop: i > 0 ? `1px dotted ${INK}` : undefined, textDecoration: "none" }}
            >
              <img src={l.image} alt={l.title} style={{ width: 52, height: 52, flexShrink: 0, objectFit: "cover", filter: "saturate(0.8)", border: `1.5px solid ${INK}` }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: INK, opacity: 0.45, marginTop: 2 }}>{l.location}</div>
              </div>
              <div style={{ flexShrink: 0, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: l.isGarageSale ? TEAL : RED }}>
                {l.isGarageSale ? (l.saleType === "estate" ? "Estate" : "Sale") : `$${l.price.toLocaleString()}`}
              </div>
            </Link>
          ))}
        </div>

      </main>

      <footer style={{ marginTop: 40, borderTop: `1px solid ${INK}20`, padding: "32px 0", textAlign: "center", fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>
        Built for neighbors. <span style={{ color: TEAL, opacity: 1 }}>Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: INK, border: `1.5px solid ${INK}` }}>
      {icon}
      {label}
    </span>
  );
}
