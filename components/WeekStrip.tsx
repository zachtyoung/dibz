"use client";

const INK   = "oklch(0.16 0.01 60)";
const RED   = "#c0392b";
const TEAL  = "oklch(0.48 0.13 178)";
const CREAM = "oklch(0.965 0.018 85)";
const SERIF = "'DM Serif Display', Georgia, serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";
const SANS  = "'Archivo Black', system-ui, sans-serif";

const DAY_ABBREVS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
  .wstrip { border: 2px solid ${INK}; margin-top: 0; }
  .wstrip-all {
    display: block; width: 100%; padding: 9px 0;
    font-family: ${SANS}; font-size: 9px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
    border-bottom: 2px solid ${INK}; cursor: pointer; transition: background 0.12s;
  }
  .wstrip-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .wstrip-cell {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 0; cursor: pointer; border-right: 1px solid ${INK}; transition: background 0.12s;
  }
  .wstrip-cell:nth-child(7n) { border-right: none; }
  .wstrip-cell:nth-child(n+8) { border-top: 1px solid ${INK}; }

  @media (min-width: 768px) {
    .wstrip-grid { grid-template-columns: repeat(14, 1fr); }
    .wstrip-cell { border-right: 1px solid ${INK}; }
    .wstrip-cell:nth-child(7n) { border-right: 1px solid ${INK}; }
    .wstrip-cell:last-child { border-right: none; }
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
        {/* "All upcoming" header row */}
        <button
          className="wstrip-all"
          onClick={() => onSelect(null)}
          style={{
            background: selected === null ? INK : "transparent",
            color: selected === null ? CREAM : INK,
          }}
        >
          All upcoming
        </button>

        <div className="wstrip-grid">
          {days.map((iso) => {
            const d = parseISO(iso);
            const isToday   = iso === today;
            const isSelected = iso === selected;
            const hasSales  = saleDates.includes(iso);

            return (
              <button
                key={iso}
                className="wstrip-cell"
                onClick={() => onSelect(isSelected ? null : iso)}
                style={{
                  background: isSelected ? INK : isToday ? `${INK}0a` : "transparent",
                  color: isSelected ? CREAM : INK,
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1 }}>
                  {isToday ? "Today" : DAY_ABBREVS[d.getDay()]}
                </span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 22, lineHeight: 1, marginTop: 2 }}>
                  {d.getDate()}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 8, marginTop: 1, color: isSelected ? CREAM : INK }}>
                  {MONTH_ABBREVS[d.getMonth()]}
                </span>
                {hasSales && (
                  <div style={{ marginTop: 4, width: 5, height: 5, borderRadius: "50%", background: isSelected ? CREAM : RED }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
