import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ── Monochrome canvas utilities ──────────────────────────────────────── */

const BLACK = 'transparent';
const SURFACE = '#EAECEC'; // Light text color for drawings on dark background
const MUTED = '#999B9B';
const VERIFIED = '#00C896';
const FLAGGED = '#FF6B6B';
const HIGHLIGHT = '#FFB900';

function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ── Feature drawing functions ────────────────────────────────────────── */

function drawDiscovery(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;
  const tags = ['React', 'Go', 'Python', 'K8s', 'Rust', 'TS', 'Docker', 'Postgres'];
  const n = tags.length;
  const radius = Math.min(w, h) * 0.32;
  const count = Math.min(n, Math.ceil(p * n));

  // central card
  const cw = 140, ch = 90;
  const cardGlow = Math.min(1, p * 1.8);
  ctx.shadowColor = `rgba(0, 200, 150, ${cardGlow * 0.2})`; // Teal glow
  ctx.shadowBlur = 20 * cardGlow;
  ctx.strokeStyle = `rgba(234, 236, 236, ${0.2 + p * 0.3})`;
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 10);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // card inner lines
  for (let i = 0; i < 4; i++) {
    const ly = cy - ch / 2 + 18 + i * 16;
    const lw = 60 + Math.sin(i * 1.5 + p * 3) * 10;
    ctx.fillStyle = `rgba(153,155,153,${0.15 + p * 0.1})`;
    ctx.fillRect(cx - lw / 2, ly, lw, 3);
  }

  // tags
  for (let i = 0; i < count; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.05 * Math.sin(p * 2 + i);
    const tx = cx + Math.cos(angle) * radius;
    const ty = cy + Math.sin(angle) * radius;
    const a = 0.3 + (i / count) * 0.5;

    // connector line
    ctx.strokeStyle = `rgba(0, 200, 150, ${a * 0.5})`; // Teal connector
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // tag pill
    ctx.font = '11px Inter, sans-serif';
    const tw = ctx.measureText(tags[i]).width + 18;
    ctx.fillStyle = `rgba(234, 236, 236, ${a * 0.08})`;
    roundRect(ctx, tx - tw / 2, ty - 11, tw, 22, 11);
    ctx.fill();
    ctx.strokeStyle = `rgba(234, 236, 236, ${a * 0.15})`;
    ctx.lineWidth = 0.5;
    roundRect(ctx, tx - tw / 2, ty - 11, tw, 22, 11);
    ctx.stroke();

    ctx.fillStyle = `rgba(234, 236, 236, ${0.35 + a * 0.4})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tags[i], tx, ty);
  }
}

function drawLivingPosts(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;

  // document outline
  const dw = 200, dh = 140;
  ctx.strokeStyle = `rgba(234, 236, 236, ${0.15 + p * 0.25})`;
  ctx.lineWidth = 1;
  roundRect(ctx, cx - dw / 2, cy - dh / 2, dw, dh, 6);
  ctx.stroke();

  // header bar
  ctx.fillStyle = `rgba(234, 236, 236, ${0.06 + p * 0.06})`;
  roundRect(ctx, cx - dw / 2 + 12, cy - dh / 2 + 12, dw - 24, 14, 3);
  ctx.fill();

  // text lines - some "changed" lines in lighter color
  const lines = 6;
  for (let i = 0; i < lines; i++) {
    const ly = cy - dh / 2 + 40 + i * 18;
    const lw = 60 + Math.sin(i * 2.1) * 25;
    const isChanged = i < Math.floor(p * lines);
    ctx.fillStyle = isChanged
      ? `rgba(0, 200, 150, ${0.4 + p * 0.3})` // Teal for changed lines
      : `rgba(153,155,153,${0.2})`;
    ctx.fillRect(cx - dw / 2 + 18, ly, lw + (isChanged ? 10 : 0), 3);
    if (isChanged) {
      ctx.fillStyle = `rgba(0, 200, 150, ${0.2})`;
      ctx.fillRect(cx - dw / 2 + 18 + lw + 14, ly, 12, 3);
    }
  }

  // version dots on timeline
  const versions = 4;
  for (let v = 0; v < versions; v++) {
    const vx = cx - dw / 2 + 20 + (v / (versions - 1)) * (dw - 40);
    const vy = cy + dh / 2 + 24;
    const vActive = p > v / (versions - 1) - 0.1;
    ctx.fillStyle = vActive ? SURFACE : MUTED;
    ctx.globalAlpha = vActive ? 0.6 : 0.15;
    ctx.beginPath();
    ctx.arc(vx, vy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = vActive ? `rgba(234, 236, 236, ${0.6})` : `rgba(153,155,153,${0.3})`;
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`v${v + 1}`, vx, vy + 6);
  }

  // connector line
  ctx.strokeStyle = `rgba(153,155,153,${0.1 + p * 0.15})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - dw / 2 + 20, cy + dh / 2 + 24);
  ctx.lineTo(cx + dw / 2 - 20, cy + dh / 2 + 24);
  ctx.stroke();
}

function drawForkable(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2;

  // tree levels — max 4 levels
  const levels = 1 + Math.floor(p * 3.5);
  const startY = h * 0.2;
  const endY = h * 0.8;
  const yStep = (endY - startY) / 4;

  function drawBranch(x: number, y: number, level: number, spread: number) {
    if (level >= levels) return;

    const ny = y + yStep;
    const lx = x - spread;
    const rx = x + spread;

    ctx.strokeStyle = `rgba(234, 236, 236, ${0.1 + (level / 4) * 0.2})`;
    ctx.lineWidth = 1.2 - level * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(lx, ny);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(rx, ny);
    ctx.stroke();

    // node dots
    ctx.fillStyle = SURFACE;
    ctx.globalAlpha = 0.1 + (level / 4) * 0.18;
    ctx.beginPath();
    ctx.arc(x, y, 2.5 - level * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawBranch(lx, ny, level + 1, spread * 0.65);
    drawBranch(rx, ny, level + 1, spread * 0.65);
  }

  ctx.fillStyle = SURFACE;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(cx, startY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawBranch(cx, startY, 1, Math.min(w, h) * 0.15);
}

function drawRewards(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;

  // central metric
  const value = Math.floor(p * 8620);
  ctx.fillStyle = SURFACE;
  ctx.globalAlpha = 0.2 + p * 0.5;
  ctx.font = `600 ${42 + p * 18}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`$${value.toLocaleString()}`, cx, cy - 6);
  ctx.globalAlpha = 1;

  ctx.fillStyle = MUTED;
  ctx.globalAlpha = 0.2 + p * 0.2;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('earned by authors', cx, cy + 28);
  ctx.globalAlpha = 1;

  // floating particles (coins)
  const particles = 30;
  for (let i = 0; i < particles; i++) {
    const pi = i / particles;
    const px = cx + Math.sin(pi * 13 + p * 5) * Math.min(w, h) * 0.38;
    const py = cy - 60 + (pi * 120) - p * 80 + Math.sin(pi * 7 + p * 3) * 20;
    const visible = pi <= p * 1.2;
    if (!visible) continue;

    const radius = 1.5 + Math.sin(pi * 11) * 1;
    ctx.fillStyle = `rgba(153,155,153,${0.1 + (1 - pi) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py + 30, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ring pulse
  const ringR = 60 + p * 30;
  ctx.strokeStyle = `rgba(255, 185, 0, ${0.2 + (1 - p) * 0.3})`; // Amber pulse
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPeerDiscovery(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;

  // avatar positions in a loose network
  const nodes = [
    { x: cx, y: cy - 80 },
    { x: cx - 120, y: cy + 20 },
    { x: cx + 110, y: cy + 30 },
    { x: cx - 60, y: cy + 90 },
    { x: cx + 70, y: cy + 85 },
    { x: cx, y: cy - 10 },
  ];

  const active = Math.min(nodes.length, Math.ceil(p * nodes.length));
  const visible = nodes.slice(0, Math.max(active, 2));

  // connections
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i], b = visible[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 220) continue;
      const alpha = (1 - dist / 220) * 0.15 * (p * 0.8);
      ctx.strokeStyle = `rgba(153,155,153,${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // highlight path
  if (p > 0.5) {
    const hp = (p - 0.5) * 2;
    ctx.strokeStyle = `rgba(0, 200, 150, ${hp * 0.4})`; // Teal highlight
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[3].x, nodes[3].y);
    ctx.lineTo(nodes[4].x, nodes[4].y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // avatar circles
  for (const node of visible) {
    const pulse = 1 + Math.sin(p * 6 + node.x * 0.1) * 0.08;
    const r = 18 * pulse;
    ctx.fillStyle = `rgba(234, 236, 236, ${0.04})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(234, 236, 236, ${0.12})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.stroke();

    // initial dot
    ctx.fillStyle = `rgba(234, 236, 236, ${0.25})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawConstellation(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.15;

  // "M" shape points
  const mPoints = [
    { x: cx - s * 1.2, y: cy + s * 0.8 },
    { x: cx - s * 0.9, y: cy - s * 0.9 },
    { x: cx, y: cy - s * 0.1 },
    { x: cx + s * 0.9, y: cy - s * 0.9 },
    { x: cx + s * 1.2, y: cy + s * 0.8 },
  ];

  const starCount = 80;
  const visible = Math.ceil(starCount * p);

  // stars
  for (let i = 0; i < visible; i++) {
    const t = i / starCount;
    const angle = t * Math.PI * 2 + p * 0.5;
    const r = 8 + Math.random() * 3; // deterministic
    const starR = 0.5 + Math.random() * 1.2;
    const sx = cx + Math.cos(angle * 3.7 + i * 0.5) * Math.min(w, h) * 0.4;
    const sy = cy + Math.sin(angle * 2.3 + i * 0.7) * Math.min(w, h) * 0.35;
    const alpha = 0.1 + Math.sin(p * 4 + i * 0.3) * 0.15 + 0.3;
    ctx.fillStyle = `rgba(234, 236, 236, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, starR, 0, Math.PI * 2);
    ctx.fill();
  }

  // M-shape constellation lines
  const lineProgress = Math.min(1, p * 1.5);
  ctx.strokeStyle = `rgba(234, 236, 236, ${0.08 + lineProgress * 0.15})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(mPoints[0].x, mPoints[0].y);
  for (let i = 1; i < mPoints.length; i++) {
    ctx.lineTo(mPoints[i].x, mPoints[i].y);
  }
  ctx.stroke();

  // M-shape nodes
  for (let i = 0; i < mPoints.length; i++) {
    const mp = mPoints[i];
    const glow = 1 + Math.sin(p * 3 + i * 1.2) * 0.15;
    ctx.fillStyle = SURFACE;
    ctx.globalAlpha = 0.05 + lineProgress * 0.2;
    ctx.beginPath();
    ctx.arc(mp.x, mp.y, 4 * glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = SURFACE;
    ctx.globalAlpha = 0.15 + lineProgress * 0.3;
    ctx.beginPath();
    ctx.arc(mp.x, mp.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* ── Feature data ─────────────────────────────────────────────────────── */

const features: FeatureDef[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Stack-Matched Discovery',
    description: 'Articles surface based on your tech stack, not popularity contests.',
    detail: 'Tag your stack once. Our matching engine surfaces the most relevant engineering writing — no algorithm gaming, no noise.',
    draw: drawDiscovery,
  },
  {
    id: 'living-posts',
    number: '02',
    title: 'Living Posts',
    description: 'Every post has a full revision history, like a living document.',
    detail: 'Readers see what changed, when, and why. Authors iterate in the open. Knowledge evolves, not stagnates.',
    draw: drawLivingPosts,
  },
  {
    id: 'forkable',
    number: '03',
    title: 'Forkable Articles',
    description: 'Fork any post, adapt it, and publish your own version — just like code.',
    detail: 'Build on others\' work with full attribution. The fork tree makes the lineage of every idea traceable.',
    draw: drawForkable,
  },
  {
    id: 'rewards',
    number: '04',
    title: 'Impact-Based Rewards',
    description: 'Earn based on the value you create, not page views.',
    detail: 'Forks, citations, and peer endorsements drive rewards. Quality compounds — noise doesn\'t.',
    draw: drawRewards,
  },
  {
    id: 'peer-discovery',
    number: '05',
    title: 'Peer-Driven Discovery',
    description: 'Trust recommendations from engineers who share your stack.',
    detail: 'Follow authors whose judgment you trust. Your network curates a signal feed that cuts through the noise.',
    draw: drawPeerDiscovery,
  },
];

interface FeatureDef {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, p: number) => void;
}

/* ── Single Feature Section ───────────────────────────────────────────── */

function FeatureSection({ feature, index }: { feature: FeatureDef; index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const canvasWrapperRef = useRef<HTMLDivElement>(null!);
  const contentRef = useRef<HTMLDivElement>(null!);
  const frameRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const canvasWrapper = canvasWrapperRef.current;
    if (!section || !canvas || !canvasWrapper) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx2d.scale(dpr, dpr);
    };
    resize();

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: contentRef.current,
      pinSpacing: true,
      onUpdate: (self) => {
        frameRef.current++;
        const progress = self.progress;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;

        // Scale wrapper via CSS so canvas visually enlarges without clipping
        const scale = 1 + progress * 0.5;
        canvasWrapper.style.transform = `scale(${scale})`;

        ctx2d.save();
        ctx2d.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);

        const speed = Math.min(1, progress * 0.8);
        feature.draw(ctx2d, w, h, speed);
        ctx2d.restore();
      },
      onRefresh: resize,
    });

    const handleResize = () => {
      resize();
      st.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      st.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [feature]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '120vh', background: 'transparent' }}
    >
      <div
        ref={contentRef}
        className="sticky top-0 flex h-screen w-full flex-col-reverse items-center justify-center gap-8 px-6 md:flex-row md:px-16 lg:px-24"
      >
        {/* Canvas */}
        <div
          ref={canvasWrapperRef}
          className="flex w-full items-center justify-center md:w-1/2"
          style={{ height: 'clamp(280px, 45vh, 500px)', willChange: 'transform' }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full rounded-xl"
            style={{ maxWidth: '560px' }}
            aria-hidden="true"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 md:max-w-lg">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono text-xs tracking-widest"
            style={{ color: MUTED }}
          >
            {feature.number}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: SURFACE, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}
          >
            {feature.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-base leading-relaxed"
            style={{ color: SURFACE, opacity: 0.7, fontFamily: 'Inter, sans-serif' }}
          >
            {feature.description}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-sm leading-relaxed"
            style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
          >
            {feature.detail}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ── Final Constellation Section ──────────────────────────────────────── */

function FinalConstellation() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.save();
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        const speed = Math.min(1, self.progress * 2);
        drawConstellation(ctx, w, h, speed);
        ctx.restore();
      },
      onRefresh: resize,
    });

    const handleResize = () => {
      resize();
      st.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      st.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: 'transparent' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-xs tracking-widest"
          style={{ color: MUTED }}
        >
          THE CONSTELLATION
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
          style={{ color: SURFACE, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}
        >
          Every idea is a star.<br />
          <span style={{ color: MUTED }}>Together, they form a constellation.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="max-w-md text-sm leading-relaxed"
          style={{ color: MUTED, fontFamily: 'Inter, sans-serif' }}
        >
          Join the network where engineering knowledge compounds.
          Write. Fork. Earn. Build the signal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/editor/new"
            className="group inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: VERIFIED,
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,200,150,0.3)',
            }}
          >
            Start Writing
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/feed"
            className="inline-flex h-10 items-center gap-2 rounded-full px-6 text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: 'transparent',
              border: '1px solid var(--color-muted)',
              color: 'var(--color-surface)',
            }}
          >
            <Sparkles size={14} />
            Explore Posts
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Main Export ──────────────────────────────────────────────────────── */

export function ScrollStory() {
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      {/* 5 feature storytelling sections */}
      {features.map((feature, idx) => (
        <FeatureSection key={feature.id} feature={feature} index={idx} />
      ))}

      {/* Final constellation section */}
      <FinalConstellation />
    </>
  );
}
