import { useState, useMemo } from 'react';

const LEVEL_COLORS = ['#1a1a1a', '#0d3d33', '#0f6b52', '#17a878', '#2dd4a3'];

const LEVEL_COLORS_MINI = ['#1a1a1a', '#0b3530', '#0d5e49', '#14956b', '#27b890'];

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
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function Legend({ mini }: { mini: boolean }) {
  const colors = mini ? LEVEL_COLORS_MINI : LEVEL_COLORS;
  return (
    <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: '#536471' }}>
      <span>Less</span>
      {colors.map((c, i) => (
        <span key={i} className="inline-block rounded-[2px]" style={{ width: mini ? 8 : 10, height: mini ? 8 : 10, background: c }} />
      ))}
      <span>More</span>
    </div>
  );
}

export function ContributionGraph({ variant = 'full', weeks: weekProp, year }: ContributionGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentYear = year ?? new Date().getFullYear();
  const isMini = variant === 'mini';
  const cellSize = isMini ? 7 : 11;
  const gap = isMini ? 2 : 2.5;
  const totalWeeks = weekProp ?? (isMini ? 10 : 53);
  const colors = isMini ? LEVEL_COLORS_MINI : LEVEL_COLORS;

  const { cells, monthLabels } = useMemo(() => {
    const activity = generateActivity(currentYear);
    const jan1 = new Date(currentYear, 0, 1);
    const startDayOfWeek = (jan1.getDay() + 6) % 7; // Monday=0

    const totalCells = totalWeeks * 7;
    const cells: Array<{ date: Date; level: number; label: string }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - startDayOfWeek;
      const date = new Date(jan1.getTime() + dayOffset * 86400000);
      const dayOfYear = Math.floor((date.getTime() - jan1.getTime()) / 86400000);
      const level = dayOfYear >= 0 && dayOfYear < activity.length ? activity[dayOfYear] : 0;
      cells.push({
        date,
        level,
        label: `${formatDate(date)} — ${level} contribution${level !== 1 ? 's' : ''}`,
      });
    }

    // Month labels for full variant
    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    if (!isMini) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let lastMonth = -1;
      for (let week = 0; week < totalWeeks; week++) {
        const firstDayIndex = week * 7;
        if (firstDayIndex < cells.length) {
          const m = cells[firstDayIndex].date.getMonth();
          if (m !== lastMonth) {
            monthNames[m] && monthLabels.push({ label: monthNames[m], weekIndex: week });
            lastMonth = m;
          }
        }
      }
    }

    return { cells, monthLabels };
  }, [currentYear, totalWeeks, isMini]);

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];
  const gridWidth = totalWeeks * (cellSize + gap) - gap;
  const labelWidth = isMini ? 0 : 32;

  return (
    <div className="overflow-x-auto thin-scrollbar">
      {/* Month labels */}
      {!isMini && (
        <div className="relative mb-1 ml-[32px] h-4 text-[11px]" style={{ width: gridWidth, color: '#536471' }}>
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

      <div className="flex items-start gap-0">
        {/* Day-of-week labels (full only) */}
        {!isMini && (
          <div className="flex flex-col" style={{ width: labelWidth, gap }}>
            {dayLabels.map((label, i) => (
              <span key={i} className="text-[11px] leading-none" style={{ height: cellSize, color: '#536471', display: 'flex', alignItems: 'center' }}>
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${totalWeeks}, ${cellSize}px)`,
            gridTemplateRows: `repeat(7, ${cellSize}px)`,
            gap,
          }}
        >
          {cells.map((cell, index) => (
            <div
              key={index}
              className="relative rounded-[2px]"
              style={{
                width: cellSize,
                height: cellSize,
                background: colors[cell.level],
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <span
                  className="absolute z-20 whitespace-nowrap rounded px-2 py-1 text-[11px] shadow-lg"
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
          ))}
        </div>
      </div>

      <Legend mini={isMini} />
    </div>
  );
}
