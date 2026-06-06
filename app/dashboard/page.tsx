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


const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const TEAL  = "oklch(0.48 0.13 178)";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

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
      <section style={{ borderBottom: `2px solid ${INK}` }}>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Seller Dashboard</p>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1, marginTop: 8, color: INK }}>
            Hey, Zach<span style={{ color: TEAL }}>.</span>
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 11, color: INK, marginTop: 8, opacity: 0.7 }}>
            You have <span style={{ fontWeight: 700, opacity: 1 }}>{stats.unread} new messages</span> and{" "}
            <span style={{ fontWeight: 700, opacity: 1 }}>{stats.active} active listings</span>.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={openNew}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: INK, color: CREAM, padding: "12px 20px", fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${RED}`, cursor: "pointer", width: "100%" }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> New listing
            </button>
            <div className="flex gap-2">
              <Link href="/garage-sales"
                style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: INK, padding: "10px 16px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`, textDecoration: "none" }}
              >
                <Calendar className="h-4 w-4" /> Host a sale
              </Link>
              <button onClick={() => setImporter(true)}
                style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: INK, padding: "10px 16px", fontFamily: SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, border: `2px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}`, cursor: "pointer" }}
              >
                <Upload className="h-4 w-4" /> Import
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards — almanac style */}
      <section className="mx-auto max-w-7xl px-6 pt-6">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ border: `2px solid ${INK}`, background: INK }}>
          {[
            { val: `$${stats.earnings.toLocaleString()}`, label: "Earnings", sub: "This month", trend: "+18%", onClick: undefined },
            { val: stats.views.toLocaleString(), label: "Total views", sub: "Last 30 days", trend: "+24%", onClick: undefined },
            { val: String(stats.active), label: "Active listings", sub: `${stats.sold} sold`, trend: undefined, onClick: undefined },
            { val: String(stats.unread), label: "Unread msgs", sub: `${threads.length} total`, trend: undefined, onClick: () => setTab("messages") },
          ].map(({ val, label, sub, trend, onClick }) => (
            <div key={label} onClick={onClick} style={{ background: "var(--background)", padding: "20px 20px", cursor: onClick ? "pointer" : undefined }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: "clamp(1.75rem,3vw,2.5rem)", lineHeight: 1, color: INK }}>{val}</div>
              <div style={{ fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 900, marginTop: 6, color: INK }}>{label}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginTop: 3, color: INK }}>
                {trend && <span style={{ color: TEAL, fontWeight: 700, marginRight: 4 }}>↑ {trend}</span>}{sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="flex items-end" style={{ borderBottom: `2px solid ${INK}` }}>
          {[
            { key: "listings", label: "Listings", badge: listings.length },
            { key: "messages", label: "Messages", badge: stats.unread > 0 ? stats.unread : null },
            { key: "sales", label: "Performance", badge: null },
          ].map(({ key, label, badge }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              style={{ padding: "10px 20px", fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900, cursor: "pointer", background: "transparent", border: "none", borderBottom: tab === key ? `3px solid ${RED}` : "3px solid transparent", color: tab === key ? INK : `${INK}80`, marginBottom: -2, display: "flex", alignItems: "center", gap: 6 }}
            >
              {label}
              {badge !== null && badge !== undefined && (
                <span style={{ fontFamily: MONO, fontSize: 8, padding: "1px 5px", background: tab === key ? RED : INK, color: CREAM, fontWeight: 700 }}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Tab content */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        {tab === "listings" && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: INK, opacity: 0.4 }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your listings…"
                  className="w-full focus:outline-none"
                  style={{ border: `2px solid ${INK}`, padding: "7px 12px 7px 32px", fontFamily: MONO, fontSize: 11, color: INK, background: "transparent" }}
                />
              </div>
              <div className="flex items-center gap-1">
                {(["all", "active", "sold", "draft"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding: "6px 12px", fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", border: `2px solid ${INK}`, background: filter === f ? INK : "transparent", color: filter === f ? CREAM : INK, boxShadow: filter === f ? `2px 2px 0 ${RED}` : undefined }}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto" style={{ border: `2px solid ${INK}` }}>
              <table className="w-full border-collapse" style={{ tableLayout: "fixed", background: "var(--background)" }}>
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
                  <tr style={{ background: INK }}>
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
                        <th key={key} onClick={() => toggleSort(key)}
                          style={{ padding: "8px 14px", fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: active ? 700 : 400, color: active ? "#f97316" : CREAM, opacity: active ? 1 : 0.75, cursor: "pointer", textAlign: align as "left"|"right", userSelect: "none" as const, whiteSpace: "nowrap" }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {ColIcon && <ColIcon className="h-3 w-3 shrink-0" />}
                            {label}
                            <SortIcon className="h-2.5 w-2.5 shrink-0" />
                          </span>
                        </th>
                      );
                    })}
                    <th style={{ padding: "8px 14px" }} />
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
            <div className="overflow-hidden" style={{ border: `2px solid ${INK}` }}>
              {threads.length === 0 && (
                <div className="px-5 py-16 text-center text-sm text-muted-foreground">No messages yet.</div>
              )}
              {threads.map((m, i) => {
                const listing = listings.find((l) => l.id === m.listingId);
                const last = m.messages[m.messages.length - 1];
                return (
                  <button key={m.id} onClick={() => openThread(m.id)}
                    style={{ display: "flex", width: "100%", alignItems: "flex-start", gap: 12, padding: "14px 18px", textAlign: "left", cursor: "pointer", background: activeThread === m.id ? `${INK}08` : "transparent", borderBottom: i !== threads.length - 1 ? `1px dotted ${INK}` : undefined, border: undefined }}
                    onMouseEnter={e => { if (activeThread !== m.id) e.currentTarget.style.background = `${INK}05`; }}
                    onMouseLeave={e => { if (activeThread !== m.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 36, height: 36, flexShrink: 0, display: "grid", placeItems: "center", background: m.unread ? RED : INK, color: CREAM, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, border: `1.5px solid ${INK}` }}>
                      {m.from.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: SANS, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: INK, opacity: m.unread ? 1 : 0.6 }}>{m.from}</span>
                        {m.unread && <span style={{ width: 5, height: 5, background: RED, borderRadius: "50%" }} />}
                        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 8, color: INK, opacity: 0.4 }}>{last?.time}</span>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        re: {listing?.title ?? "Listing"}
                      </div>
                      <p style={{ fontFamily: MONO, fontSize: 10, color: INK, opacity: m.unread ? 0.8 : 0.45, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {last?.from === "me" ? "You: " : ""}{last?.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="bg-card"
              style={{ border: "2px solid oklch(0.16 0.01 60)" }}
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
          <div className="grid gap-px md:grid-cols-2" style={{ border: `2px solid ${INK}`, background: INK }}>
            <div style={{ background: "var(--background)", padding: "24px" }}>
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Top Performers</p>
              <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: INK, marginTop: 4 }}>By views · last 30 days</h3>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {[...listings]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 4)
                  .map((l, i) => {
                    const max = Math.max(...listings.map((x) => x.views), 1);
                    const pct = (l.views / max) * 100;
                    return (
                      <div key={l.id}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, color: RED, marginRight: 6 }}>{i + 1}.</span>
                            {l.title}
                          </span>
                          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: TEAL, flexShrink: 0 }}>{l.views.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 4, background: `${INK}15`, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: INK }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ background: "var(--background)", padding: "24px" }}>
              <p style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.35em", color: RED }}>§ Recent Activity</p>
              <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: INK, marginTop: 4 }}>Buyer interactions</h3>
              <ul style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 0 }}>
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
          style={{ border: "2px solid oklch(0.16 0.01 60)", boxShadow: "3px 3px 0 oklch(0.16 0.01 60)" }}
        >
          <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
          {toast}
        </div>
      )}
    </div>
  );
}


function ListingRow({
  l, onEdit, onDelete, onToggleSold, onPublish,
}: {
  l: SellerListing; onEdit: () => void; onDelete: () => void; onToggleSold: () => void; onPublish: () => void;
}) {
  const statusColor = l.status === "active" ? TEAL : l.status === "sold" ? INK : RED;

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
    <button onClick={onPublish}
      style={{ padding: "3px 10px", fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, background: INK, color: CREAM, border: `2px solid ${INK}`, cursor: "pointer" }}>
      Publish
    </button>
  ) : (
    <span style={{ display: "inline-block", padding: "2px 8px", fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, border: `2px solid ${statusColor}`, color: statusColor }}>
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
      <tr className="hidden md:table-row" style={{ borderBottom: `1px dotted ${INK}` }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.025)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <td style={{ padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img src={l.image} alt={l.title} style={{ width: 44, height: 44, flexShrink: 0, objectFit: "cover", filter: "saturate(0.8)", border: `1.5px solid ${INK}` }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: l.status === "sold" ? `${INK}60` : INK, textDecoration: l.status === "sold" ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.5, marginTop: 2, color: INK }}>
                {l.location} · {l.status === "draft" ? "Draft" : `${l.postedDays}d ago`}
              </div>
            </div>
          </div>
        </td>
        <td style={{ padding: "10px 14px" }}>{statusBadge}</td>
        <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 11, color: INK }}>{l.views.toLocaleString()}</td>
        <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 11, color: INK }}>{l.saves.toLocaleString()}</td>
        <td style={{ padding: "10px 14px", fontFamily: MONO, fontSize: 11, color: INK }}>{l.messages.toLocaleString()}</td>
        <td style={{ padding: "10px 14px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 18, color: l.isGarageSale ? TEAL : RED }}>{l.isGarageSale ? "Free" : `$${l.price.toLocaleString()}`}</td>
        <td style={{ padding: "10px 14px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>{actions}</div></td>
      </tr>
    </>
  );
}

function ActivityRow({ icon: Icon, text, sub }: { icon: React.ElementType; color: string; text: string; sub: string }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: `1px dotted ${INK}` }}>
      <Icon style={{ marginTop: 1, width: 14, height: 14, flexShrink: 0, color: INK, opacity: 0.5 }} />
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK }}>{text}</div>
        <div style={{ fontFamily: MONO, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, marginTop: 2 }}>{sub}</div>
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

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = draft.trim().slice(0, 1000);
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  }

  return (
    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: `2px solid ${INK}` }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, display: "grid", placeItems: "center", background: INK, color: CREAM, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, border: `1.5px solid ${INK}` }}>
          {thread.from.charAt(0)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 900, color: INK }}>{thread.from}</div>
          {listing && <div style={{ fontFamily: MONO, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: TEAL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>re: {listing.title}</div>}
        </div>
        {listing && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={listing.image} alt="" style={{ width: 36, height: 36, objectFit: "cover", filter: "saturate(0.7)", border: `1.5px solid ${INK}` }} />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 16, color: RED }}>${listing.price}</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px", maxHeight: 360, display: "flex", flexDirection: "column", gap: 10 }}>
        {thread.messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "8px 14px", background: m.from === "me" ? INK : "transparent", color: m.from === "me" ? CREAM : INK, border: `1.5px solid ${INK}`, fontFamily: MONO, fontSize: 11 }}>
              {m.text}
              <div style={{ marginTop: 3, fontSize: 8, opacity: 0.5 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderTop: `2px solid ${INK}` }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Type a reply…"
          style={{ flex: 1, background: "transparent", border: `2px solid ${INK}`, padding: "7px 12px", fontFamily: MONO, fontSize: 11, color: INK, outline: "none" }}
        />
        <button type="submit" disabled={!draft.trim()}
          style={{ width: 40, height: 40, display: "grid", placeItems: "center", background: INK, color: CREAM, border: `2px solid ${INK}`, boxShadow: `3px 3px 0 ${RED}`, cursor: "pointer", opacity: draft.trim() ? 1 : 0.35 }}
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
  const INK = "oklch(0.16 0.01 60)";

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

  function submit(e: React.FormEvent<HTMLFormElement>) {
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
  const INK = "oklch(0.16 0.01 60)";
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
                style={{ border: `2px solid oklch(0.16 0.01 60)`, background: "oklch(0.955 0.016 84)" }}
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
