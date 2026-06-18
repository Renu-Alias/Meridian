import { useMemo, useState } from 'react';
import { clsx } from 'clsx';

// Grayscale ramp: 0, 1, 2, 3, 4
// 0: #EAECEC (surface) - technically background of cell, but let's use surface/10 or surface/5
// 1: light gray
// 2: #999B9B (muted)
// 3: dark gray
// 4: #000000 (primary) -> actually since our background is primary, we need contrast.
// Wait, the PRD says: "no contributions stays --color-surface (#EAECEC)... heaviest days reach --color-primary (#000000)".
// If the background is #000000, then #000000 is invisible.
// Ah, the PRD says: "Color intensity ramps through shades of your primary theme color to preserve a unified aesthetic—no contributions stays --color-surface (#EAECEC), light activity steps up through a light-gray, moderate activity lands on --color-muted (#999B9B), and the heaviest days reach --color-primary (#000000)."
// So a cell with no contributions is EAECEC (white-ish), and a cell with high contributions is 000000 (black). This assumes a light mode? But PRD says "maintain a hyper-minimal, dark-mode aesthetic". 
// If background is true black (#000000) and text is surface (#EAECEC).
// Then no contributions should be #000000 (invisible/background), or a very faint outline. Wait, PRD specifically says "no contributions stays --color-surface".
// So let's follow PRD literally: 
// 0 (none): #EAECEC (surface)
// 1 (low): #D1D5DB (gray-300)
// 2 (medium): #999B9B (muted)
// 3 (high): #4B5563 (gray-600)
// 4 (max): #000000 (primary - true black)
// But to make black visible on a black background, maybe it has a border, or the whole tracker has a surface background? 
// PRD: "A 52-week × 7-day grid of small squares (~10–12px, ~2px gap)". Let's just implement the ramp exactly.

const RAMP_COLORS = [
  'bg-surface',            // 0
  'bg-[#D1D5DB]',          // 1
  'bg-muted',              // 2
  'bg-[#4B5563]',          // 3
  'bg-primary border border-surface/20' // 4 - added border so it's visible on primary background
];

function generateMockData() {
  const data = [];
  for (let i = 0; i < 52 * 7; i++) {
    // Random 0-4 skewed heavily to 0
    let val = 0;
    if (Math.random() > 0.6) val = 1;
    if (Math.random() > 0.8) val = 2;
    if (Math.random() > 0.9) val = 3;
    if (Math.random() > 0.95) val = 4;
    data.push({
      date: new Date(Date.now() - (52 * 7 - i) * 24 * 60 * 60 * 1000),
      count: val,
      raw: val * Math.floor(Math.random() * 3) + val // fake number
    });
  }
  return data;
}

export function ContributionTracker() {
  const data = useMemo(() => generateMockData(), []);
  const [hovered, setHovered] = useState<{date: Date, raw: number} | null>(null);

  // Split into weeks
  const weeks = [];
  for (let i = 0; i < 52; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="w-full">
      <div className="flex items-end mb-2 space-x-2 text-xs text-muted">
        <span>412 contributions in the last 12 months</span>
      </div>

      <div className="flex">
        {/* Day Labels */}
        <div className="flex flex-col justify-between text-[10px] text-muted mr-2 py-[2px]">
          <div className="invisible">Sun</div>
          <div>Mon</div>
          <div className="invisible">Tue</div>
          <div>Wed</div>
          <div className="invisible">Thu</div>
          <div>Fri</div>
          <div className="invisible">Sat</div>
        </div>

        {/* Grid */}
        <div className="flex space-x-[3px] overflow-x-auto pb-4 pt-1 relative">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col space-y-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  className={clsx(
                    "w-[11px] h-[11px] rounded-sm transition-colors duration-200 cursor-pointer",
                    RAMP_COLORS[day.count]
                  )}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </div>
          ))}

          {/* Tooltip */}
          {hovered && (
            <div className="absolute top-0 right-0 bg-surface text-primary px-3 py-2 rounded shadow-lg text-xs font-medium z-10 -translate-y-full mb-2 pointer-events-none whitespace-nowrap">
              {hovered.raw === 0 ? 'No contributions' : `${hovered.raw} contributions`} on {hovered.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end text-xs text-muted mt-2 space-x-2">
        <span>Less</span>
        <div className="flex space-x-[3px]">
          {RAMP_COLORS.map((color, i) => (
            <div key={i} className={clsx("w-[11px] h-[11px] rounded-sm", color)} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
