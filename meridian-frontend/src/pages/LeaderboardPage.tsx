import { useState } from 'react';
import { ArrowUp, GitFork, Repeat2, Briefcase, GitPullRequest, GraduationCap, Crown, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

const colors = {
  primary:  '#e7e9ea',
  secondary:'#71767b',
  muted:    '#536471',
  border:   '#2f3336',
  card:     '#151515',
  cardAlt:  '#1a1d24',
  verified: '#2DD4A3',
  bg:       '#0a0a0a',
};

// ─── Rank tier definitions ────────────────────────────────────────────────────

const TIERS = [
  { name: 'Newcomer',    min: 0,    max: 99,   color: '#536471', bg: 'rgba(83,100,113,0.12)',  icon: '🌱' },
  { name: 'Contributor', min: 100,  max: 499,  color: '#71767b', bg: 'rgba(113,118,123,0.12)', icon: '⚡' },
  { name: 'Engineer',    min: 500,  max: 1499, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: '⚙️' },
  { name: 'Senior',      min: 1500, max: 3999, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '🔷' },
  { name: 'Architect',   min: 4000, max: 9999, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🏛️' },
  { name: 'Fellow',      min: 10000,max: Infinity, color: '#2DD4A3', bg: 'rgba(45,212,163,0.14)', icon: '🏆' },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

// ─── Point actions ────────────────────────────────────────────────────────────

const POINT_ACTIONS = [
  { icon: GitFork,        label: 'Someone forks your post',                points: '+10', weight: 'standard' },
  { icon: Repeat2,        label: 'Someone reposts your post',              points: '+5',  weight: 'standard' },
  { icon: Briefcase,      label: '"Used at work" reaction on your post',   points: '+15', weight: 'high'     },
  { icon: GitPullRequest, label: 'Your patch gets accepted on another\'s post', points: '+8', weight: 'standard' },
  { icon: GraduationCap,  label: 'Your mentee publishes successfully',     points: '+12', weight: 'high'     },
];

// ─── Fake leaderboard data ────────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1,  prev: 1,  name: 'Priya Kapoor',     handle: '@priya.kapoor',   points: 24870, tier: 'Fellow',    avatar: 'https://i.pravatar.cc/150?img=47', stack: ['Rust', 'eBPF'],           change: 0  },
  { rank: 2,  prev: 3,  name: 'Marcus Webb',       handle: '@m.webb',         points: 19340, tier: 'Fellow',    avatar: 'https://i.pravatar.cc/150?img=12', stack: ['Go', 'Kubernetes'],       change: 1  },
  { rank: 3,  prev: 2,  name: 'Yuki Tanaka',       handle: '@yuki.systems',   points: 17820, tier: 'Fellow',    avatar: 'https://i.pravatar.cc/150?img=32', stack: ['Elixir', 'PostgreSQL'],   change: -1 },
  { rank: 4,  prev: 4,  name: 'Daniel Osei',       handle: '@d.osei.eng',     points: 12450, tier: 'Fellow',    avatar: 'https://i.pravatar.cc/150?img=65', stack: ['Python', 'LLM'],          change: 0  },
  { rank: 5,  prev: 7,  name: 'Amara Singh',       handle: '@amara.infra',    points: 10090, tier: 'Fellow',    avatar: 'https://i.pravatar.cc/150?img=23', stack: ['Terraform', 'AWS'],       change: 2  },
  { rank: 6,  prev: 5,  name: 'Chris Lund',        handle: '@clund.dev',      points: 7620,  tier: 'Architect', avatar: 'https://i.pravatar.cc/150?img=8',  stack: ['TypeScript', 'React'],    change: -1 },
  { rank: 7,  prev: 6,  name: 'Fatima Al-Rashid',  handle: '@fatima.kernel',  points: 6980,  tier: 'Architect', avatar: 'https://i.pravatar.cc/150?img=54', stack: ['Linux Kernel', 'C++'],    change: -1 },
  { rank: 8,  prev: 10, name: 'Leo Ferreira',      handle: '@leo.obs',        points: 6110,  tier: 'Architect', avatar: 'https://i.pravatar.cc/150?img=15', stack: ['Prometheus', 'Grafana'],  change: 2  },
  { rank: 9,  prev: 9,  name: 'Natasha Ivanova',   handle: '@n.ivanova.swe',  points: 5830,  tier: 'Architect', avatar: 'https://i.pravatar.cc/150?img=44', stack: ['Go', 'gRPC'],             change: 0  },
  { rank: 10, prev: 8,  name: 'Sam Okafor',        handle: '@sam.platform',   points: 5210,  tier: 'Architect', avatar: 'https://i.pravatar.cc/150?img=36', stack: ['Kafka', 'ClickHouse'],    change: -2 },
  { rank: 11, prev: 11, name: 'Elena Popov',       handle: '@elena.data',     points: 3840,  tier: 'Senior',    avatar: 'https://i.pravatar.cc/150?img=29', stack: ['Python', 'PyTorch'],      change: 0  },
  { rank: 12, prev: 14, name: 'James Whitfield',   handle: '@j.whitfield',    points: 3210,  tier: 'Senior',    avatar: 'https://i.pravatar.cc/150?img=19', stack: ['Rust', 'Wasm'],           change: 2  },
  { rank: 13, prev: 12, name: 'Aiko Nakamura',     handle: '@aiko.sre',       points: 2970,  tier: 'Senior',    avatar: 'https://i.pravatar.cc/150?img=57', stack: ['Kubernetes', 'Docker'],   change: -1 },
  { rank: 14, prev: 13, name: 'Omar Hassan',       handle: '@o.hassan.eng',   points: 2640,  tier: 'Senior',    avatar: 'https://i.pravatar.cc/150?img=41', stack: ['FastAPI', 'PostgreSQL'],  change: -1 },
  { rank: 15, prev: 16, name: 'Lucia Mendez',      handle: '@lucia.frontend', points: 2480,  tier: 'Senior',    avatar: 'https://i.pravatar.cc/150?img=61', stack: ['Next.js', 'TypeScript'],  change: 1  },
];

// Logged-in user's rank entry (appears in the pinned card)
const MY_RANK = {
  rank: 42, prev: 45, name: 'Alex Rivera', handle: '@arivera.dev',
  points: 1124, tier: 'Engineer',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
  stack: ['Go', 'Kubernetes', 'PostgreSQL'],
  change: 3,
  nextTierPoints: 1500,
  pointsToNext: 376,
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function RankChange({ change }: { change: number }) {
  if (change === 0) return <Minus size={12} style={{ color: colors.muted }} />;
  if (change > 0)   return <span className="inline-flex items-center gap-0.5 text-[11px] font-bold" style={{ color: '#2DD4A3' }}><ChevronUp size={12} />{change}</span>;
  return <span className="inline-flex items-center gap-0.5 text-[11px] font-bold" style={{ color: '#f43f5e' }}><ChevronDown size={12} />{Math.abs(change)}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const t = TIERS.find((x) => x.name === tier) ?? TIERS[0];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{ background: t.bg, color: t.color }}
    >
      <span>{t.icon}</span>
      {t.name}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const me = useUiStore((s) => s.me);
  const myName = me?.display_name ?? MY_RANK.name;
  const myHandle = me?.username ? `@${me.username}` : MY_RANK.handle;
  const myAvatar = me?.avatar_url ?? MY_RANK.avatar;

  const [activeTab, setActiveTab] = useState<'global' | 'stack'>('global');

  const myTier    = getTier(MY_RANK.points);
  const nextTier  = TIERS[TIERS.findIndex((t) => t.name === myTier.name) + 1];
  const progress  = nextTier
    ? ((MY_RANK.points - myTier.min) / (myTier.max - myTier.min + 1)) * 100
    : 100;

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <p className="font-mono text-xs uppercase tracking-[0.28em]" style={{ color: colors.muted }}>
        Impact-Based Reputation
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ color: colors.primary }}>Global Ranking</h1>
          <p className="mt-1 max-w-xl text-sm leading-6" style={{ color: colors.secondary }}>
            Your rank reflects real-world impact, not follower count. Points are weighted by the
            standing of who engages with your work — making it impossible to game.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: 'rgba(45,212,163,0.1)', color: colors.verified, border: '1px solid rgba(45,212,163,0.2)' }}>
          <Crown size={15} /> {LEADERBOARD.length.toLocaleString()}+ ranked engineers
        </span>
      </div>

      {/* ── My rank card ─────────────────────────────────────────────────── */}
      <section
        className="mt-6 rounded-xl p-5"
        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
      >
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.muted }}>Your standing</p>
        <div className="flex flex-wrap items-center gap-4">
          <img src={myAvatar} alt="" className="h-12 w-12 rounded-full object-cover grayscale" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold" style={{ color: colors.primary }}>{myName}</span>
              <span style={{ color: colors.muted }}>{myHandle}</span>
              <TierBadge tier={MY_RANK.tier} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm" style={{ color: colors.secondary }}>
              <span>Rank <b style={{ color: colors.primary }}>#{MY_RANK.rank}</b></span>
              <span><b style={{ color: colors.verified }}>{MY_RANK.points.toLocaleString()}</b> pts</span>
              <RankChange change={MY_RANK.change} />
            </div>
          </div>
          {nextTier && (
            <div className="w-full sm:w-56">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: colors.muted }}>
                <span>{myTier.name}</span>
                <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.name} in {MY_RANK.pointsToNext} pts</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: colors.cardAlt }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress)}%`, background: myTier.color }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Point system ─────────────────────────────────────────────────── */}
      <section
        className="mt-6 rounded-xl overflow-hidden"
        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
      >
        <div className="px-5 pt-5 pb-4">
          <h2 className="text-lg font-bold" style={{ color: colors.primary }}>Point System</h2>
          <p className="mt-0.5 text-sm" style={{ color: colors.secondary }}>
            Points from high-ranked engineers carry more weight — preventing gaming.
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: colors.border }}>
          {POINT_ACTIONS.map(({ icon: Icon, label, points, weight }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3.5">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                style={{ background: weight === 'high' ? 'rgba(45,212,163,0.12)' : colors.cardAlt }}
              >
                <Icon size={15} style={{ color: weight === 'high' ? colors.verified : colors.secondary }} />
              </span>
              <span className="flex-1 text-sm" style={{ color: colors.primary }}>{label}</span>
              {weight === 'high' && (
                <span className="hidden sm:inline rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(45,212,163,0.1)', color: colors.verified }}>
                  High impact
                </span>
              )}
              <span className="font-mono text-sm font-bold" style={{ color: colors.verified }}>{points}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rank tiers ───────────────────────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold" style={{ color: colors.primary }}>Rank Tiers</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: tier.name === MY_RANK.tier ? tier.bg : colors.card,
                border: `1px solid ${tier.name === MY_RANK.tier ? tier.color : colors.border}`,
              }}
            >
              <div className="text-2xl">{tier.icon}</div>
              <p className="mt-1.5 text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
              <p className="mt-0.5 font-mono text-[10px]" style={{ color: colors.muted }}>
                {tier.max === Infinity ? `${tier.min.toLocaleString()}+` : `${tier.min}–${tier.max.toLocaleString()}`} pts
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leaderboard table ────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: colors.primary }}>Global Rankings</h2>
          <div className="flex rounded-full p-0.5" style={{ background: colors.cardAlt }}>
            {(['global', 'stack'] as const).map((tab) => (
              <button
                key={tab}
                className="rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors"
                style={{
                  background: activeTab === tab ? colors.verified : 'transparent',
                  color: activeTab === tab ? '#000' : colors.muted,
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'global' ? 'Global' : 'Your Stack'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${colors.border}` }}>
          {/* Table header */}
          <div
            className="grid items-center px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ background: colors.cardAlt, color: colors.muted, gridTemplateColumns: '2.5rem 1fr 7rem 6rem 4rem' }}
          >
            <span>#</span>
            <span>Engineer</span>
            <span className="hidden sm:block">Stack</span>
            <span className="text-right">Points</span>
            <span className="text-right">Change</span>
          </div>

          {/* Rows */}
          {LEADERBOARD.map((entry, i) => {
            const tier = getTier(entry.points);
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.rank}
                className="grid items-center px-4 py-3 transition-colors hover:bg-[#1a1d24]"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 7rem 6rem 4rem',
                  borderTop: i > 0 ? `1px solid ${colors.border}` : undefined,
                  background: isTop3 ? `${tier.bg}` : undefined,
                }}
              >
                {/* Rank number */}
                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: isTop3 ? tier.color : colors.muted }}
                >
                  {entry.rank}
                </span>

                {/* Engineer */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={entry.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover grayscale" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-bold" style={{ color: colors.primary }}>{entry.name}</span>
                      {isTop3 && <TierBadge tier={entry.tier} />}
                    </div>
                    <span className="text-xs" style={{ color: colors.muted }}>{entry.handle}</span>
                  </div>
                </div>

                {/* Stack tags */}
                <div className="hidden sm:flex flex-wrap gap-1">
                  {entry.stack.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: 'rgba(45,212,163,0.08)', color: colors.verified }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Points */}
                <span
                  className="text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: isTop3 ? tier.color : colors.primary }}
                >
                  {entry.points.toLocaleString()}
                </span>

                {/* Change */}
                <div className="flex justify-end">
                  <RankChange change={entry.change} />
                </div>
              </div>
            );
          })}

          {/* My position separator */}
          <div
            className="grid items-center px-4 py-3 border-t-2"
            style={{
              gridTemplateColumns: '2.5rem 1fr 7rem 6rem 4rem',
              borderColor: colors.verified,
              background: 'rgba(45,212,163,0.05)',
            }}
          >
            <span className="text-sm font-black tabular-nums" style={{ color: colors.verified }}>
              {MY_RANK.rank}
            </span>
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={myAvatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover grayscale" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-bold" style={{ color: colors.verified }}>{myName}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(45,212,163,0.15)', color: colors.verified }}>You</span>
                </div>
                <span className="text-xs" style={{ color: colors.muted }}>{myHandle}</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-wrap gap-1">
              {MY_RANK.stack.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'rgba(45,212,163,0.08)', color: colors.verified }}>{tag}</span>
              ))}
            </div>
            <span className="text-right font-mono text-sm font-bold tabular-nums" style={{ color: colors.verified }}>
              {MY_RANK.points.toLocaleString()}
            </span>
            <div className="flex justify-end">
              <RankChange change={MY_RANK.change} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
