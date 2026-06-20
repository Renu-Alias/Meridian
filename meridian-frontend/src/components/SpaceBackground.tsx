import { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let frame = 0;

    const stars = Array.from({ length: 160 }, (_, i) => ({
      x: ((i * 37 + 13) % 100) / 100,
      y: ((i * 73 + 7) % 100) / 100,
      r: 0.3 + ((i * 131 + 5) % 100) / 100 * 1.2,
      phase: i * 1.7,
      baseAlpha: 0.12 + ((i * 53 + 11) % 100) / 100 * 0.35,
    }));

    const draw = () => {
      frame++;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, Math.max(w, h) * 0.9);
      bg.addColorStop(0, '#0e141c');
      bg.addColorStop(0.25, '#080b10');
      bg.addColorStop(0.6, '#040608');
      bg.addColorStop(1, '#000000');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nebulas = [
        { x: 0.15, y: 0.25, r: 0.42, c: 'rgba(28,42,72,0.06)' },
        { x: 0.72, y: 0.55, r: 0.38, c: 'rgba(48,22,58,0.045)' },
        { x: 0.45, y: 0.78, r: 0.32, c: 'rgba(12,48,64,0.05)' },
        { x: 0.82, y: 0.12, r: 0.28, c: 'rgba(35,55,80,0.04)' },
        { x: 0.25, y: 0.65, r: 0.3, c: 'rgba(20,50,70,0.04)' },
      ];
      for (const n of nebulas) {
        const nx = n.x * w;
        const ny = n.y * h;
        const nr = n.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        grad.addColorStop(0, n.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      const gx = w * 0.55, gy = h * 0.3;
      for (let a = 0; a < Math.PI * 2; a += 0.04) {
        const dist = 20 + a * 28;
        const sx = gx + Math.cos(a) * dist + Math.sin(a * 2) * 12;
        const sy = gy + Math.sin(a) * dist * 0.55 + Math.cos(a * 2) * 8;
        if (sx < 0 || sx > w || sy < 0 || sy > h) continue;
        const alpha = 0.008 + Math.sin(a * 3) * 0.006;
        ctx.fillStyle = `rgba(180, 195, 220, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6 + Math.sin(a * 2) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const star of stars) {
        const sx = star.x * w;
        const sy = star.y * h;
        const twinkle = Math.sin(frame * 0.015 + star.phase) * 0.35 + 0.65;
        const alpha = star.baseAlpha * twinkle;
        ctx.fillStyle = `rgba(200, 215, 235, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.r * (0.8 + twinkle * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />;
}
