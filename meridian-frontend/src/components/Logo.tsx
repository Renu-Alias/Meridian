import { useRef, useState, useEffect } from 'react';

function OrbitalRing({ size, duration, delay, reverse }: { size: number; duration: number; delay: number; reverse?: boolean }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      fill="none"
      style={{ animation: `spin${reverse ? 'Reverse' : ''} ${duration}s linear infinite`, animationDelay: `${delay}s` }}
    >
      <circle
        cx="50" cy="50" r={size}
        stroke="url(#orbitalGrad)"
        strokeWidth="0.5"
        strokeDasharray={`${Math.PI * size * 0.4} ${Math.PI * size * 0.6}`}
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function OrbitDot({ angle, radius, size, duration, delay }: { angle: number; radius: number; size: number; duration: number; delay: number }) {
  const x = 50 + Math.cos((angle * Math.PI) / 180) * radius;
  const y = 50 + Math.sin((angle * Math.PI) / 180) * radius;
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      style={{ animation: `spin ${duration}s linear infinite`, animationDelay: `${delay}s` }}
    >
      <circle cx={x} cy={y} r={size} fill="#00C896" opacity="0.7">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 8, md: 10, lg: 14 };
  const imgSize = sizeMap[size];
  const containerSize = imgSize + 2;

  return (
    <span className={`group relative grid place-items-center ${className}`} style={{ width: `${containerSize * 4}px`, height: `${containerSize * 4}px` }}>
      <span className="absolute inset-0 animate-spinSlow rounded-lg bg-[conic-gradient(from_0deg,transparent_0deg,#00C896_60deg,transparent_120deg,transparent_240deg,#00C896_300deg,transparent_360deg)] opacity-30 transition-opacity group-hover:opacity-60" />
      <span className="absolute inset-[2px] rounded-[7px] bg-black" />

      <OrbitalRing size={38} duration={8} delay={0} />
      <OrbitalRing size={32} duration={12} delay={0.5} reverse />

      <OrbitDot angle={0} radius={38} size={1.2} duration={8} delay={0} />
      <OrbitDot angle={120} radius={38} size={1} duration={8} delay={0} />
      <OrbitDot angle={240} radius={38} size={1.4} duration={8} delay={0} />
      <OrbitDot angle={60} radius={32} size={0.8} duration={12} delay={0.5} />
      <OrbitDot angle={200} radius={32} size={1.1} duration={12} delay={0.5} />

      <span className="relative grid h-full w-full place-items-center">
        <img
          src="/logo-icon.png"
          alt="Meridian"
          className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,200,150,0.6)]"
        />
      </span>

      <span className="absolute -inset-1 animate-pingSlow rounded-lg border border-verified/0 group-hover:border-verified/30" />
    </span>
  );
}
