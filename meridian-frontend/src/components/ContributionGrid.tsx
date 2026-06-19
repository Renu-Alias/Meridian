const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const levels = ['bg-surface', 'bg-verified/20', 'bg-verified/45', 'bg-verified', 'bg-emerald-700'];

export function ContributionGrid() {
  const cells = Array.from({ length: 53 * 7 }, (_, index) => {
    const value = (index * 17 + Math.floor(index / 11) * 7) % 13;
    return value > 10 ? 4 : value > 7 ? 3 : value > 4 ? 2 : value > 2 ? 1 : 0;
  });

  return (
    <div className="overflow-x-auto pb-2 thin-scrollbar" aria-label="Meridian contribution tracker">
      <div className="min-w-[860px]">
        <div className="mb-2 ml-[38px] grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 text-[11px] text-muted">
          {months.map((month, index) => (
            <span key={month} className={index % 4 === 0 ? 'block' : 'invisible'}>
              {month}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-2">
          <div className="grid h-[112px] grid-rows-7 gap-1 pt-[1px] text-[11px] leading-3 text-muted">
            {weekdayLabels.map((label, index) => (
              <span key={`${label}-${index}`} className="h-3">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {cells.map((level, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-[2px] ${levels[level]}`}
                title={`${level} contribution level`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>Less</span>
          <div className="flex items-center gap-1.5">
            {levels.map((level, index) => (
              <span key={index} className={`h-3 w-3 rounded-[2px] ${level}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
