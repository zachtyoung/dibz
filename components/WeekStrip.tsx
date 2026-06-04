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
  saleDates: string[];
  selected: string | null;
  onSelect: (iso: string | null) => void;
}) {
  const today = isoToday();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  const days: string[] = [];
  for (let i = -7; i <= 13; i++) days.push(addDays(today, i));

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const el = todayRef.current;
      const container = scrollRef.current;
      container.scrollLeft = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    }
  }, []);

  return (
    <div style={{ borderBottom: `2px solid ${INK}` }}>
      <div className="mx-auto max-w-7xl">
      <div className="flex items-stretch overflow-x-auto" ref={scrollRef}>
        {/* All pill */}
        <button
          onClick={() => onSelect(null)}
          className="flex shrink-0 items-center px-5 text-xs font-bold uppercase tracking-widest transition"
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
              onClick={() => { if (!isPast) onSelect(isSelected ? null : iso); }}
              disabled={isPast}
              className="relative flex shrink-0 flex-col items-center px-4 py-3 transition"
              style={{
                borderRight: `2px solid ${INK}`,
                minWidth: 62,
                background: isSelected ? TEAL : isToday ? "oklch(0.93 0.018 82)" : "transparent",
                color: isPast ? "oklch(0.70 0.010 220)" : isSelected ? "white" : INK,
                cursor: isPast ? "default" : "pointer",
                opacity: isPast ? 0.4 : 1,
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {isToday ? "Today" : DAY_ABBREVS[d.getDay()]}
              </span>
              <span className="mt-0.5 font-display text-xl leading-none">{d.getDate()}</span>
              <span className="text-[9px] font-medium opacity-70">{MONTH_ABBREVS[d.getMonth()]}</span>
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
    </div>
  );
}
