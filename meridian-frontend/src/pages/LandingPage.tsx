import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ScrollStory } from '../components/ScrollStory';

/* ─────────────────────────────────────────────────────────────────────────
   HERO — Terminal / Code-Editor Preview
───────────────────────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.85, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function TerminalPreview() {
  const lines = [
    { type: 'frontmatter', content: '---' },
    { type: 'key', content: 'title: ', value: '"Refactoring a Rust event loop"' },
    { type: 'key', content: 'stack: ', value: '[Rust, Async, io_uring]' },
    { type: 'status', content: 'status: ', value: '"living"' },
    { content: '---' },
    {},
    { type: 'heading', content: '## The Problem' },
    { content: 'Traditional epoll-based loops struggle under' },
    { content: 'high concurrency. Enter io_uring.' },
    {},
    { type: 'heading', content: '## Benchmark Results' },
    { type: 'code', content: 'Before: 2_340 req/s  ·  After: 4_120 req/s' },
    { type: 'diff', content: '+76% throughput  ·  -42% p99 latency' },
    {},
    { type: 'heading', content: '## Key Insight' },
    { content: 'Submission-queue polling eliminates syscall' },
    { content: 'overhead entirely.' },
    { type: 'cursor', content: '_' },
  ];

  return (
    <div
      className="w-full overflow-hidden rounded-lg border"
      style={{
        background: '#0a0c10',
        borderColor: '#2f3336',
        boxShadow: '0 0 0 1px rgba(0,200,150,0.08), 0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: '#2f3336', background: '#0d0f14' }}>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="ml-3 text-[11px] tracking-wide" style={{ fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace", color: '#71767b' }}>
          living-post.md — Meridian
        </span>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-5 text-[13px] leading-6" style={{ fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace" }}>
        {lines.map((line, i) => {
          if (!line.content && !line.type) return <div key={i} className="h-4" />;
          if (line.type === 'cursor') {
            return (
              <span key={i} className="inline-block animate-pulse font-bold" style={{ color: '#00C896' }}>
                _
              </span>
            );
          }
          if (line.type === 'status') {
            return (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span style={{ color: '#6a9955' }}>{line.content}</span>
                <span className="inline-flex items-center gap-1.5" style={{ color: '#00C896' }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#00C896' }} />
                  "living"
                </span>
              </div>
            );
          }
          return (
            <div key={i} className="whitespace-nowrap">
              {line.type === 'frontmatter' ? (
                <span style={{ color: '#6a9955' }}>{'---'}</span>
              ) : line.type === 'key' ? (
                <>
                  <span style={{ color: '#6a9955' }}>{line.content}</span>
                  <span style={{ color: '#e3e6e8' }}>{line.value}</span>
                </>
              ) : line.type === 'heading' ? (
                <span style={{ color: '#569cd6' }}>{line.content}</span>
              ) : line.type === 'code' ? (
                <span style={{ color: '#d4d4d4' }}>{'  '}{line.content}</span>
              ) : line.type === 'diff' ? (
                <span style={{ color: '#00C896' }}>{'  '}{line.content}</span>
              ) : (
                <span style={{ color: '#c9d1d9' }}>{line.content}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 border-t px-4 py-1.5 text-[10px]" style={{ fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace", borderColor: '#2f3336', background: '#0d0f14', color: '#536471' }}>
        <span>Ln 14, Col 3</span>
        <span>UTF-8</span>
        <span>Markdown</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: '#00C896' }} />
          Live Preview
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative w-full" style={{ background: '#0d0f14' }} aria-label="Meridian hero">
      {/* Dot-grid background — covers full page */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,200,150,0.20) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Faint grid lines overlay — covers full page */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,150,0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,150,0.10) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* ── Hero Section — dot-grid background + 2-column layout */}
      <section className="relative w-full overflow-hidden">
        {/* Top nav */}
        <nav className="relative z-20 flex items-center justify-between px-8 pt-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <path d="M2 13V3l6 7 6-7v10" stroke="var(--color-surface)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-base font-semibold transition-colors" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em', color: 'var(--color-surface)' }}>
              Meridian
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/discover" className="text-sm transition-colors hover:text-white" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-muted)' }}>
              Discover
            </Link>
            <Link
              to="/discover"
              className="inline-flex h-8 items-center gap-1 rounded-full px-4 text-sm font-medium transition-all hover:bg-black/10"
              style={{
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
                border: '1px solid var(--color-muted)',
                color: 'var(--color-surface)',
              }}
            >
              Sign in
            </Link>
          </div>
        </nav>

        {/* Hero Content — 2-column grid */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col gap-12 px-8 pt-14 md:flex-row md:items-stretch">
          {/* Left column: Typography + CTAs */}
          <div className="flex w-full flex-col justify-center gap-6 md:w-1/2 md:pr-4">
            <motion.div custom={0.2} variants={fadeUp} initial="hidden" animate="visible" className="-mt-8">
              <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.3)', color: 'var(--color-verified)', letterSpacing: '0.13em' }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-verified)' }} />
                Built for Engineers
              </span>
            </motion.div>

            <motion.h1 custom={0.45} variants={fadeUp} initial="hidden" animate="visible" className="leading-[1.06]" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(2rem, 4vw, 4.2rem)', fontWeight: 800, color: 'var(--color-surface)', letterSpacing: '-0.02em' }}>
              Where Great Engineering<br />
              <span style={{ fontStyle: 'italic', color: 'var(--color-muted)' }}>Writing Gets Found</span>
            </motion.h1>

            <motion.p custom={0.65} variants={fadeUp} initial="hidden" animate="visible" className="max-w-lg" style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)', fontWeight: 400, lineHeight: 1.6, color: 'var(--color-surface)', opacity: 0.75 }}>
              Discover stack-matched articles, fork ideas, publish living posts, and earn from impact — not algorithms.
            </motion.p>

            <motion.div custom={0.9} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-start gap-4 sm:flex-row">
              <Link to="/editor/new" id="cta-start-writing" className="group inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]" style={{ fontFamily: 'Inter, sans-serif', background: 'var(--color-verified)', color: '#000', letterSpacing: '0.01em' }} aria-label="Start writing on Meridian">
                Start Writing <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/feed" id="cta-explore-posts" className="inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-all hover:bg-white/5 active:scale-[0.98]" style={{ fontFamily: 'Inter, sans-serif', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-surface)', letterSpacing: '0.01em' }} aria-label="Explore posts on Meridian">
                <BookOpen size={15} /> Explore Posts
              </Link>
            </motion.div>

            <div className="w-3/4" style={{ width:'600px',borderTop: '2px solid rgba(255, 255, 255, 0.12)' }} />
            <motion.div custom={1.1} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-10" style={{ marginTop: '20px' }}>
              {[
                { value: '12k+', label: 'ENGINEERS' },
                { value: '8k+', label: 'POSTS' },
                { value: '$86k', label: 'EARNED' },
              ].map(s => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#fff' }}>{s.value}</span>
                  <span className="text-[9px] tracking-[0.15em]" style={{ fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace", color: 'var(--color-muted)' }}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column: Terminal preview */}
          <motion.div
            custom={0.6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex w-full items-center md:w-1/2 md:pl-4"
          >
            <TerminalPreview />
          </motion.div>
        </div>
      </section>

      {/* ── Scroll-Driven Storytelling — transparent bg shows space background */}
      <div className="relative z-10">
        <ScrollStory />
      </div>

      {/* ── Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t px-8 py-3"
        style={{
          borderTop: '1px solid rgba(234,236,236,0.1)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="font-mono text-[10px]" style={{ color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
          Meridian — Where Great Engineering Writing Gets Found
        </p>
        <p className="font-mono text-[10px]" style={{ color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
          © {new Date().getFullYear()} Meridian
        </p>
      </motion.div>
    </main>
  );
}
