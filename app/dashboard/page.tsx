"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { LISTINGS, CATEGORIES, type Listing } from "@/lib/listings";
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
  X,
  Send,
  Image as ImageIcon,
  RotateCcw,
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

export default function Dashboard() {
  const [listings, setListings] = useState<SellerListing[]>(SEED_LISTINGS);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [tab, setTab] = useState<"listings" | "messages" | "sales">("listings");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; listing: SellerListing | null }>({ open: false, listing: null });
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const filtered = useMemo(
    () =>
      listings
        .filter((l) => filter === "all" || l.status === filter)
        .filter((l) => !query || l.title.toLowerCase().includes(query.toLowerCase())),
    [listings, filter, query],
  );

  // ---- Listing actions ----
  function openNew() {
    setEditor({ open: true, listing: null });
  }
  function openEdit(l: SellerListing) {
    setEditor({ open: true, listing: l });
  }
  function saveListing(data: Omit<SellerListing, "views" | "saves" | "messages" | "postedDays" | "distance" | "seller" | "lat" | "lng">) {
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
      <section className="border-b border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-8 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Seller dashboard</p>
            <h1 className="mt-1 font-display text-5xl tracking-wide md:text-6xl">
              Hey, Maya<span className="text-primary">.</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You have <span className="text-foreground">{stats.unread} new messages</span> and{" "}
              <span className="text-foreground">{stats.active} active listings</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/garage-sales"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary"
            >
              <Calendar className="h-4 w-4 text-primary" /> Host a sale
            </Link>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-accent hover:shadow-glow"
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> New listing
            </button>
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
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60">
          <TabBtn active={tab === "listings"} onClick={() => setTab("listings")}>
            Listings <span className="ml-1.5 text-xs text-muted-foreground">{listings.length}</span>
          </TabBtn>
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")}>
            Messages
            {stats.unread > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
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
                  className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {(["all", "active", "sold", "draft"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-[1.7fr_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_auto] gap-4 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <div>Item</div>
                <div>Status</div>
                <div className="text-right">Views</div>
                <div className="text-right">Saves</div>
                <div className="text-right">Msgs</div>
                <div className="text-right">Price</div>
                <div />
              </div>
              {filtered.length === 0 ? (
                <div className="px-5 py-16 text-center text-sm text-muted-foreground">
                  No listings match your filters.{" "}
                  <button onClick={openNew} className="font-semibold text-primary hover:underline">
                    Post your first one →
                  </button>
                </div>
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
            </div>
          </>
        )}

        {tab === "messages" && (
          <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
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
                    className={`flex w-full items-start gap-4 border-b border-border/60 px-5 py-4 text-left transition hover:bg-surface-elevated ${
                      i === threads.length - 1 ? "border-b-0" : ""
                    } ${activeThread === m.id ? "bg-surface-elevated" : ""}`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-lg text-primary">
                      {m.from.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${m.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                          {m.from}
                        </span>
                        {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
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

            <div className="rounded-2xl border border-border bg-card">
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
            <div className="rounded-2xl border border-border bg-card p-6">
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
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
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
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-primary/40 bg-surface-elevated px-5 py-2.5 text-sm font-semibold text-foreground shadow-glow">
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
      className={`relative overflow-hidden rounded-2xl border p-5 text-left transition ${onClick ? "hover:-translate-y-0.5" : ""} ${
        highlight ? "border-accent/50 bg-accent/5 shadow-glow" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${highlight ? "bg-accent text-accent-foreground" : "bg-primary/15 text-primary"}`}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
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
      className={`relative inline-flex items-center px-4 py-3 text-sm font-semibold transition ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
    </button>
  );
}

function ListingRow({
  l, onEdit, onDelete, onToggleSold, onPublish,
}: {
  l: SellerListing; onEdit: () => void; onDelete: () => void; onToggleSold: () => void; onPublish: () => void;
}) {
  const statusStyle =
    l.status === "active" ? "bg-primary/15 text-primary"
    : l.status === "sold" ? "bg-muted text-muted-foreground"
    : "bg-accent/15 text-accent";

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border/60 px-5 py-4 transition last:border-b-0 hover:bg-surface-elevated md:grid-cols-[1.7fr_0.7fr_0.5fr_0.5fr_0.5fr_0.6fr_auto]">
      <div className="flex min-w-0 items-center gap-3 md:col-span-1 col-span-2">
        <img src={l.image} alt={l.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <div className={`truncate text-sm font-semibold ${l.status === "sold" ? "text-muted-foreground line-through" : "text-foreground"}`}>{l.title}</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {l.location}
            <span>·</span>
            <span>{l.status === "draft" ? "Draft" : `${l.postedDays}d ago`}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
          {l.status}
        </span>
      </div>

      <Metric value={l.views} icon={Eye} />
      <Metric value={l.saves} icon={Heart} />
      <Metric value={l.messages} icon={MessageCircle} />

      <div className="hidden text-right font-display text-xl text-primary md:block">${l.price}</div>

      <div className="flex items-center gap-1">
        {l.status === "draft" ? (
          <button
            onClick={onPublish}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-accent"
          >
            Publish
          </button>
        ) : (
          <button
            onClick={onToggleSold}
            title={l.status === "sold" ? "Mark active" : "Mark sold"}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-primary"
          >
            {l.status === "sold" ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
        )}
        <button onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Edit">
          <Edit3 className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-destructive" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="col-span-3 -mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground md:hidden">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>{l.status}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{l.views}</span>
          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{l.saves}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{l.messages}</span>
        </div>
        <span className="font-display text-base text-primary">${l.price}</span>
      </div>
    </div>
  );
}

function Metric({ value, icon: Icon }: { value: number; icon: React.ElementType }) {
  return (
    <div className="hidden items-center justify-end gap-1 text-sm text-foreground md:flex">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {value.toLocaleString()}
    </div>
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
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 font-display text-lg text-primary">
          {thread.from.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">{thread.from}</div>
          {listing && <div className="truncate text-xs uppercase tracking-wider text-primary">re: {listing.title}</div>}
        </div>
        {listing && (
          <div className="flex items-center gap-2">
            <img src={listing.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <span className="hidden font-display text-lg text-primary sm:block">${listing.price}</span>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: 360 }}>
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.from === "me"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-surface-elevated text-foreground"
              }`}
            >
              {m.text}
              <div className={`mt-0.5 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border/60 px-3 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Type a reply…"
          className="flex-1 rounded-full border border-border bg-surface px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-accent disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ListingEditor({
  initial, onClose, onSave,
}: {
  initial: SellerListing | null;
  onClose: () => void;
  onSave: (l: Pick<SellerListing, "id" | "title" | "price" | "category" | "location" | "image" | "status" | "description">) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[1]);
  const [location, setLocation] = useState(initial?.location ?? "Mission District");
  const [image, setImage] = useState(initial?.image ?? STOCK_IMG);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "active");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const p = Number(price);
    if (!t) return setError("Title is required");
    if (t.length > 120) return setError("Title is too long");
    if (!Number.isFinite(p) || p < 0 || p > 1_000_000) return setError("Enter a valid price");
    if (description.length > 1000) return setError("Description is too long");
    onSave({
      id: initial?.id ?? `new-${Date.now()}`,
      title: t,
      price: Math.round(p),
      category,
      location: location.trim().slice(0, 80) || "Nearby",
      image: image.trim() || STOCK_IMG,
      description: description.trim().slice(0, 1000),
      status,
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide">{initial ? "Edit listing" : "Post something for sale"}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5">
          <div className="relative h-40 overflow-hidden rounded-xl bg-muted">
            <img src={image || STOCK_IMG} alt="" className="h-full w-full object-cover" />
            <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-background">
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
              placeholder="e.g. Mid-Century Walnut Dresser"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD)">
              <input
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Neighborhood">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Condition, pickup details, etc."
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-1 text-right text-[10px] text-muted-foreground">{description.length}/1000</div>
          </Field>

          <Field label="Status">
            <div className="flex gap-2">
              {(["active", "draft", "sold"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    status === s
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-surface/50 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-accent hover:shadow-glow">
            {initial ? "Save changes" : "Post listing"}
          </button>
        </div>
      </form>
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
