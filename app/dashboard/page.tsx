"use client";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { LISTINGS, CATEGORIES, CONDITIONS, type Listing, type Condition } from "@/lib/listings";
import {
  Plus,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Send,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Sparkles,
  AlertCircle,
  Tag,
} from "lucide-react";


type Status = "active" | "sold" | "draft";

type SellerListing = Listing & {
  status: Status;
  views: number;
  saves: number;
  messages: number;
  postedDays: number;
};

type Thread = {
  id: string;
  from: string;
  listingId: string;
  unread: boolean;
  messages: { id: string; from: "buyer" | "me"; text: string; time: string }[];
};

const SEED_LISTINGS: SellerListing[] = LISTINGS.slice(0, 6).map((l, i) => ({
  ...l,
  status: i === 2 ? "sold" : i === 5 ? "draft" : "active",
  views: [248, 1240, 89, 3100, 412, 12][i] ?? 100,
  saves: [12, 84, 6, 211, 28, 0][i] ?? 5,
  messages: [3, 19, 1, 42, 7, 0][i] ?? 1,
  postedDays: [2, 5, 11, 1, 7, 0][i] ?? 3,
}));

const SEED_THREADS: Thread[] = [
  {
    id: "t1",
    from: "Jordan K.",
    listingId: "2",
    unread: true,
    messages: [
      { id: "1", from: "buyer", text: "Hey! Is this still available? Could I swing by tomorrow around 4?", time: "12m" },
    ],
  },
  {
    id: "t2",
    from: "Priya S.",
    listingId: "4",
    unread: true,
    messages: [
      { id: "1", from: "buyer", text: "Would you take $1,300 cash today?", time: "1h" },
    ],
  },
  {
    id: "t3",
    from: "Sam T.",
    listingId: "1",
    unread: false,
    messages: [
      { id: "1", from: "buyer", text: "Beautiful piece. Do you have more photos of the back?", time: "3h" },
      { id: "2", from: "me", text: "Just texted you some! Let me know what you think.", time: "2h" },
    ],
  },
  {
    id: "t4",
    from: "Renee F.",
    listingId: "5",
    unread: false,
    messages: [
      { id: "1", from: "buyer", text: "Picking up tonight at 7 — works for me!", time: "yesterday" },
      { id: "2", from: "me", text: "Perfect, see you then 👍", time: "yesterday" },
    ],
  },
];

const STOCK_IMG = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop&auto=format&q=70";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<SellerListing[]>(SEED_LISTINGS);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [tab, setTab] = useState<"listings" | "messages" | "sales">("listings");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; listing: SellerListing | null }>({ open: false, listing: null });
  const [importer, setImporter] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"title" | "status" | "views" | "saves" | "messages" | "price">("views");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditor({ open: true, listing: null });
      router.replace("/dashboard");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === "active");
    const sold = listings.filter((l) => l.status === "sold");
    const earnings = sold.reduce((sum, l) => sum + l.price, 0);
    const views = listings.reduce((sum, l) => sum + l.views, 0);
    return {
      active: active.length,
      sold: sold.length,
      earnings,
      views,
      unread: threads.filter((m) => m.unread).length,
    };
  }, [listings, threads]);

  const filtered = useMemo(() => {
    const base = listings
      .filter((l) => filter === "all" || l.status === filter)
      .filter((l) => !query || l.title.toLowerCase().includes(query.toLowerCase()));
    return [...base].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "price") { av = a.price; bv = b.price; }
      else if (sortKey === "title") { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      else if (sortKey === "status") { av = a.status; bv = b.status; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [listings, filter, query, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  // ---- Listing actions ----
  function openNew() {
    setEditor({ open: true, listing: null });
  }
  function openEdit(l: SellerListing) {
    setEditor({ open: true, listing: l });
  }
  function saveListing(data: Pick<SellerListing, "id" | "title" | "price" | "category" | "condition" | "location" | "image" | "status" | "description">) {
    setListings((prev) => {
      const exists = prev.find((p) => p.id === data.id);
      if (exists) {
        setToast("Listing updated");
        return prev.map((p) => (p.id === data.id ? { ...p, ...data } : p));
      }
      setToast("Listing posted");
      return [
        {
          ...data,
          distance: "0.1 mi",
          seller: "Maya R.",
          lat: 37.7599,
          lng: -122.4148,
          views: 0,
          saves: 0,
          messages: 0,
          postedDays: 0,
        },
        ...prev,
      ];
    });
    setEditor({ open: false, listing: null });
  }
  function deleteListing(id: string) {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    setListings((prev) => prev.filter((p) => p.id !== id));
    setToast("Listing deleted");
  }
  function toggleSold(id: string) {
    setListings((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "sold" ? "active" : "sold" }
          : p,
      ),
    );
    setToast("Status updated");
  }
  function publishDraft(id: string) {
    setListings((prev) => prev.map((p) => (p.id === id ? { ...p, status: "active", postedDays: 0 } : p)));
    setToast("Draft published");
  }

  // ---- Messages ----
  function openThread(id: string) {
    setActiveThread(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  }
  function sendReply(threadId: string, text: string) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, { id: String(Date.now()), from: "me", text, time: "now" }],
            }
          : t,
      ),
    );
  }

  const activeThreadObj = threads.find((t) => t.id === activeThread) ?? null;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Title bar */}
      <section style={{ borderBottom: "2px solid oklch(0.16 0.01 60)" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <p
            className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary px-3 py-1"
            style={{ border: "2px solid oklch(0.16 0.01 60)", boxShadow: "3px 3px 0 oklch(0.16 0.01 60)" }}
          >
            Seller dashboard
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
            Hey, Zach<span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <span className="text-foreground font-semibold">{stats.unread} new messages</span> and{" "}
            <span className="text-foreground font-semibold">{stats.active} active listings</span>.
          </p>
          {/* Actions — full width row on mobile */}
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={openNew}
              className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:-translate-x-px hover:-translate-y-px w-full"
              style={{ border: "2px solid oklch(0.16 0.01 60)", boxShadow: "3px 3px 0 oklch(0.16 0.01 60)" }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> New listing
            </button>
            <div className="flex gap-2">
              <Link
                href="/garage-sales"
                className="inline-flex flex-1 items-center justify-center gap-2 bg-surface px-4 py-3 text-sm font-semibold transition hover:-translate-x-px hover:-translate-y-px"
                style={{ border: "2px solid oklch(0.16 0.01 60)", boxShadow: "3px 3px 0 oklch(0.16 0.01 60)" }}
              >
                <Calendar className="h-4 w-4 text-primary" /> Host a sale
              </Link>
              <button
                onClick={() => setImporter(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 bg-surface px-4 py-3 text-sm font-semibold transition hover:-translate-x-px hover:-translate-y-px"
                style={{ border: "2px solid oklch(0.16 0.01 60)", boxShadow: "3px 3px 0 oklch(0.16 0.01 60)" }}
              >
                <Upload className="h-4 w-4 text-primary" /> Import
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={DollarSign} label="Earnings" value={`$${stats.earnings.toLocaleString()}`} sub="This month" trend="+18%" />
          <StatCard icon={Eye} label="Total views" value={stats.views.toLocaleString()} sub="Last 30 days" trend="+24%" />
          <StatCard icon={Package} label="Active listings" value={String(stats.active)} sub={`${stats.sold} sold`} />
          <StatCard
            icon={MessageCircle}
            label="Unread"
            value={String(stats.unread)}
            sub={`${threads.length} total`}
            highlight={stats.unread > 0}
            onClick={() => setTab("messages")}
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
        <div
          className="flex flex-wrap items-stretch"
          style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}
        >
          <TabBtn active={tab === "listings"} onClick={() => setTab("listings")}>
            Listings <span className="ml-1.5 text-xs text-muted-foreground">{listings.length}</span>
          </TabBtn>
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")}>
            Messages
            {stats.unread > 0 && (
              <span
                className="ml-1.5 bg-accent px-1.5 text-[10px] font-bold text-accent-foreground"
                style={{ border: "2px solid oklch(0.14 0.02 240)" }}
              >
                {stats.unread}
              </span>
            )}
          </TabBtn>
          <TabBtn active={tab === "sales"} onClick={() => setTab("sales")}>
            Performance
          </TabBtn>
        </div>
      </section>

      {/* Tab content */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {tab === "listings" && (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your listings…"
                  className="w-full bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["all", "active", "sold", "draft"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="overflow-x-auto bg-card"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              <table className="w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "11%" }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}>
                    {(
                      [
                        { key: "title", label: "Item", align: "left" },
                        { key: "status", label: "Status", align: "left" },
                        { key: "views", label: "Views", align: "left", icon: Eye },
                        { key: "saves", label: "Saves", align: "left", icon: Heart },
                        { key: "messages", label: "Msgs", align: "left", icon: MessageCircle },
                        { key: "price", label: "Price", align: "left" },
                      ] as { key: typeof sortKey; label: string; align: "left" | "right"; icon?: React.ElementType }[]
                    ).map(({ key, label, align, icon: ColIcon }) => {
                      const active = sortKey === key;
                      const SortIcon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                      return (
                        <th
                          key={key}
                          onClick={() => toggleSort(key)}
                          className={`select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition ${align === "right" ? "text-right" : "text-left"}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {ColIcon && <ColIcon className="h-3.5 w-3.5 shrink-0" />}
                            {label}
                            <SortIcon className="h-3 w-3 shrink-0" />
                          </span>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-sm text-muted-foreground">
                        No listings match your filters.{" "}
                        <button onClick={openNew} className="font-semibold text-primary hover:underline">
                          Post your first one →
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((l) => (
                      <ListingRow
                        key={l.id}
                        l={l}
                        onEdit={() => openEdit(l)}
                        onDelete={() => deleteListing(l.id)}
                        onToggleSold={() => toggleSold(l.id)}
                        onPublish={() => publishDraft(l.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "messages" && (
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div
              className="overflow-hidden bg-card"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              {threads.length === 0 && (
                <div className="px-5 py-16 text-center text-sm text-muted-foreground">No messages yet.</div>
              )}
              {threads.map((m, i) => {
                const listing = listings.find((l) => l.id === m.listingId);
                const last = m.messages[m.messages.length - 1];
                return (
                  <button
                    key={m.id}
                    onClick={() => openThread(m.id)}
                    className={`flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-surface-elevated ${
                      i === threads.length - 1 ? "" : ""
                    } ${activeThread === m.id ? "bg-surface-elevated" : ""}`}
                    style={i !== threads.length - 1 ? { borderBottom: "2px solid oklch(0.14 0.02 240)" } : undefined}
                  >
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center bg-primary/15 font-display text-lg text-primary"
                      style={{ border: "2px solid oklch(0.14 0.02 240)" }}
                    >
                      {m.from.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${m.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                          {m.from}
                        </span>
                        {m.unread && <span className="h-1.5 w-1.5 bg-accent" />}
                        <span className="ml-auto text-xs text-muted-foreground">{last?.time}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs uppercase tracking-wider text-primary">
                        re: {listing?.title ?? "Listing"}
                      </div>
                      <p className={`mt-1 line-clamp-1 text-sm ${m.unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {last?.from === "me" ? "You: " : ""}
                        {last?.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="bg-card"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              {activeThreadObj ? (
                <ThreadView
                  thread={activeThreadObj}
                  listing={listings.find((l) => l.id === activeThreadObj.listingId)}
                  onSend={(text) => sendReply(activeThreadObj.id, text)}
                />
              ) : (
                <div className="grid h-full min-h-[320px] place-items-center px-6 text-center text-sm text-muted-foreground">
                  Pick a conversation to reply.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "sales" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className="bg-card p-6"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              <h3 className="font-display text-2xl tracking-wide">Top performers</h3>
              <p className="text-xs text-muted-foreground">By views, last 30 days</p>
              <div className="mt-5 space-y-4">
                {[...listings]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 4)
                  .map((l, i) => {
                    const max = Math.max(...listings.map((x) => x.views), 1);
                    const pct = (l.views / max) * 100;
                    return (
                      <div key={l.id}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            <span className="mr-2 font-display text-primary">{i + 1}.</span>
                            {l.title}
                          </span>
                          <span className="font-display text-lg text-primary">{l.views.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden bg-muted">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div
              className="bg-card p-6"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              <h3 className="font-display text-2xl tracking-wide">Recent activity</h3>
              <p className="text-xs text-muted-foreground">Buyers interacting with your listings</p>
              <ul className="mt-5 space-y-4 text-sm">
                <ActivityRow icon={CheckCircle2} color="text-primary" text={`Sold ${listings.find((l) => l.status === "sold")?.title ?? "an item"}`} sub="2 days ago" />
                <ActivityRow icon={Heart} color="text-accent" text="MacBook Pro saved by 12 people today" sub="Trending — boost to top?" />
                <ActivityRow icon={MessageCircle} color="text-primary" text={`${stats.unread} unread messages waiting`} sub="Reply within 1h for best results" />
                <ActivityRow icon={TrendingUp} color="text-accent" text="Your views are up 24% this week" sub="Above neighborhood average" />
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Import modal */}
      {importer && (
        <ImportModal
          onClose={() => setImporter(false)}
          onImport={(data) => {
            setImporter(false);
            setEditor({ open: true, listing: { ...data, views: 0, saves: 0, messages: 0, postedDays: 0, distance: "0.1 mi", seller: "Zach", lat: 37.6872, lng: -97.3301 } as SellerListing });
          }}
        />
      )}

      {/* Editor modal */}
      {editor.open && (
        <ListingEditor
          initial={editor.listing}
          onClose={() => setEditor({ open: false, listing: null })}
          onSave={saveListing}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-foreground"
          style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
        >
          <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
          {toast}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, trend, highlight, onClick,
}: {
  icon: React.ElementType; label: string; value: string; sub: string; trend?: string; highlight?: boolean; onClick?: () => void;
}) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`relative overflow-hidden p-5 text-left transition hover:-translate-x-px hover:-translate-y-px ${
        highlight ? "bg-accent/5" : "bg-card"
      }`}
      style={{
        border: "2px solid oklch(0.14 0.02 240)",
        boxShadow: "3px 3px 0 oklch(0.14 0.02 240)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className={`grid h-10 w-10 place-items-center ${highlight ? "bg-accent text-accent-foreground" : "bg-primary/15 text-primary"}`}
          style={{ border: "2px solid oklch(0.14 0.02 240)" }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
            style={{ border: "2px solid oklch(0.14 0.02 240)" }}
          >
            <ArrowUpRight className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-4xl tracking-wide">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground/80">{sub}</div>
    </Comp>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center px-5 py-3 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      style={
        active
          ? { border: "2px solid oklch(0.14 0.02 240)", borderBottom: "2px solid transparent", marginBottom: "-2px" }
          : { borderBottom: "none" }
      }
    >
      {children}
    </button>
  );
}

function ListingRow({
  l, onEdit, onDelete, onToggleSold, onPublish,
}: {
  l: SellerListing; onEdit: () => void; onDelete: () => void; onToggleSold: () => void; onPublish: () => void;
}) {
  const INK = "oklch(0.14 0.02 240)";
  const statusStyle =
    l.status === "active" ? "bg-primary/15 text-primary"
    : l.status === "sold" ? "bg-muted text-muted-foreground"
    : "bg-accent/15 text-accent";

  const actions = (
    <div className="flex items-center gap-1">
      {l.status !== "draft" && (
        <button
          onClick={onToggleSold}
          title={l.status === "sold" ? "Mark active" : "Mark sold"}
          className="grid h-8 w-8 place-items-center text-muted-foreground transition hover:bg-surface hover:text-primary"
        >
          {l.status === "sold" ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </button>
      )}
      <button onClick={onEdit} className="grid h-8 w-8 place-items-center text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Edit">
        <Edit3 className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="grid h-8 w-8 place-items-center text-muted-foreground transition hover:bg-surface hover:text-destructive" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const statusBadge = l.status === "draft" ? (
    <button
      onClick={onPublish}
      className="h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-accent transition"
      style={{ border: `2px solid ${INK}` }}
    >
      Publish
    </button>
  ) : (
    <span
      className={`inline-block w-16 py-1 text-center text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}
      style={{ border: `2px solid ${INK}` }}
    >
      {l.status}
    </span>
  );

  return (
    <>
      {/* Mobile card — hidden on md+ */}
      <tr className="md:hidden" style={{ borderBottom: `2px solid ${INK}` }}>
        <td colSpan={7} className="p-3">
          <div className="flex gap-3">
            <img
              src={l.image}
              alt={l.title}
              className="h-16 w-16 shrink-0 object-cover"
              style={{ border: `2px solid ${INK}` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className={`truncate text-sm font-semibold ${l.status === "sold" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {l.title}
                </div>
                <span className="font-display text-lg text-primary shrink-0">${l.price.toLocaleString()}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{l.location}</span>
                <span>·</span>
                <span>{l.status === "draft" ? "Draft" : `${l.postedDays}d ago`}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {statusBadge}
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{l.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{l.saves}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{l.messages}</span>
                </div>
                {actions}
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Desktop row — hidden below md */}
      <tr className="hidden md:table-row transition hover:bg-surface-elevated" style={{ borderBottom: `2px solid ${INK}` }}>
        <td className="px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={l.image} alt={l.title} className="h-12 w-12 shrink-0 object-cover" style={{ border: `2px solid ${INK}` }} />
            <div className="min-w-0">
              <div className={`truncate text-sm font-semibold ${l.status === "sold" ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{l.location}</span>
                <span>·</span>
                <span>{l.status === "draft" ? "Draft" : `${l.postedDays}d ago`}</span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">{statusBadge}</td>
        <td className="px-4 py-3 text-sm text-foreground">{l.views.toLocaleString()}</td>
        <td className="px-4 py-3 text-sm text-foreground">{l.saves.toLocaleString()}</td>
        <td className="px-4 py-3 text-sm text-foreground">{l.messages.toLocaleString()}</td>
        <td className="px-4 py-3 font-display text-xl text-primary">${l.price.toLocaleString()}</td>
        <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">{actions}</div></td>
      </tr>
    </>
  );
}

function ActivityRow({ icon: Icon, color, text, sub }: { icon: React.ElementType; color: string; text: string; sub: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <div>
        <div className="text-foreground">{text}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </li>
  );
}

function ThreadView({
  thread, listing, onSend,
}: {
  thread: Thread; listing?: Listing; onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim().slice(0, 1000);
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "2px solid oklch(0.14 0.02 240)" }}>
        <div
          className="grid h-10 w-10 place-items-center bg-primary/15 font-display text-lg text-primary"
          style={{ border: "2px solid oklch(0.14 0.02 240)" }}
        >
          {thread.from.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">{thread.from}</div>
          {listing && <div className="truncate text-xs uppercase tracking-wider text-primary">re: {listing.title}</div>}
        </div>
        {listing && (
          <div className="flex items-center gap-2">
            <img
              src={listing.image}
              alt=""
              className="h-10 w-10 object-cover"
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            />
            <span className="hidden font-display text-lg text-primary sm:block">${listing.price}</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: 360 }}>
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 text-sm ${
                m.from === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-elevated text-foreground"
              }`}
              style={{ border: "2px solid oklch(0.14 0.02 240)" }}
            >
              {m.text}
              <div className={`mt-0.5 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 px-3 py-3" style={{ borderTop: "2px solid oklch(0.14 0.02 240)" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Type a reply…"
          className="flex-1 bg-surface px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ border: "2px solid oklch(0.14 0.02 240)" }}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="grid h-10 w-10 place-items-center bg-primary text-primary-foreground transition hover:bg-accent disabled:opacity-40 hover:-translate-x-px hover:-translate-y-px"
          style={{ border: "2px solid oklch(0.14 0.02 240)", boxShadow: "3px 3px 0 oklch(0.14 0.02 240)" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

type ListingType = "item" | "multi" | "sale-event";

const LISTING_TYPES: { id: ListingType; icon: React.ElementType; label: string; sub: string }[] = [
  { id: "item",       icon: Package,    label: "One item",     sub: "A single thing you're selling — furniture, electronics, clothes, etc." },
  { id: "multi",      icon: Tag,        label: "Multiple items", sub: "A batch or lot — box of books, set of dishes, whole room of stuff." },
  { id: "sale-event", icon: Calendar,   label: "Sale event",   sub: "Garage sale, estate sale, swap meet — a date, a place, a whole yard." },
];

const PHOTO_TIPS = [
  { icon: "☀️", tip: "Shoot in natural light — open a window or step outside." },
  { icon: "🧹", tip: "Clear the background. A clean wall beats a cluttered room every time." },
  { icon: "📐", tip: "Show all four sides plus any damage. No surprises = faster sale." },
  { icon: "📏", tip: "Toss a coin or ruler in frame so buyers can gauge size instantly." },
];

const PROHIBITED = [
  "Drugs, prescription meds, paraphernalia",
  "Weapons, ammo, firearms, explosives",
  "Animals — live, parts, or taxidermy",
  "Alcohol or tobacco products",
  "Adult or explicit items",
  "Counterfeit, knockoff, or stolen goods",
  "Services of any kind",
  "Healthcare products (testing kits, medical devices)",
  "Digital goods, subscriptions, gift cards",
  "Fraudulent, misleading, or deceptive listings",
];

function ListingEditor({
  initial, onClose, onSave,
}: {
  initial: SellerListing | null;
  onClose: () => void;
  onSave: (l: Pick<SellerListing, "id" | "title" | "price" | "category" | "condition" | "location" | "image" | "status" | "description">) => void;
}) {
  const INK = "oklch(0.14 0.02 240)";

  // Steps: type-pick → photo-tips → form → (submit goes straight through)
  // If editing existing listing skip straight to form
  const [step, setStep] = useState<"type" | "photo-tips" | "form">(initial ? "form" : "type");
  const [listingType, setListingType] = useState<ListingType>("item");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[1]);
  const [condition, setCondition] = useState<Condition>(initial?.condition ?? "good");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [image, setImage] = useState(initial?.image ?? STOCK_IMG);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "active");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSaleEvent = listingType === "sale-event";
  const totalSteps = 3;
  const stepIndex = step === "type" ? 1 : step === "photo-tips" ? 2 : 3;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const p = Number(price);
    if (!t) return setError("Title is required");
    if (t.length > 120) return setError("Title is too long");
    if (!isSaleEvent && (!Number.isFinite(p) || p < 0 || p > 1_000_000)) return setError("Enter a valid price");
    if (description.length > 1000) return setError("Description is too long");
    if (!agreed) return setError("You must confirm you're not selling prohibited items");
    onSave({
      id: initial?.id ?? `new-${Date.now()}`,
      title: t,
      price: isSaleEvent ? 0 : Math.round(p),
      category: isSaleEvent ? "Sales" : category,
      condition,
      location: location.trim().slice(0, 80) || "Wichita, KS",
      image: image.trim() || STOCK_IMG,
      description: description.trim().slice(0, 1000),
      status,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden bg-card"
        style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `2px solid ${INK}` }}>
          <div className="flex items-center gap-3">
            {step !== "type" && !initial && (
              <button
                type="button"
                onClick={() => setStep(step === "form" ? "photo-tips" : "type")}
                className="grid h-7 w-7 place-items-center text-muted-foreground hover:bg-surface hover:text-foreground"
                style={{ border: `2px solid ${INK}` }}
              >
                ←
              </button>
            )}
            <h2 className="font-display text-2xl tracking-wide">
              {initial ? "Edit listing" : step === "type" ? "What are you selling?" : step === "photo-tips" ? "Photo tips" : "Listing details"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {!initial && (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 transition-all ${i < stepIndex ? "bg-primary" : "bg-muted"}`}
                    style={{ border: `1px solid ${INK}` }}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-surface hover:text-foreground"
              style={{ border: `2px solid ${INK}` }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step 1 — Type picker */}
        {step === "type" && (
          <div className="px-5 py-5">
            <p className="mb-4 text-sm text-muted-foreground">Pick the type that fits. This shapes how your listing looks to buyers.</p>
            <div className="flex flex-col gap-0" style={{ border: `2px solid ${INK}` }}>
              {LISTING_TYPES.map(({ id, icon: Icon, label, sub }, i) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setListingType(id); setStep("photo-tips"); }}
                  className="flex items-center gap-4 bg-surface px-5 py-4 text-left transition hover:bg-primary/10 group"
                  style={i > 0 ? { borderTop: `2px solid ${INK}` } : {}}
                >
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"
                    style={{ border: `2px solid ${INK}` }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 px-1 text-xs text-muted-foreground">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              No services, digital goods, or prohibited items. <button type="button" onClick={() => window.open("/rules", "_blank")} className="ml-1 font-semibold text-primary hover:underline">See full list →</button>
            </div>
          </div>
        )}

        {/* Step 2 — Photo tips */}
        {step === "photo-tips" && (
          <div className="px-5 py-5">
            <div
              className="mb-5 flex items-center gap-3 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
              style={{ border: `2px solid ${INK}` }}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              Listings with 3+ photos get 2× more messages. Here's how to nail it.
            </div>
            <div className="flex flex-col gap-0" style={{ border: `2px solid ${INK}` }}>
              {PHOTO_TIPS.map(({ icon, tip }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 text-sm"
                  style={i > 0 ? { borderTop: `2px solid ${INK}` } : {}}
                >
                  <span className="text-base leading-none mt-0.5">{icon}</span>
                  <span className="text-foreground">{tip}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 bg-surface py-2.5 text-sm font-semibold transition hover:bg-muted"
                style={{ border: `2px solid ${INK}` }}
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-accent"
                style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                Got it — continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Form */}
        {step === "form" && (
          <form onSubmit={submit}>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-5">
              {/* Photo */}
              <div className="relative h-40 overflow-hidden bg-muted" style={{ border: `2px solid ${INK}` }}>
                <img src={image || STOCK_IMG} alt="" className="h-full w-full object-cover" />
                <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 bg-background/80 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-background" style={{ border: `2px solid ${INK}` }}>
                  <ImageIcon className="h-3.5 w-3.5" />
                  Photo URL
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="ml-2 w-40 bg-transparent text-xs focus:outline-none"
                    placeholder="https://…"
                  />
                </label>
              </div>

              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder={isSaleEvent ? "e.g. Riverside Estate Sale — Sat Jun 7" : "e.g. Mid-Century Walnut Dresser"}
                  className="w-full bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ border: `2px solid ${INK}` }}
                />
              </Field>

              {isSaleEvent ? (
                <>
                  <Field label="Date">
                    <input
                      type="date"
                      className="w-full bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ border: `2px solid ${INK}` }}
                    />
                  </Field>
                  <Field label="Start / End time">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="time" className="bg-surface px-3 py-2 text-sm focus:outline-none" style={{ border: `2px solid ${INK}` }} defaultValue="08:00" />
                      <input type="time" className="bg-surface px-3 py-2 text-sm focus:outline-none" style={{ border: `2px solid ${INK}` }} defaultValue="14:00" />
                    </div>
                  </Field>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (USD)">
                    <input
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="0"
                      className="w-full bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ border: `2px solid ${INK}` }}
                    />
                  </Field>
                  <Field label="Category">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ border: `2px solid ${INK}` }}
                    >
                      {CATEGORIES.filter((c) => c !== "All" && c !== "Sales").map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              {!isSaleEvent && (
                <Field label="Condition">
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCondition(c)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                          condition === c ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                        style={{ border: `2px solid ${INK}` }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>
              )}

              <Field label="Neighborhood">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. College Hill"
                  className="w-full bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ border: `2px solid ${INK}` }}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder={isSaleEvent ? "What's in the sale? Furniture, vintage, tools, clothing…" : "Condition, pickup details, measurements, etc."}
                  className="w-full resize-none bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{ border: `2px solid ${INK}` }}
                />
                <div className="mt-1 text-right text-[10px] text-muted-foreground">{description.length}/1000</div>
              </Field>

              <Field label="Status">
                <div className="flex gap-2">
                  {(["active", "draft"] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        status === s ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ border: `2px solid ${INK}` }}
                    >
                      {s === "active" ? "Post now" : "Save as draft"}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Prohibited items acknowledgment */}
              <ProhibitedAccordion
                agreed={agreed}
                onToggle={(v) => { setAgreed(v); setError(null); }}
                ink={INK}
              />

              {error && (
                <div className="flex items-center gap-2 bg-destructive/10 px-3 py-2 text-sm text-destructive" style={{ border: `2px solid ${INK}` }}>
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 bg-surface/50 px-5 py-4" style={{ borderTop: `2px solid ${INK}` }}>
              <button
                type="button"
                onClick={onClose}
                className="bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                style={{ border: `2px solid ${INK}` }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:-translate-x-px hover:-translate-y-px"
                style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
              >
                {initial ? "Save changes" : status === "draft" ? "Save draft" : "Post listing →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ProhibitedAccordion({ agreed, onToggle, ink }: { agreed: boolean; onToggle: (v: boolean) => void; ink: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${ink}` }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-surface"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Not allowed on Dibz</span>
        <span className="text-xs text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-3" style={{ borderTop: `2px solid ${ink}` }}>
          <div className="grid grid-cols-1 gap-0.5 pt-2">
            {PROHIBITED.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1 w-1 shrink-0 bg-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
      <label
        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-surface"
        style={{ borderTop: `2px solid ${ink}` }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-xs font-semibold text-foreground">
          I confirm my listing doesn't include any prohibited items and is accurate and not misleading.
        </span>
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

type ParsedListing = Pick<SellerListing, "id" | "title" | "price" | "category" | "location" | "image" | "status" | "description">;

const MOCK_PARSED: ParsedListing = {
  id: `import-${Date.now()}`,
  title: "Mid-Century Walnut Coffee Table",
  price: 120,
  category: "Furniture",
  location: "College Hill",
  image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&auto=format&q=70",
  description: "Beautiful solid walnut coffee table from the 1960s. Some light scratches on the surface but overall great condition. Pick up only, cash or Venmo.",
  status: "active",
};

function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (data: ParsedListing) => void;
}) {
  const INK = "oklch(0.14 0.02 240)";
  const [step, setStep] = useState<"upload" | "parsing" | "preview">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedListing | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setStep("parsing");
      // Simulate AI parse delay
      setTimeout(() => {
        setParsed({ ...MOCK_PARSED, id: `import-${Date.now()}` });
        setStep("preview");
      }, 2200);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden bg-card"
        style={{ border: `2px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `2px solid ${INK}` }}>
          <div>
            <h2 className="font-display text-2xl tracking-wide">Import listing</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Screenshot from Facebook, Craigslist, OfferUp — anything</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-surface hover:text-foreground"
            style={{ border: `2px solid ${INK}` }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          {step === "upload" && (
            <>
              {/* Platform badges */}
              <div className="mb-4 flex items-center gap-2">
                {["Facebook", "Craigslist", "OfferUp", "Any screenshot"].map((p, i) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    style={{ border: `2px solid ${INK}`, background: i === 0 ? "oklch(0.52 0.14 178 / 0.1)" : undefined }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Drop zone */}
              <div
                className="relative flex flex-col items-center justify-center gap-3 bg-surface py-12 text-center transition hover:bg-muted cursor-pointer"
                style={{ border: `2px dashed ${INK}` }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                <div
                  className="grid h-14 w-14 place-items-center bg-primary/15 text-primary"
                  style={{ border: `2px solid ${INK}` }}
                >
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Drop a screenshot here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">or click to browse — JPG, PNG, WEBP</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              {/* How it works */}
              <div className="mt-4 space-y-2">
                {[
                  { n: "1", text: "Screenshot your listing on Facebook Marketplace or anywhere else" },
                  { n: "2", text: "Drop it above — AI reads the title, price, photos, and description" },
                  { n: "3", text: "Review and publish to Dibz in one click" },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-3 text-xs text-muted-foreground">
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center font-display text-sm text-primary"
                      style={{ border: `2px solid ${INK}` }}
                    >
                      {n}
                    </span>
                    {text}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === "parsing" && (
            <div className="flex flex-col items-center gap-5 py-10">
              {preview && (
                <div className="relative h-40 w-40 overflow-hidden" style={{ border: `2px solid ${INK}` }}>
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-background/60 grid place-items-center">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
              )}
              <div className="text-center">
                <p className="font-display text-2xl tracking-wide">Reading your listing…</p>
                <p className="mt-1 text-xs text-muted-foreground">AI is extracting title, price, and description</p>
              </div>
              {/* Animated progress bar */}
              <div className="w-full bg-muted h-1.5" style={{ border: `1px solid ${INK}` }}>
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: "100%", animation: "progress 2.2s linear forwards" }}
                />
              </div>
              <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
            </div>
          )}

          {step === "preview" && parsed && (
            <div className="space-y-4">
              <div
                className="flex gap-3 bg-primary/10 px-4 py-3 text-xs font-semibold text-primary"
                style={{ border: `2px solid ${INK}` }}
              >
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                AI found your listing. Review the details below before publishing.
              </div>

              <div className="flex gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden" style={{ border: `2px solid ${INK}` }}>
                  <img src={parsed.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-bold text-foreground truncate">{parsed.title}</p>
                  <p className="font-display text-2xl text-primary">${parsed.price}</p>
                  <p className="text-xs text-muted-foreground">{parsed.category} · {parsed.location}</p>
                </div>
              </div>

              <div className="bg-surface px-4 py-3 text-sm text-muted-foreground" style={{ border: `2px solid ${INK}` }}>
                {parsed.description}
              </div>

              <div
                className="flex items-start gap-2 text-xs text-muted-foreground px-3 py-2.5"
                style={{ border: `2px solid oklch(0.14 0.02 240)`, background: "oklch(0.955 0.016 84)" }}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                You'll be able to edit everything before publishing. This is just a starting point.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 bg-surface py-2.5 text-sm font-semibold transition hover:text-foreground"
                  style={{ border: `2px solid ${INK}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onImport(parsed)}
                  className="flex-1 bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:-translate-x-px hover:-translate-y-px"
                  style={{ border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}
                >
                  Edit &amp; publish →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
