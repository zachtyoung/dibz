"use client";

const INK = "oklch(0.14 0.02 240)";
const TEAL = "oklch(0.52 0.14 178)";
const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBREVS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function parseISO(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

const CSS = `
  .wstrip { border: 2px solid ${INK}; }
  .wstrip-all {
    display: block; width: 100%; padding: 8px 0;
    font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
    border-bottom: 2px solid ${INK}; cursor: pointer; transition: background 0.15s;
  }
  .wstrip-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .wstrip-cell {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 0; cursor: pointer; border-right: 2px solid ${INK}; transition: background 0.15s;
  }
  /* Remove right border from last cell of each row */
  .wstrip-cell:nth-child(7n) { border-right: none; }
  /* Second row gets top border on mobile */
  .wstrip-cell:nth-child(n+8) { border-top: 2px solid ${INK}; }

  @media (min-width: 768px) {
    .wstrip-grid { grid-template-columns: repeat(14, 1fr); }
    /* On desktop: all cells have right border except the very last */
    .wstrip-cell { border-right: 2px solid ${INK}; }
    .wstrip-cell:nth-child(7n) { border-right: 2px solid ${INK}; }
    .wstrip-cell:last-child { border-right: none; }
    /* No top border on desktop — single row */
    .wstrip-cell:nth-child(n+8) { border-top: none; }
  }
`;

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
  const days: string[] = [];
  for (let i = 0; i < 14; i++) days.push(addDays(today, i));

  return (
    <>
      <style>{CSS}</style>
      <div className="wstrip">
        <button
          className="wstrip-all"
          onClick={() => onSelect(null)}
          style={{
            background: selected === null ? TEAL : "transparent",
            color: selected === null ? "white" : "oklch(0.40 0.025 220)",
          }}
        >
          All upcoming
        </button>

        <div className="wstrip-grid">
          {days.map((iso) => {
            const d = parseISO(iso);
            const isToday = iso === today;
            const isSelected = iso === selected;
            const hasSales = saleDates.includes(iso);

            return (
              <button
                key={iso}
                className="wstrip-cell"
                onClick={() => onSelect(isSelected ? null : iso)}
                style={{
                  background: isSelected ? TEAL : isToday ? "oklch(0.93 0.018 82)" : "transparent",
                  color: isSelected ? "white" : INK,
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>
                  {isToday ? "Today" : DAY_ABBREVS[d.getDay()]}
                </span>
                <span style={{ fontFamily: "Bebas Neue, Impact, sans-serif", fontSize: 20, lineHeight: 1, marginTop: 2 }}>
                  {d.getDate()}
                </span>
                <span style={{ fontSize: 9, opacity: 0.6, marginTop: 1 }}>
                  {MONTH_ABBREVS[d.getMonth()]}
                </span>
                {hasSales && (
                  <div style={{ marginTop: 3, width: 6, height: 6, borderRadius: "50%", background: isSelected ? "white" : TEAL }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
