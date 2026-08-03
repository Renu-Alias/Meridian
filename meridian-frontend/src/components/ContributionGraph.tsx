import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── constants ────────────────────────────────────────────────────────────────

const LEVEL_COLORS      = ['#161b22', '#0d3d33', '#0f6b52', '#17a878', '#2dd4a3'];
const LEVEL_COLORS_MINI = ['#161b22', '#0b3530', '#0d5e49', '#14956b', '#27b890'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Only label Mon, Wed, Fri (indices 0, 2, 4 in Mon-first week)
const DAY_LABELS: [number, string][] = [[0,'Mon'],[2,'Wed'],[4,'Fri']];

// Cell geometry
const CELL   = 11;   // px — square cell
const GAP    =  2;   // px — gap between cells
const STRIDE = CELL + GAP;  // 13px per cell

// Left gutter for day-of-week labels (full variant)
const GUTTER = 28;  // px

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateActivity(year: number): number[] {
  const days = isLeapYear(year) ? 366 : 365;
  return Array.from({ length: days }, (_, i) => {
    const seed = (i * 2654435761 + year * 1664525) >>> 0;
    const hash = (seed ^ (seed >>> 16)) & 0xffff;
    const roll = hash % 100;
    if (roll < 35) return 0;
    if (roll < 55) return 1;
    if (roll < 75) return 2;
    if (roll < 90) return 3;
    return 4;
  });
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
};

type Cell = { date: Date; level: number; tooltip: string };

// ─── component ────────────────────────────────────────────────────────────────

export function ContributionGraph({ variant = 'full', weeks: weekProp, year }: Props) {
  const currentYear  = new Date().getFullYear();
  const [selYear, setSelYear] = useState(year ?? currentYear);
  const [hovered, setHovered]  = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isMini      = variant === 'mini';
  const totalWeeks  = weekProp ?? (isMini ? 10 : 53);
  const colors      = isMini ? LEVEL_COLORS_MINI : LEVEL_COLORS;

  // ── build grid data ──────────────────────────────────────────────────────
  const { cells, monthLabels, total } = useMemo(() => {
    const activity = generateActivity(selYear);
    const jan1 = new Date(selYear, 0, 1);
    // Monday = 0 offset
    const startOffset = (jan1.getDay() + 6) % 7;
    const totalCells  = totalWeeks * 7;

    const cells: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startOffset;
      const date      = new Date(jan1.getTime() + dayOffset * 86400000);
      const doy       = Math.floor((date.getTime() - jan1.getTime()) / 86400000);
      const level     = doy >= 0 && doy < activity.length ? activity[doy] : 0;
      cells.push({ date, level, tooltip: `${formatDate(date)} — ${level} contribution${level !== 1 ? 's' : ''}` });
    }

    // Month label positions: place label at the FIRST full week of each month.
    // "full week" = week where Monday (row 0) belongs to that month.
    // This mirrors exactly how GitHub positions month labels.
    const monthLabels: Array<{ label: string; x: number }> = [];
    let lastMonth = -1;
    for (let w = 0; w < totalWeeks; w++) {
      const mondayCell = cells[w * 7]; // row 0 = Monday
      if (!mondayCell) continue;
      const m = mondayCell.date.getMonth();
      if (m !== lastMonth) {
        // Only emit the label if there's enough room to not overlap the previous one
        const x = w * STRIDE;
        const prev = monthLabels[monthLabels.length - 1];
        // Require at least 2 full weeks (26px) gap to the previous label
        if (!prev || x - prev.x >= STRIDE * 2) {
          monthLabels.push({ label: MONTH_NAMES[m], x });
        }
        lastMonth = m;
      }
    }

    const total = activity.reduce((s, v) => s + v, 0);
    return { cells, monthLabels, total };
  }, [selYear, totalWeeks]);

  // ── dimensions ──────────────────────────────────────────────────────────
  const gridW  = totalWeeks * STRIDE - GAP;         // exact pixel width of cell grid
  const gridH  = 7 * STRIDE - GAP;                  // exact pixel height of cell grid
  const svgW   = isMini ? gridW : GUTTER + gridW;   // total SVG canvas width
  const svgH   = gridH;

  // Tooltip positioning — keep inside bounds
  function tooltipX(col: number): number {
    const cx = (isMini ? 0 : GUTTER) + col * STRIDE + CELL / 2;
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
              style={{ color: '#536471' }}
              onClick={() => setSelYear((y) => y - 1)}
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
          height={svgH + (isMini ? 0 : 20)}   // +20px top margin for month labels
          style={{ display: 'block' }}
        >
          {/* Month labels (full only) */}
          {!isMini && monthLabels.map(({ label, x }) => (
            <text
              key={label + x}
              x={GUTTER + x}
              y={12}
              fontSize={11}
              fill="#536471"
              fontFamily="inherit"
            >
              {label}
            </text>
          ))}

          {/* Day-of-week labels (full only) */}
          {!isMini && DAY_LABELS.map(([row, name]) => (
            <text
              key={name}
              x={GUTTER - 4}
              y={20 + row * STRIDE + CELL * 0.75}
              fontSize={11}
              fill="#536471"
              textAnchor="end"
              fontFamily="inherit"
            >
              {name}
            </text>
          ))}

          {/* Cell grid */}
          {cells.map((cell, idx) => {
            const col = Math.floor(idx / 7);
            const row = idx % 7;
            const cx  = (isMini ? 0 : GUTTER) + col * STRIDE;
            const cy  = (isMini ? 0 : 20)     + row * STRIDE;
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
