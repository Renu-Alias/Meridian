import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LEVEL_COLORS = ['#1a1a1a', '#0d3d33', '#0f6b52', '#17a878', '#2dd4a3'];
const LEVEL_COLORS_MINI = ['#1a1a1a', '#0b3530', '#0d5e49', '#14956b', '#27b890'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

type ContributionGraphProps = {
  variant?: 'full' | 'mini';
  weeks?: number;
  year?: number;
};

function generateActivity(year: number): number[] {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const dayCount = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  return Array.from({ length: dayCount }, (_, i) => {
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

function formatDate(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function Legend({ mini }: { mini: boolean }) {
  const colors = mini ? LEVEL_COLORS_MINI : LEVEL_COLORS;
  return (
    <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: '#536471' }}>
      <span>Less</span>
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block rounded-[2px]"
          style={{ width: mini ? 8 : 10, height: mini ? 8 : 10, background: c }}
        />
      ))}
      <span>More</span>
    </div>
  );
}

export function ContributionGraph({ variant = 'full', weeks: weekProp, year }: ContributionGraphProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year ?? currentYear);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isMini = variant === 'mini';
  const cellSize = isMini ? 7 : 11;
  const gap = isMini ? 2 : 2.5;
  const totalWeeks = weekProp ?? (isMini ? 10 : 53);
  const colors = isMini ? LEVEL_COLORS_MINI : LEVEL_COLORS;
  const labelWidth = isMini ? 0 : 28;

  const { cells, monthLabels, totalContributions, monthBoundaries } = useMemo(() => {
    const activity = generateActivity(selectedYear);
    const jan1 = new Date(selectedYear, 0, 1);
    const startDayOfWeek = (jan1.getDay() + 6) % 7; // Monday = 0

    const totalCells = totalWeeks * 7;
    const cells: Array<{ date: Date; level: number; label: string }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startDayOfWeek;
      const date = new Date(jan1.getTime() + dayOffset * 86400000);
      const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000);
      const level = dayOfYear >= 0 && dayOfYear < activity.length ? activity[dayOfYear] : 0;
      cells.push({ date, level, label: `${formatDate(date)} — ${level} contribution${level !== 1 ? 's' : ''}` });
    }

    // Month labels: placed at first week of each month
    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    const monthBoundaries = new Set<number>(); // week indices where a new month starts
    if (!isMini) {
      let lastMonth = -1;
      for (let week = 0; week < totalWeeks; week++) {
        const firstDayIndex = week * 7;
        if (firstDayIndex < cells.length) {
          const m = cells[firstDayIndex].date.getMonth();
          if (m !== lastMonth) {
            MONTH_NAMES[m] && monthLabels.push({ label: MONTH_NAMES[m], weekIndex: week });
            if (lastMonth !== -1) monthBoundaries.add(week); // don't draw line before Jan
            lastMonth = m;
          }
        }
      }
    }

    const totalContributions = activity.reduce((sum, v) => sum + v, 0);
    return { cells, monthLabels, totalContributions, monthBoundaries };
  }, [selectedYear, totalWeeks, isMini]);

  const gridWidth = totalWeeks * (cellSize + gap) - gap;

  return (
    <div>
      {/* Header: total count + year navigator (full variant only) */}
      {!isMini && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: '#71767b' }}>
            <span className="font-bold" style={{ color: '#e7e9ea' }}>{totalContributions.toLocaleString()}</span>
            {' '}contributions in {selectedYear}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]"
              style={{ color: '#536471' }}
              onClick={() => setSelectedYear((y) => y - 1)}
              aria-label="Previous year"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="w-10 text-center text-sm font-semibold" style={{ color: '#e7e9ea' }}>
              {selectedYear}
            </span>
            <button
              className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]"
              style={{ color: selectedYear >= currentYear ? '#2f3336' : '#536471' }}
              onClick={() => setSelectedYear((y) => Math.min(currentYear, y + 1))}
              disabled={selectedYear >= currentYear}
              aria-label="Next year"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto thin-scrollbar">
        {/* Month labels row */}
        {!isMini && (
          <div
            className="relative mb-1.5 h-4 text-[11px]"
            style={{ marginLeft: labelWidth + gap, width: gridWidth, color: '#536471' }}
          >
            {monthLabels.map((ml) => (
              <span
                key={ml.label + ml.weekIndex}
                className="absolute"
                style={{ left: ml.weekIndex * (cellSize + gap) }}
              >
                {ml.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start" style={{ gap }}>
          {/* Day-of-week labels */}
          {!isMini && (
            <div className="flex flex-col shrink-0" style={{ width: labelWidth, gap }}>
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="text-[11px] leading-none"
                  style={{ height: cellSize, color: '#536471', display: 'flex', alignItems: 'center' }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Grid — rendered as columns (weeks) */}
          <div className="relative flex" style={{ gap }}>
            {Array.from({ length: totalWeeks }, (_, weekIndex) => (
              <div
                key={weekIndex}
                className="relative flex flex-col"
                style={{ gap, width: cellSize }}
              >
                {/* Month boundary line */}
                {!isMini && monthBoundaries.has(weekIndex) && (
                  <div
                    className="absolute -left-[3px] top-0 bottom-0 w-px pointer-events-none"
                    style={{ background: '#2f3336' }}
                  />
                )}
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const cellIndex = weekIndex * 7 + dayIndex;
                  const cell = cells[cellIndex];
                  if (!cell) return <div key={dayIndex} style={{ width: cellSize, height: cellSize }} />;
                  return (
                    <div
                      key={dayIndex}
                      className="relative rounded-[2px]"
                      style={{ width: cellSize, height: cellSize, background: colors[cell.level], cursor: 'default' }}
                      onMouseEnter={() => setHoveredIndex(cellIndex)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {hoveredIndex === cellIndex && (
                        <span
                          className="absolute z-20 whitespace-nowrap rounded px-2 py-1 text-[11px] shadow-lg pointer-events-none"
                          style={{
                            bottom: cellSize + 6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#1a1a1a',
                            color: '#e7e9ea',
                            border: '1px solid #2f3336',
                          }}
                        >
                          {cell.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Legend mini={isMini} />
      </div>
    </div>
  );
}
