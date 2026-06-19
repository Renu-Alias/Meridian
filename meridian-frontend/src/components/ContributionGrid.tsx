const levels = ['bg-surface', 'bg-verified/20', 'bg-verified/55', 'bg-verified', 'bg-emerald-700'];

export function ContributionGrid() {
  const cells = Array.from({ length: 52 * 7 }, (_, index) => {
    const value = (index * 13 + Math.floor(index / 7) * 5) % 11;
    return value > 8 ? 4 : value > 5 ? 3 : value > 3 ? 2 : value > 1 ? 1 : 0;
  });

  return (
    <div className="overflow-x-auto thin-scrollbar" aria-label="Meridian contribution tracker">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
        {cells.map((level, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-sm ${levels[level]}`}
            title={`${level} contribution level`}
          />
        ))}
      </div>
    </div>
  );
}
