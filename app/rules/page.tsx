import Link from "next/link";
import { Header } from "@/components/Header";

const INK = "oklch(0.14 0.02 240)";

const PROHIBITED = [
  {
    category: "Drugs & Paraphernalia",
    items: ["Prescription meds without a valid prescription", "Recreational or illegal drugs", "Drug paraphernalia of any kind", "Unsafe or unverified supplements"],
  },
  {
    category: "Weapons & Explosives",
    items: ["Firearms, ammo, and accessories", "Explosives, fireworks, or incendiary devices", "Knives marketed as weapons", "Paintball guns, BB guns, tasers, pepper spray"],
  },
  {
    category: "Animals",
    items: ["Live animals of any kind — pets, livestock, birds", "Animal parts — fur, hide, leather, wool, bone", "Taxidermy"],
  },
  {
    category: "Alcohol & Tobacco",
    items: ["Alcoholic beverages", "Tobacco products and e-cigarettes", "Kits for making alcohol or tobacco"],
  },
  {
    category: "Adult & Explicit Items",
    items: ["Adult products or content of any kind", "Items with sexually explicit positioning or marketing"],
  },
  {
    category: "Counterfeit & Stolen Goods",
    items: ["Knockoffs or replicas of branded goods", "Unauthorized copies of copyrighted works", "Items you have reason to believe are stolen"],
  },
  {
    category: "Services",
    items: ["Domestic services (cleaning, lawn care, plumbing)", "Financial or wellness services", "Medical or legal services of any kind", "Job postings or gig offers"],
  },
  {
    category: "Healthcare Products",
    items: ["Contact lenses and medical devices", "Testing kits (glucose, pregnancy, drug)", "First-aid kits marketed as medical supplies", "Breast pumps and other regulated items"],
  },
  {
    category: "Digital & Intangible Goods",
    items: ["Gift cards and store credit", "Subscriptions or digital memberships", "Software licenses", "Items that facilitate unauthorized access to digital media"],
  },
  {
    category: "Fraudulent or Misleading Listings",
    items: ["Listings with false or deceptive descriptions", "Price manipulation or bait-and-switch", "Listings with no genuine intent to sell", "Spam, duplicates, or listings used to farm messages"],
  },
];

const BEST_PRACTICES = [
  { icon: "📸", rule: "Use real photos", detail: "No stock photos, no screenshots. Buyers need to see what they're actually getting." },
  { icon: "📐", rule: "Include measurements", detail: "For furniture, appliances, or anything where size matters — include dimensions in the description." },
  { icon: "🔍", rule: "Be honest about condition", detail: "Note scratches, missing parts, stains, wear. One honest photo is worth ten words." },
  { icon: "📍", rule: "Post your neighborhood", detail: "You don't need to share your exact address publicly — neighborhood is enough for buyers to decide if they can make it work." },
  { icon: "💬", rule: "Reply within 24 hours", detail: "Responsive sellers close faster. If you can't sell anymore, mark it sold or take it down." },
  { icon: "💵", rule: "Price it to move", detail: "Check what similar items sold for nearby. Listing free is always an option — the best deals find the best buyers." },
];

export default function RulesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
          <span
            className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary"
            style={{ border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
          >
            Commerce Policy
          </span>
          <h1 className="mt-4 font-display text-6xl tracking-tight md:text-8xl">
            The Rules<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Dibz is a neighborhood marketplace built on trust. These rules protect buyers and sellers alike.
            Violating them gets your listing removed — repeat violations get your account removed.
            No appeals, no exceptions.
          </p>
          <p className="mt-3 text-sm font-semibold text-foreground">
            Sellers are responsible for complying with all applicable local, state, and federal laws.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">

        {/* Prohibited */}
        <h2 className="mb-6 font-display text-4xl tracking-wide">
          What you <span className="text-primary">cannot</span> sell
        </h2>

        <div className="mb-14 flex flex-col gap-0" style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>
          {PROHIBITED.map(({ category, items }, i) => (
            <div
              key={category}
              className="px-5 py-4"
              style={i > 0 ? { borderTop: `2px solid ${INK}` } : {}}
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{category}</div>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Best practices */}
        <h2 className="mb-6 font-display text-4xl tracking-wide">
          How to sell <span className="text-primary">well</span>
        </h2>

        <div className="mb-14 grid gap-0 sm:grid-cols-2" style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>
          {BEST_PRACTICES.map(({ icon, rule, detail }, i) => (
            <div
              key={rule}
              className="px-5 py-5"
              style={{
                borderRight: i % 2 === 0 ? `2px solid ${INK}` : undefined,
                borderTop: i >= 2 ? `2px solid ${INK}` : undefined,
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="font-bold text-foreground">{rule}</span>
              </div>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>

        {/* Enforcement */}
        <div
          className="mb-14 px-6 py-6"
          style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
        >
          <h3 className="mb-3 font-display text-2xl tracking-wide">Enforcement</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" />Prohibited listings are removed without notice.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" />Repeat violations result in permanent account removal.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" />Fraudulent listings may be reported to local authorities.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary" />See something wrong? Use the Report button on any listing.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard?new=1"
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-teal-600"
            style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
          >
            Post a listing →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
            style={{ border: `2px solid ${INK}` }}
          >
            Back to browsing
          </Link>
        </div>
      </div>

      <footer className="mt-10 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Built for neighbors. <span className="text-primary">Dibz</span> — list free, sell local.
      </footer>
    </div>
  );
}
