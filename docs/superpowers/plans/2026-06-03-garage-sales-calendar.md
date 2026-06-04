# Garage Sales Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scrollable week-strip calendar to the garage sales page so users can see and filter sales by date — today, future weeks, and (grayed) past dates.

**Architecture:** Add a machine-readable `dateISO` field to garage sale listings. Build a `WeekStrip` component that renders a horizontally-scrollable strip of days centered on today, with dot badges for days that have sales. Selecting a day filters both the map and the sales grid. "All upcoming" is the default — no day selected shows all future sales. Past days are visible but grayed out and show no sales (placeholder for future feature).

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, existing `ListingsMap`, `ListingCard`, `useCityContext`, `getListings`.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/listings.ts` | Modify | Add `dateISO?: string` to `Listing` type and to the 3 garage sale templates |
| `app/garage-sales/page.tsx` | Modify | Add `WeekStrip` + date-based filtering logic |
| `components/WeekStrip.tsx` | Create | Scrollable day-picker strip component |

---

### Task 1: Add `dateISO` to listings

**Files:**
- Modify: `lib/listings.ts`

The three garage sale listings have `date` as a display string (e.g. `"Sat, Jun 8 · 9am–3pm"`). Add `dateISO` as an ISO date string (`"2026-06-08"`) so the calendar can do date math.

- [ ] **Step 1: Add `dateISO` to the `Listing` type**

In `lib/listings.ts`, find the `Listing` type (around line 26) and add `dateISO?: string` after `date?: string`:

```typescript
export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition?: Condition;
  location: string;
  distance: string;
  seller: string;
  sellerTrust?: SellerTrust;
  image: string;
  lat: number;
  lng: number;
  isGarageSale?: boolean;
  saleType?: SaleType;
  description?: string;
  date?: string;
  dateISO?: string;
  postedHoursAgo?: number;
  pickupPhotos?: PickupPhoto[];
};
```

- [ ] **Step 2: Add `dateISO` to the three garage sale templates**

Find the three garage sale entries (ids "3", "6", "10") in the `TEMPLATES` array and add `dateISO`:

```typescript
// id "3" — "Sat, Jun 8 · 9am–3pm"
dateISO: "2026-06-08"

// id "6" — "Sun, Jun 9 · 8am–2pm"
dateISO: "2026-06-09"

// id "10" — "Sat, Jun 15 · 10am–4pm"
dateISO: "2026-06-15"
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/listings.ts
git commit -m "feat: add dateISO field to garage sale listings"
```

---

### Task 2: Build `WeekStrip` component

**Files:**
- Create: `components/WeekStrip.tsx`

A horizontally-scrollable strip showing 21 days centered on today (7 past, today, 13 future). Each day cell shows: day-of-week abbrev, date number, and a dot badge if any sales exist on that day. Past days are grayed. Selected day is highlighted in teal. Tapping a day calls `onSelect(dateISO)`. Tapping the selected day again deselects (returns to "all upcoming"). An "All" pill at the left always deselects.

- [ ] **Step 1: Create `components/WeekStrip.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBREVS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function parseISO(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

export function WeekStrip({
  saleDates,
  selected,
  onSelect,
}: {
  saleDates: string[];   // ISO dates that have sales
  selected: string | null;
  onSelect: (iso: string | null) => void;
}) {
  const today = isoToday();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  // Build 21 days: 7 past + today + 13 future
  const days: string[] = [];
  for (let i = -7; i <= 13; i++) {
    days.push(addDays(today, i));
  }

  // Scroll today into center on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const el = todayRef.current;
      const container = scrollRef.current;
      container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    }
  }, []);

  return (
    <div style={{ borderBottom: `2px solid ${INK}` }}>
      <div className="flex items-stretch overflow-x-auto" ref={scrollRef}>
        {/* "All" pill */}
        <button
          onClick={() => onSelect(null)}
          className="flex shrink-0 items-center px-5 py-3 text-xs font-bold uppercase tracking-widest transition"
          style={{
            borderRight: `2px solid ${INK}`,
            background: selected === null ? TEAL : "transparent",
            color: selected === null ? "white" : "oklch(0.40 0.025 220)",
          }}
        >
          All
        </button>

        {days.map((iso) => {
          const d = parseISO(iso);
          const isPast = iso < today;
          const isToday = iso === today;
          const isSelected = iso === selected;
          const hasSales = saleDates.includes(iso);

          return (
            <button
              key={iso}
              ref={isToday ? todayRef : undefined}
              onClick={() => !isPast && onSelect(isSelected ? null : iso)}
              disabled={isPast}
              className="relative flex shrink-0 flex-col items-center px-4 py-3 transition"
              style={{
                borderRight: `2px solid ${INK}`,
                minWidth: 60,
                background: isSelected ? TEAL : isToday ? "oklch(0.93 0.018 82)" : "transparent",
                color: isPast
                  ? "oklch(0.70 0.010 220)"
                  : isSelected
                  ? "white"
                  : INK,
                cursor: isPast ? "default" : "pointer",
                opacity: isPast ? 0.45 : 1,
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {isToday ? "Today" : DAY_ABBREVS[d.getDay()]}
              </span>
              <span className="mt-0.5 font-display text-xl leading-none">
                {d.getDate()}
              </span>
              <span className="text-[9px] font-medium opacity-70">
                {MONTH_ABBREVS[d.getMonth()]}
              </span>
              {/* Sale dot */}
              {hasSales && (
                <div
                  className="mt-1 h-1.5 w-1.5 rounded-full"
                  style={{ background: isSelected ? "white" : TEAL }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/WeekStrip.tsx
git commit -m "feat: WeekStrip scrollable day-picker component"
```

---

### Task 3: Wire WeekStrip into garage-sales page

**Files:**
- Modify: `app/garage-sales/page.tsx`

Add `selectedDate` state. Wire `WeekStrip` below the hero section. Filter `filteredSales` by `selectedDate` when set; show all upcoming (today + future) when null. Update the heading to reflect the selected date or "This weekend" / "Upcoming sales".

- [ ] **Step 1: Add imports and state**

At the top of `app/garage-sales/page.tsx`, add the `WeekStrip` import:

```typescript
import { WeekStrip } from "@/components/WeekStrip";
```

Inside `GarageSales()`, add `selectedDate` state after the existing state declarations:

```typescript
const [selectedDate, setSelectedDate] = useState<string | null>(null);
```

- [ ] **Step 2: Compute `saleDates` and update `filteredSales`**

Replace the existing `filteredSales` line:

```typescript
const filteredSales = saleFilter === "all" ? sales : sales.filter((s) => s.saleType === saleFilter);
```

With:

```typescript
const today = new Date().toISOString().slice(0, 10);

const saleDates = [...new Set(sales.filter((s) => s.dateISO).map((s) => s.dateISO as string))];

const filteredSales = sales.filter((s) => {
  if (s.saleType && saleFilter !== "all" && s.saleType !== saleFilter) return false;
  if (selectedDate) return s.dateISO === selectedDate;
  // Default: all upcoming (today and future)
  return !s.dateISO || s.dateISO >= today;
});
```

- [ ] **Step 3: Add WeekStrip to JSX**

In the JSX, find the closing `</section>` of the hero section (the one containing the "Post your sale" button). Add `WeekStrip` immediately after it:

```tsx
<WeekStrip
  saleDates={saleDates}
  selected={selectedDate}
  onSelect={setSelectedDate}
/>
```

- [ ] **Step 4: Update the section heading**

Find the heading:

```tsx
{loading ? "Finding your location…" : `${filteredSales.length} ...`}
```

Replace with:

```tsx
{loading
  ? "Finding your location…"
  : selectedDate
  ? (() => {
      const d = new Date(selectedDate + "T12:00:00");
      return `${filteredSales.length} sale${filteredSales.length !== 1 ? "s" : ""} · ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
    })()
  : `${filteredSales.length} upcoming sale${filteredSales.length !== 1 ? "s" : ""}${city ? ` in ${city.name}` : ""}`}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add app/garage-sales/page.tsx
git commit -m "feat: wire WeekStrip calendar into garage-sales page"
```

---

### Task 4: Push

- [ ] **Step 1: Push**

```bash
git push
```
