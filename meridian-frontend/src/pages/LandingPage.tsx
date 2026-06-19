import { useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ScrollStory } from '../components/ScrollStory';

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS ANIMATOR
   Draws layered stars + volumetric drifting clouds + aurora streaks
   entirely with requestAnimationFrame — no external GL dependency needed.
───────────────────────────────────────────────────────────────────────── */

interface Star {
  x: number; y: number; r: number; a: number; speed: number; twinkle: number;
}

interface Cloud {
  x: number; y: number; w: number; h: number; speed: number; opacity: number;
  layer: number; color: string;
}

interface Streak {
  x: number; y: number; len: number; angle: number; opacity: number;
  speed: number; life: number; maxLife: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number;
  opacity: number; color: string;
}

function initCanvas(canvas: HTMLCanvasElement) {
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;

  // Stars
  const STAR_COUNT = 280;
  const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.6,
    r: Math.random() * 1.4 + 0.2,
    a: Math.random(),
    speed: Math.random() * 0.008 + 0.003,
    twinkle: Math.random() * Math.PI * 2,
  }));

  // Volumetric cloud layers (dark to mid-gray) 
  const cloudColors = ['#0d0d0e', '#111213', '#161718', '#1c1d1e', '#222426', '#2a2c2e'];
  const clouds: Cloud[] = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * W * 1.8 - W * 0.4,
    y: H * 0.15 + Math.random() * H * 0.7,
    w: 220 + Math.random() * 500,
    h: 80 + Math.random() * 200,
    speed: 0.04 + Math.random() * 0.08 + (i % 3) * 0.03,
    opacity: 0.2 + Math.random() * 0.6,
    layer: i % 3,
    color: cloudColors[Math.floor(Math.random() * cloudColors.length)],
  }));

  // Aurora streaks
  const streaks: Streak[] = Array.from({ length: 6 }, () => ({
    x: Math.random() * W,
    y: H * 0.1 + Math.random() * H * 0.5,
    len: 80 + Math.random() * 200,
    angle: -Math.PI / 6 + Math.random() * Math.PI / 3,
    opacity: 0,
    speed: 0.003 + Math.random() * 0.004,
    life: 0,
    maxLife: 200 + Math.random() * 300,
  }));

  // Floating data particles
  const dataColors = ['#3a3a3a', '#555', '#777', '#444', '#666'];
  const particles: Particle[] = Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    r: 1 + Math.random() * 2.5,
    opacity: 0.2 + Math.random() * 0.5,
    color: dataColors[Math.floor(Math.random() * dataColors.length)],
  }));

  return { W, H, stars, clouds, streaks, particles };
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, t: number) {
  const { x, y, w, h, opacity, color } = cloud;
  ctx.save();
  ctx.globalAlpha = opacity;

  // Main cloud body – stacked radial gradients give volumetric feel
  const gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) / 1.5);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color + 'cc');
  gradient.addColorStop(1, 'transparent');

  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Secondary puffs for definition
  const puffCount = 4;
  for (let p = 0; p < puffCount; p++) {
    const px = x + (p / puffCount) * w + Math.sin(t * 0.3 + p) * 6;
    const py = y + h * 0.3 + Math.cos(t * 0.2 + p) * 4;
    const pr = h * (0.3 + p * 0.05);
    const pg = ctx.createRadialGradient(px, py, 0, px, py, pr);
    pg.addColorStop(0, color + 'aa');
    pg.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(px, py, pr * 1.6, pr * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = pg;
    ctx.fill();
  }

  ctx.restore();
}

function drawStreak(ctx: CanvasRenderingContext2D, s: Streak) {
  if (s.opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha = s.opacity * 0.4;
  const ex = s.x + Math.cos(s.angle) * s.len;
  const ey = s.y + Math.sin(s.angle) * s.len;
  const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.4, 'rgba(180,180,180,0.6)');
  grad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawKnowledgeLines(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  const DIST = 90;
  ctx.save();
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < DIST) {
        const alpha = (1 - d / DIST) * 0.12;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────
   ANIMATION HOOK
───────────────────────────────────────────────────────────────────────── */
function useAtmosphereCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>
) {
  const stateRef = useRef<ReturnType<typeof initCanvas> | null>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    if (canvas.offsetWidth !== stateRef.current?.W || canvas.offsetHeight !== stateRef.current?.H) {
      stateRef.current = initCanvas(canvas);
    }

    const state = stateRef.current!;
    const { W, H, stars, clouds, streaks, particles } = state;
    const t = frameRef.current;
    frameRef.current++;

    const mx = mouseX.get() * W;
    const my = mouseY.get() * H;

    // ── Background gradient (dark sky to charcoal ground)
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#06080a');
    bg.addColorStop(0.35, '#0b0d10');
    bg.addColorStop(0.7, '#111316');
    bg.addColorStop(1, '#1a1c20');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── Stars (upper 60% only)
    for (const s of stars) {
      s.twinkle += s.speed;
      const alpha = 0.3 + Math.sin(s.twinkle) * 0.5;
      // Parallax from mouse
      const px = s.x + (mx / W - 0.5) * s.r * -8;
      const py = s.y + (my / H - 0.5) * s.r * -4;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,232,232,${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    // ── Layer 0 clouds (back, slowest)
    for (const c of clouds.filter(c => c.layer === 0)) {
      c.x -= c.speed * 0.6;
      if (c.x + c.w < 0) c.x = W + 50;
      const px = c.x + (mx / W - 0.5) * -12;
      const py = c.y + (my / H - 0.5) * -6;
      drawCloud(ctx, { ...c, x: px, y: py }, t);
    }

    // ── Aurora streaks
    for (const s of streaks) {
      s.life++;
      if (s.life > s.maxLife) {
        s.life = 0;
        s.x = Math.random() * W;
        s.y = H * 0.1 + Math.random() * H * 0.4;
        s.maxLife = 200 + Math.random() * 300;
        s.opacity = 0;
      }
      const half = s.maxLife / 2;
      s.opacity = s.life < half ? s.life / half : 1 - (s.life - half) / half;
      drawStreak(ctx, s);
    }

    // ── Layer 1 clouds (mid)
    for (const c of clouds.filter(c => c.layer === 1)) {
      c.x -= c.speed;
      if (c.x + c.w < 0) c.x = W + 80;
      const px = c.x + (mx / W - 0.5) * -20;
      const py = c.y + (my / H - 0.5) * -10;
      drawCloud(ctx, { ...c, x: px, y: py }, t);
    }

    // ── Data particles + knowledge lines
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }
    drawKnowledgeLines(ctx, particles);

    // ── Layer 2 clouds (front, fastest, darkest)
    for (const c of clouds.filter(c => c.layer === 2)) {
      c.x -= c.speed * 1.5;
      if (c.x + c.w < 0) c.x = W + 100;
      const px = c.x + (mx / W - 0.5) * -30;
      const py = c.y + (my / H - 0.5) * -14;
      drawCloud(ctx, { ...c, x: px, y: py }, t);
    }

    // ── Subtle horizontal light beam at center-bottom (horizon)
    const horizon = ctx.createLinearGradient(0, H * 0.65, 0, H * 0.8);
    horizon.addColorStop(0, 'transparent');
    horizon.addColorStop(0.4, 'rgba(200,202,202,0.02)');
    horizon.addColorStop(1, 'transparent');
    ctx.fillStyle = horizon;
    ctx.fillRect(0, H * 0.65, W, H * 0.15);

    rafRef.current = requestAnimationFrame(animate);
  }, [canvasRef, mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current = initCanvas(canvas);

    const onResize = () => {
      if (canvas) stateRef.current = initCanvas(canvas);
    };
    window.addEventListener('resize', onResize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [animate, canvasRef]);
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, delay: d, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);

  const rawMx = useMotionValue(0.5);
  const rawMy = useMotionValue(0.5);
  const mx = useSpring(rawMx, { stiffness: 40, damping: 20 });
  const my = useSpring(rawMy, { stiffness: 40, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current.getBoundingClientRect();
    rawMx.set((e.clientX - rect.left) / rect.width);
    rawMy.set((e.clientY - rect.top) / rect.height);
  }, [rawMx, rawMy]);

  useAtmosphereCanvas(canvasRef, mx, my);

  return (
    <main
      ref={containerRef}
      className="relative w-full"
      style={{ background: '#06080a' }}
      onMouseMove={handleMouseMove}
      aria-label="Meridian hero"
    >
      {/* ── Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* ── Vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Top nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 pt-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* Logo mark */}
          <span
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Meridian "M" SVG */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 13V3l6 7 6-7v10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em' }}>
            Meridian
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/discover" className="text-xs text-white/50 hover:text-white/80 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
            Discover
          </Link>
          <Link
            to="/discover"
            className="inline-flex h-7 items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-all hover:bg-white/15"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero Content — centered, pushed down, extra tall */}
      <div className="relative z-10 flex min-h-[120vh] flex-col items-center justify-center px-6 text-center" style={{ paddingTop: '140px', paddingBottom: '40px' }}>

        {/* Badge */}
        <motion.div
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(210,212,212,0.85)',
              letterSpacing: '0.13em',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'rgba(200,202,202,0.6)' }}
            />
            Built for Engineers
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          custom={0.45}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl leading-[1.04]"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(2rem, 4.8vw, 4.6rem)',
            fontWeight: 800,
            color: 'rgba(240,242,242,0.96)',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 40px rgba(0,0,0,0.8)',
          }}
        >
          Where Great Engineering
          <br />
          <span style={{ fontStyle: 'italic', color: 'rgba(200,202,202,0.85)' }}>Writing Gets Found</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={0.65}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-4 max-w-md leading-relaxed"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
            fontWeight: 400,
            color: 'rgba(160,162,162,0.85)',
            textShadow: '0 1px 20px rgba(0,0,0,0.6)',
          }}
        >
          Discover stack-matched articles, fork ideas, publish living posts,
          and earn from impact — not algorithms.
        </motion.p>

        {/* Supporting caption */}
        <motion.p
          custom={0.75}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-2 text-[12px]"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(120,122,122,0.7)',
            letterSpacing: '0.04em',
          }}
        >
          Great posts don't go unread here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={0.9}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row"
        >
          {/* Primary CTA */}
          <Link
            to="/editor/new"
            id="cta-start-writing"
            className="group inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(240,242,242,0.95)',
              color: '#0d0f10',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 4px 24px rgba(0,0,0,0.4)',
              letterSpacing: '0.01em',
            }}
            aria-label="Start writing on Meridian"
          >
            Start Writing
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary CTA */}
          <Link
            to="/discover"
            id="cta-explore-posts"
            className="inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(12px)',
              color: 'rgba(200,202,202,0.85)',
              letterSpacing: '0.01em',
            }}
            aria-label="Explore posts on Meridian"
          >
            <BookOpen size={14} />
            Explore Posts
          </Link>
        </motion.div>

        {/* Social proof / stats */}
        <motion.div
          custom={1.1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 flex items-center gap-8"
        >
          {[
            { value: '12k+', label: 'Engineers' },
            { value: '8k+', label: 'Posts' },
            { value: '$86k', label: 'Earned' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <span
                className="text-base font-semibold"
                style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(220,222,222,0.7)' }}
              >
                {s.value}
              </span>
              <span
                className="text-[11px] uppercase tracking-widest"
                style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(130,132,132,0.6)', letterSpacing: '0.1em' }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* ── Scroll-Driven Storytelling */}
      <ScrollStory />

      {/* ── Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t px-8 py-3"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(6,8,10,0.3)',
        }}
      >
        <p className="font-mono text-[10px]" style={{ color: 'rgba(100,102,102,0.6)', letterSpacing: '0.04em' }}>
          Meridian — Where Great Engineering Writing Gets Found
        </p>
        <p className="font-mono text-[10px]" style={{ color: 'rgba(100,102,102,0.6)', letterSpacing: '0.04em' }}>
          © {new Date().getFullYear()} Meridian
        </p>
      </motion.div>
    </main>
  );
}
