import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

gsap.registerPlugin(ScrollTrigger);

/* â”€â”€ Monochrome canvas utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const BLACK = 'transparent';
const SURFACE = '#EAECEC'; // Light text color for drawings on dark background
const MUTED = '#999B9B';
const VERIFIED = '#2DD4A3';
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

/* â”€â”€ Feature drawing functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function drawDiscovery(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;
  const tags = ['React', 'Go', 'Python', 'K8s', 'Rust', 'TS', 'Docker', 'Postgres'];
  const n = tags.length;
  const radius = Math.min(w, h) * 0.28;
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

  // tree levels â€” max 4 levels
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

const RANK_TIERS = ['NEWCOMER', 'CONTRIBUTOR', 'ENGINEER', 'SENIOR', 'ARCHITECT', 'FELLOW'];

function drawRankingRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  rowH: number,
  pos: number,
  name: string,
  pts: number,
  k: number,
  isYou: boolean,
  raw: number,
) {
  const rh = rowH * (isYou ? 1.1 : 0.94);
  const cy = y + rowH / 2;

  if (isYou) {
    // solid tile so it cleanly covers a peer the instant it overtakes it
    ctx.fillStyle = '#182624';
    roundRect(ctx, x, cy - rh / 2, w, rh, 8 * k);
    ctx.fill();
    ctx.strokeStyle = `rgba(0, 200, 150, ${0.35 + raw * 0.45})`;
    ctx.lineWidth = 1.25;
    roundRect(ctx, x, cy - rh / 2, w, rh, 8 * k);
    ctx.stroke();
  }

  // rank badge
  const badgeX = x + 10 * k;
  const badgeW = 22 * k;
  ctx.fillStyle = isYou ? 'rgba(45,212,163,0.95)' : 'rgba(153,155,153,0.16)';
  roundRect(ctx, badgeX, cy - 9 * k, badgeW, 18 * k, 5 * k);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(9.5 * k)}px Inter, sans-serif`;
  ctx.fillStyle = isYou ? '#000' : 'rgba(234,236,236,0.65)';
  ctx.fillText(`#${pos}`, badgeX + badgeW / 2, cy + 0.5 * k);

  // name
  ctx.textAlign = 'left';
  ctx.font = `600 ${Math.round(10.5 * k)}px Inter, sans-serif`;
  ctx.fillStyle = isYou ? VERIFIED : 'rgba(234,236,236,0.85)';
  ctx.fillText(name, badgeX + badgeW + 10 * k, cy);

  // points
  ctx.textAlign = 'right';
  ctx.font = `700 ${Math.round(9.5 * k)}px 'SF Mono', 'Fira Code', monospace`;
  ctx.fillStyle = isYou ? VERIFIED : 'rgba(153,155,153,0.75)';
  ctx.fillText(pts.toLocaleString(), x + w - 12 * k, cy);

  // small "you" tag
  if (isYou) {
    ctx.font = `700 ${Math.round(7.5 * k)}px 'SF Mono', 'Fira Code', monospace`;
    ctx.fillStyle = 'rgba(45,212,163,0.85)';
    ctx.fillText('YOU', badgeX + badgeW + 10 * k + ctx.measureText(name).width + 10 * k, cy);
  }
}

function drawRanking(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;
  const k = Math.max(0.62, Math.min(1, Math.min(w, h) / 420));
  const cardW = 400 * k;
  const cardH = 300 * k;
  const cardX = cx - cardW / 2;
  const cardY = cy - cardH / 2;
  const padX = 20 * k;

  // overall progress across the six tiers (eased, completes before scroll end)
  const raw = Math.min(1, Math.max(0, p * 1.12));
  const tierIdx = Math.min(5, Math.floor(raw * 6));
  const tierFrac = Math.min(1, raw * 6 - tierIdx);
  const current = RANK_TIERS[tierIdx];
  const next = RANK_TIERS[tierIdx + 1];
  const rank = Math.max(1, Math.round(4280 * (1 - raw) + 128 * raw));
  const youPts = Math.round(8177 + raw * 4663);

  // floating point chips â€” points earned from peer impact, drifting upward
  const chips = ['+15', '+10', '+8'];
  for (let i = 0; i < chips.length; i++) {
    const chx = cardX + ((i + 1) / (chips.length + 1)) * cardW;
    const chy = cardY - 12 * k - (raw * 22 * k) - (i % 2) * 12 * k;
    ctx.font = `700 ${Math.round(8.5 * k)}px 'SF Mono', 'Fira Code', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(0, 200, 150, ${0.2 + (1 - i / chips.length) * 0.35})`;
    ctx.fillText(chips[i], chx + Math.sin(raw * 5 + i * 2) * 6 * k, chy);
  }

  // card background + soft glow
  ctx.shadowColor = 'rgba(0, 200, 150, 0.14)';
  ctx.shadowBlur = 44 * k;
  ctx.fillStyle = 'rgba(21, 21, 21, 0.92)';
  roundRect(ctx, cardX, cardY, cardW, cardH, 14 * k);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(234, 236, 236, 0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, cardX, cardY, cardW, cardH, 14 * k);
  ctx.stroke();

  // tier header row
  let y = cardY + 16 * k;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(9 * k)}px 'SF Mono', 'Fira Code', monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText('RANK TIER', cardX + padX, y);
  ctx.textAlign = 'right';
  ctx.font = `700 ${Math.round(12 * k)}px Inter, sans-serif`;
  ctx.fillStyle = VERIFIED;
  ctx.fillText(current, cardX + cardW - padX, y);

  // big rank number
  y += 30 * k;
  ctx.textAlign = 'center';
  ctx.font = `700 ${Math.round(40 * k)}px Inter, sans-serif`;
  ctx.fillStyle = SURFACE;
  ctx.fillText(`#${rank.toLocaleString()}`, cx, y);
  y += 22 * k;
  ctx.font = `500 ${Math.round(10 * k)}px 'SF Mono', 'Fira Code', monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText('GLOBAL RANK', cx, y);

  // tier progress track
  y += 26 * k;
  const trackW = cardW - padX * 2;
  const trackH = 6 * k;
  ctx.fillStyle = 'rgba(153,155,153,0.14)';
  roundRect(ctx, cardX + padX, y - trackH / 2, trackW, trackH, trackH / 2);
  ctx.fill();
  ctx.fillStyle = VERIFIED;
  roundRect(ctx, cardX + padX, y - trackH / 2, Math.max(trackH, trackW * tierFrac), trackH, trackH / 2);
  ctx.fill();

  // next tier + progress %
  y += 16 * k;
  ctx.textAlign = 'left';
  ctx.font = `${Math.round(8.5 * k)}px 'SF Mono', 'Fira Code', monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText(next ? `next: ${next}` : 'top rank', cardX + padX, y);
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(tierFrac * 100)}%`, cardX + cardW - padX, y);

  // divider
  y += 18 * k;
  ctx.strokeStyle = 'rgba(234, 236, 236, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + padX, y);
  ctx.lineTo(cardX + cardW - padX, y);
  ctx.stroke();

  // leaderboard â€” "you" climbs one slot at a time; each overtake swaps the peer
  // down instantly, so all rows always occupy distinct slots (no overlap ever)
  const rowH = 30 * k;
  const rowY0 = y + 12 * k;
  const swaps = Math.min(3, Math.floor(raw * 3)); // number of peers already passed
  const youSlot = 3 - swaps;
  const peers = [
    { name: 'K. Novak', pts: 12840 },
    { name: 'M. Reyes', pts: 11205 },
    { name: 'L. Ortiz', pts: 9830 },
  ];

  const entities = [
    ...peers.map((r, i) => ({
      name: r.name,
      pts: r.pts,
      slot: i + (swaps >= 3 - i ? 1 : 0),
      isYou: false,
    })),
    { name: 'You', pts: youPts, slot: youSlot, isYou: true },
  ];

  entities
    .sort((a, b) => a.slot - b.slot)
    .forEach((e, i) => {
      drawRankingRow(ctx, cardX + padX, rowY0 + e.slot * rowH, cardW - padX * 2, rowH, i + 1, e.name, e.pts, k, e.isYou, raw);
    });
}

function drawPeerDiscovery(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  clear(ctx, w, h);
  const cx = w / 2, cy = h / 2;

  // avatar positions in a loose network (slightly tight so the 1.25x scale fits narrow canvases)
  const nodes = [
    { x: cx, y: cy - 70 },
    { x: cx - 104, y: cy + 17 },
    { x: cx + 96, y: cy + 26 },
    { x: cx - 52, y: cy + 78 },
    { x: cx + 61, y: cy + 74 },
    { x: cx, y: cy - 9 },
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

function drawConstellation(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t = 0) {
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

  const starCount = 180;

  // stars â€” fade in on scroll, then shimmer and drift continuously
  for (let i = 0; i < starCount; i++) {
    const hx = Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453123) % 1;
    const hy = Math.abs(Math.sin(i * 269.5 + 183.3) * 43758.5453123) % 1;
    const hSize = Math.abs(Math.sin(i * 419.2 + 57.1) * 43758.5453123) % 1;
    const hDelay = Math.abs(Math.sin(i * 631.8 + 91.3) * 43758.5453123) % 1;
    const hGlow = Math.abs(Math.sin(i * 823.7 + 136.9) * 43758.5453123) % 1;

    const driftX = Math.sin(t * 0.00025 + i * 1.3) * 1.1;
    const driftY = Math.cos(t * 0.0003 + i * 2.1) * 0.9;
    const sx = cx + (hx - 0.5) * w * 0.88 + driftX;
    const sy = cy + (hy - 0.5) * h * 0.84 + driftY;
    const starR = 0.4 + hSize * 1.6;

    // per-star shimmer that eases in once the star has appeared
    const shimmer = 0.7 + 0.3 * Math.sin(t * 0.0016 * (1.1 + hSize * 2.2) + i * 1.7);
    const starAlpha = Math.min(1, Math.max(0, (p - hDelay * 0.85) * 1.8)) * shimmer;
    if (starAlpha <= 0) continue;

    // glow
    if (hGlow > 0.7) {
      ctx.beginPath();
      ctx.arc(sx, sy, starR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(234, 236, 236, ${starAlpha * 0.07})`;
      ctx.fill();
    }

    ctx.fillStyle = `rgba(234, 236, 236, ${starAlpha * 0.55})`;
    ctx.beginPath();
    ctx.arc(sx, sy, starR, 0, Math.PI * 2);
    ctx.fill();
  }

  // M-shape constellation lines
  const lineProgress = Math.min(1, p * 1.5);
  ctx.strokeStyle = `rgba(234, 236, 236, ${0.06 + lineProgress * 0.11})`;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(mPoints[0].x, mPoints[0].y);
  for (let i = 1; i < mPoints.length; i++) {
    ctx.lineTo(mPoints[i].x, mPoints[i].y);
  }
  ctx.stroke();

  // M-shape nodes â€” gently breathing with time
  for (let i = 0; i < mPoints.length; i++) {
    const mp = mPoints[i];
    const glow = 1 + Math.sin(t * 0.0012 + i * 1.2) * 0.16;
    ctx.fillStyle = SURFACE;
    ctx.globalAlpha = 0.04 + lineProgress * 0.15;
    ctx.beginPath();
    ctx.arc(mp.x, mp.y, 3.5 * glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = SURFACE;
    ctx.globalAlpha = 0.1 + lineProgress * 0.22;
    ctx.beginPath();
    ctx.arc(mp.x, mp.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/* â”€â”€ Feature data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const features: FeatureDef[] = [
  {
    id: 'discovery',
    number: '01',
    title: 'Stack-Matched Discovery',
    description: 'Articles surface based on your tech stack, not popularity contests.',
    detail: 'Tag your stack once. Our matching engine surfaces the most relevant engineering writing â€” no algorithm gaming, no noise.',
    draw: drawDiscovery,
    scale: 1.25,
  },
  {
    id: 'living-posts',
    number: '02',
    title: 'Living Posts',
    description: 'Every post has a full revision history, like a living document.',
    detail: 'Readers see what changed, when, and why. Authors iterate in the open. Knowledge evolves, not stagnates.',
    draw: drawLivingPosts,
    scale: 1.25,
  },
  {
    id: 'forkable',
    number: '03',
    title: 'Forkable Articles',
    description: 'Fork any post, adapt it, and publish your own version â€” just like code.',
    detail: 'Build on others\' work with full attribution. The fork tree makes the lineage of every idea traceable.',
    draw: drawForkable,
    scale: 1.25,
  },
  {
    id: 'ranking',
    number: '04',
    title: 'Impact-Based Global Ranking',
    description: 'Your rank reflects your real-world impact, not your follower count.',
    detail: 'Forks, reposts, and real-world usage earn reputation points â€” weighted by the contributor\'s own standing. Game the leaderboard by writing better, not louder.',
    draw: drawRanking,
  },
  {
    id: 'peer-discovery',
    number: '05',
    title: 'Peer-Driven Discovery',
    description: 'Trust recommendations from engineers who share your stack.',
    detail: 'Follow authors whose judgment you trust. Your network curates a signal feed that cuts through the noise.',
    draw: drawPeerDiscovery,
    scale: 1.25,
  },
];

interface FeatureDef {
  id: string;
  number: string;
  title: string;
  description: string;
  detail: string;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, p: number) => void;
  scale?: number;
}

/* â”€â”€ Single Feature Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

        // ease-in-out cubic for smooth gliding feel
        const speed = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

        ctx2d.save();
        ctx2d.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);

        // icons start small and grow as you scroll (crisp canvas-scale, centered)
        const extra = feature.scale ?? 1;
        const growth = 0.6 + (extra - 0.6) * speed;
        if (growth !== 1) {
          ctx2d.translate(w / 2, h / 2);
          ctx2d.scale(growth, growth);
          ctx2d.translate(-w / 2, -h / 2);
        }

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
      style={{ height: '220vh', background: 'transparent' }}
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
            transition={{ duration: 0.4, delay: 0 }}
            className="font-mono text-xs tracking-widest"
            style={{ color: MUTED }}
          >
            {feature.number}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: SURFACE, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}
          >
            {feature.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-base leading-relaxed"
            style={{ color: SURFACE, opacity: 0.7, fontFamily: 'Inter, sans-serif' }}
          >
            {feature.description}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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

/* â”€â”€ Final Constellation Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function FinalConstellation() {
  const sectionRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const isAuthenticated = useUiStore((s) => s.isAuthenticated);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let active = false;
    let progress = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const tick = (t: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.save();
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      drawConstellation(ctx, w, h, progress, t);
      ctx.restore();
      if (active) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (active) return;
      active = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      active = false;
      cancelAnimationFrame(raf);
    };

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: start,
      onEnterBack: start,
      onLeave: stop,
      onLeaveBack: stop,
      onUpdate: (self) => {
        progress = Math.min(1, self.progress * 1.6);
      },
      onRefresh: resize,
    });

    const handleResize = () => {
      resize();
      st.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      stop();
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
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-6 text-center"
        >
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
            Write. Fork. Rank. Build the signal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              to={isAuthenticated ? '/editor/new' : '/auth'}
              className="group inline-flex h-10 items-center gap-2 rounded-md px-6 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                fontFamily: 'Inter, sans-serif',
                background: VERIFIED,
                color: '#0a0a0a',
                boxShadow: '0 4px 14px rgba(45,212,163,0.3)',
              }}
            >
              Start Writing
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to={isAuthenticated ? '/feed' : '/auth'}
              className="inline-flex h-10 items-center gap-2 rounded-md px-6 text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.98]"
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
        </motion.div>
      </div>
    </section>
  );
}

/* â”€â”€ Main Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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



