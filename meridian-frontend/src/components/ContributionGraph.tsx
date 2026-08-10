import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────

const LEVEL_COLORS      = ['#161b22', '#0d3d33', '#0f6b52', '#17a878', '#2dd4a3'];
const LEVEL_COLORS_MINI = ['#161b22', '#0b3530', '#0d5e49', '#14956b', '#27b890'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Fallback earliest year when no account-creation date is known.
const MIN_YEAR = 2023;

// Cell geometry
const CELL   = 11;   // px — square cell
const GAP    =  2;   // px — gap between cells
const STRIDE = CELL + GAP;  // 13px per cell

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Deterministic per-user activity: seeded by the user handle so each profile
 *  shows a different pattern, and zeroed before the account was created so a
 *  brand-new user never gets a full green graph. */
function generateActivity(year: number, seedKey: string, sinceMs: number): number[] {
  const days = isLeapYear(year) ? 366 : 365;
  let base = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    base ^= seedKey.charCodeAt(i);
    base = Math.imul(base, 16777619);
  }
  base = base >>> 0;
  return Array.from({ length: days }, (_, i) => {
    const dayMs = Date.UTC(year, 0, i + 1);
    if (sinceMs > 0 && dayMs < sinceMs) return 0;
    const seed = (i * 2654435761 + year * 1664525 + base * 2246822519) >>> 0;
    const hash = (seed ^ (seed >>> 16)) & 0xffff;
    const roll = hash % 100;
    if (roll < 35) return 0;
    if (roll < 55) return 1;
    if (roll < 75) return 2;
    if (roll < 90) return 3;
    return 4;
  });
}

/** Build a per-day contribution count from real activity events (ISO dates).
 *  Days with no events stay 0, so a brand-new user with no activity renders an
 *  empty graph instead of a seeded green one. */
function buildActivityFromEvents(events: ContributionEvent[], year: number): number[] {
  const days = isLeapYear(year) ? 366 : 365;
  const yearStart = Date.UTC(year, 0, 1);
  const counts = new Array<number>(days).fill(0);
  for (const ev of events) {
    const d = new Date(ev.date);
    if (Number.isNaN(d.getTime())) continue;
    const dayMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const doy = Math.floor((dayMs - yearStart) / 86400000);
    if (doy >= 0 && doy < days) counts[doy] += ev.weight ?? 1;
  }
  return counts;
}

function isLeapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function formatDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ─── types ────────────────────────────────────────────────────────────────────

type Props = {
  variant?: 'full' | 'mini';
  weeks?: number;
  year?: number;
  /** Per-user seed (e.g. username) so each profile renders a distinct pattern. */
  seedKey?: string;
  /** ISO timestamp of account creation — cells before this date render empty. */
  since?: string;
  /** Real activity events (ISO dates). When provided, the graph is drawn from
   *  these instead of the seeded pseudo-random pattern, so users with no
   *  activity get an empty graph. */
  events?: ContributionEvent[];
};

type ContributionEvent = { date: string; weight?: number };

type Cell = { date: Date; level: number; tooltip: string };

// ─── component ────────────────────────────────────────────────────────────────

export function ContributionGraph({ variant = 'full', weeks: weekProp, year, seedKey = 'default', since, events }: Props) {
  const currentYear  = new Date().getFullYear();

  const sinceMs = useMemo(() => {
    const t = since ? new Date(since).getTime() : 0;
    return Number.isNaN(t) ? 0 : t;
  }, [since]);

  // A user's contribution graph only goes back to the year they joined — a brand-new
  // account has no history before that, so older years aren't selectable.
  const minYear = useMemo(() => {
    if (sinceMs > 0) {
      const y = new Date(sinceMs).getUTCFullYear();
      if (!Number.isNaN(y)) return y;
    }
    return MIN_YEAR;
  }, [sinceMs]);

  const [selYear, setSelYear] = useState(() => Math.min(currentYear, Math.max(minYear, year ?? currentYear)));
  const [hovered, setHovered]  = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isMini      = variant === 'mini';
  const totalWeeks  = weekProp ?? (isMini ? 10 : 53);
  const colors      = isMini ? LEVEL_COLORS_MINI : LEVEL_COLORS;

  // ── build grid data ──────────────────────────────────────────────────────
  const { cells, monthLabels, total } = useMemo(() => {
    const activity = events ? buildActivityFromEvents(events, selYear) : generateActivity(selYear, seedKey, sinceMs);
    const jan1 = new Date(selYear, 0, 1);
    // Monday = 0 offset
    const startOffset = (jan1.getDay() + 6) % 7;
    const totalCells  = totalWeeks * 7;

    const cells: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startOffset;
      const date      = new Date(jan1.getTime() + dayOffset * 86400000);
      const doy       = Math.floor((date.getTime() - jan1.getTime()) / 86400000);
      const count     = doy >= 0 && doy < activity.length ? activity[doy] : 0;
      const level     = Math.min(4, count);
      cells.push({ date, level, tooltip: `${formatDate(date)} — ${count} contribution${count !== 1 ? 's' : ''}` });
    }

    // Month label positions — place at the first week whose Monday is in that month.
    // Skip December if it appears at the very start (prior-year spillover weeks).
    // Always emit January unconditionally so it's never suppressed.
    const monthLabels: Array<{ label: string; x: number }> = [];
    let lastMonth = -1;
    for (let w = 0; w < totalWeeks; w++) {
      const mondayCell = cells[w * 7]; // row 0 = Monday
      if (!mondayCell) continue;
      const m = mondayCell.date.getMonth();
      if (m !== lastMonth) {
        const x = w * STRIDE;
        // Skip December spillover at the very beginning of the grid
        if (m === 11 && monthLabels.length === 0) {
          lastMonth = m;
          continue;
        }
        const prev = monthLabels[monthLabels.length - 1];
        // Jan always gets through; other months need 2-week clearance
        const clearance = m === 0 || !prev || x - prev.x >= STRIDE * 2;
        if (clearance) {
          monthLabels.push({ label: MONTH_NAMES[m], x });
        }
        lastMonth = m;
      }
    }

    const total = activity.reduce((s, v) => s + v, 0);
    return { cells, monthLabels, total };
  }, [selYear, totalWeeks, seedKey, sinceMs, events]);

  // ── dimensions ──────────────────────────────────────────────────────────
  const gridW  = totalWeeks * STRIDE - GAP;   // exact pixel width of cell grid
  const svgW   = gridW;                        // no gutter — labels removed

  // Tooltip positioning — keep inside bounds
  function tooltipX(col: number): number {
    const cx = col * STRIDE + CELL / 2;
    return Math.max(50, Math.min(svgW - 50, cx));
  }

  return (
    <div ref={wrapRef}>
      {/* ── header (full only) ──────────────────────────────────────────── */}
      {!isMini && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm" style={{ color: '#71767b' }}>
            <span className="font-bold" style={{ color: '#e7e9ea' }}>
              {total.toLocaleString()}
            </span>{' '}
            contributions in {selYear}
          </p>
          <div className="flex items-center gap-0.5">
            <button
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]"
              style={{ color: selYear <= minYear ? '#2f3336' : '#536471' }}
              onClick={() => setSelYear((y) => Math.max(minYear, y - 1))}
              disabled={selYear <= minYear}
              aria-label="Previous year"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="w-11 text-center text-sm font-semibold tabular-nums" style={{ color: '#e7e9ea' }}>
              {selYear}
            </span>
            <button
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]"
              style={{ color: selYear >= currentYear ? '#2f3336' : '#536471' }}
              onClick={() => setSelYear((y) => Math.min(currentYear, y + 1))}
              disabled={selYear >= currentYear}
              aria-label="Next year"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── scrollable SVG canvas ───────────────────────────────────────── */}
      <div className="overflow-x-auto thin-scrollbar">
        <svg
          width={svgW}
          height={7 * STRIDE - GAP + (isMini ? 0 : 20)}
          style={{ display: 'block' }}
        >
          {/* Month labels (full only) */}
          {!isMini && monthLabels.map(({ label, x }) => (
            <text
              key={label + x}
              x={x}
              y={12}
              fontSize={11}
              fill="#536471"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Cell grid */}
          {cells.map((cell, idx) => {
            const col = Math.floor(idx / 7);
            const row = idx % 7;
            const cx  = col * STRIDE;
            const cy  = (isMini ? 0 : 20) + row * STRIDE;
            return (
              <rect
                key={idx}
                x={cx}
                y={cy}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={colors[cell.level]}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              />
            );
          })}

          {/* Tooltip */}
          {hovered !== null && (() => {
            const col  = Math.floor(hovered / 7);
            const row  = hovered % 7;
            const tx   = tooltipX(col);
            const ty   = (isMini ? 0 : 20) + row * STRIDE - 8;
            const tip  = cells[hovered]?.tooltip ?? '';
            const tipW = tip.length * 6.2 + 16;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={tx - tipW / 2}
                  y={ty - 22}
                  width={tipW}
                  height={20}
                  rx={4}
                  fill="#1a1a1a"
                  stroke="#2f3336"
                  strokeWidth={1}
                />
                <text
                  x={tx}
                  y={ty - 8}
                  fontSize={11}
                  fill="#e7e9ea"
                  textAnchor="middle"
                  fontFamily="inherit"
                >
                  {tip}
                </text>
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: '#536471' }}>
          <span>Less</span>
          {colors.map((c, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width:  isMini ? 8 : 10,
                height: isMini ? 8 : 10,
                background: c,
                borderRadius: 2,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
