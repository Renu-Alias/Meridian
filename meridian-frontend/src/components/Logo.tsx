function OrbitalRing({ size, duration, delay, reverse }: { size: number; duration: number; delay: number; reverse?: boolean }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none" style={{ animation: `spin${reverse ? 'Reverse' : ''} ${duration}s linear infinite`, animationDelay: `${delay}s` }}>
      <circle cx="50" cy="50" r={size} stroke="#00C896" strokeWidth="0.5" strokeDasharray={`${Math.PI * size * 0.3} ${Math.PI * size * 0.7}`} strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function OrbitDot({ angle, radius, size, duration, delay }: { angle: number; radius: number; size: number; duration: number; delay: number }) {
  const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
  const y = 50 + Math.sin((angle * Math.PI) / 180) * radius;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" style={{ animation: `spin ${duration}s linear infinite`, animationDelay: `${delay}s` }}>
      <circle cx={x} cy={y} r={size} fill="#00C896" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 8, md: 10, lg: 14 };
  const imgSize = sizeMap[size];
  const containerSize = imgSize + 2;
  const dim = containerSize * 4;

  return (
    <span className={`group relative grid place-items-center ${className}`} style={{ width: `${dim}px`, height: `${dim}px` }}>
      <span
        className="absolute inset-0 rounded-xl bg-[conic-gradient(from_0deg,transparent_0deg,#00C896_60deg,transparent_120deg,transparent_240deg,#00C896_300deg,transparent_360deg)] opacity-0 transition-all duration-700 group-hover:opacity-40"
        style={{ animation: 'spin 6s linear infinite' }}
      />
      <span className="absolute inset-[1.5px] rounded-[calc(0.75rem-1.5px)] bg-black" />

      <OrbitalRing size={40} duration={10} delay={0} />
      <OrbitalRing size={34} duration={14} delay={0.7} reverse />

      <OrbitDot angle={0} radius={40} size={1.2} duration={10} delay={0} />
      <OrbitDot angle={120} radius={40} size={1} duration={10} delay={0} />
      <OrbitDot angle={240} radius={40} size={1.4} duration={10} delay={0} />
      <OrbitDot angle={80} radius={34} size={0.9} duration={14} delay={0.7} />
      <OrbitDot angle={220} radius={34} size={1.1} duration={14} delay={0.7} />

      <span className="relative grid h-full w-full place-items-center p-[12%]">
        <img src="/logo.png" alt="Meridian" className="h-full w-full object-contain" />
      </span>

      <span className="absolute -inset-1 animate-pingSlow rounded-xl border border-verified/0 transition-all duration-500 group-hover:border-verified/30" />
    </span>
  );
}
