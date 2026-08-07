import { useState } from 'react';
import { GitFork, Repeat2, Briefcase, GitPullRequest, GraduationCap, Crown, BadgeCheck, Sprout, Zap, Wrench, ShieldCheck, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';
import { avatarFor } from '../services/adapters';

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

// ─── Rank tier definitions (credibility-score scale, 0–100) ─────────────────

const TIERS = [
  { name: 'Newcomer',    min: 0,   max: 69,  color: '#536471', bg: 'rgba(83,100,113,0.12)',  icon: Sprout },
  { name: 'Contributor', min: 70,  max: 79,  color: '#71767b', bg: 'rgba(113,118,123,0.12)', icon: Zap },
  { name: 'Engineer',    min: 80,  max: 84,  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: Wrench },
  { name: 'Senior',      min: 85,  max: 89,  color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: ShieldCheck },
  { name: 'Architect',   min: 90,  max: 94,  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Landmark },
  { name: 'Fellow',      min: 95,  max: Infinity, color: '#2DD4A3', bg: 'rgba(45,212,163,0.14)', icon: Crown },
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const t = TIERS.find((x) => x.name === tier) ?? TIERS[0];
  const Icon = t.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
      style={{ background: t.bg, color: t.color }}
    >
      <Icon size={12} />
      {t.name}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const navigate = useNavigate();
  const me = useUiStore((s) => s.me);
  const [activeTab, setActiveTab] = useState<'global' | 'stack'>('global');

  const { data: authors = [] } = useQuery({
    queryKey: ['ranking'],
    queryFn: () => api.getRankingAuthors(100),
  });
  const { data: stackData = [] } = useQuery({ queryKey: ['stack'], queryFn: api.getStack });

  const myStack = stackData.map((s) => s.technology.toLowerCase());
  const visible = activeTab === 'stack'
    ? authors.filter((a) => a.stack.some((t) => myStack.includes(t.toLowerCase())))
    : authors;

  const myRank = authors.findIndex((a) => me?.username && a.username === me.username) + 1;
  const myPoints = myRank > 0 ? Math.round(authors[myRank - 1].credibility_score) : 0;
  const myTier = getTier(myPoints);
  const nextTier = TIERS[TIERS.findIndex((t) => t.name === myTier.name) + 1];
  const progress = nextTier
    ? Math.min(100, ((myPoints - myTier.min) / (myTier.max - myTier.min + 1)) * 100)
    : 100;
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - myPoints) : 0;

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
            Rankings are driven by verified credibility scores — built from claims that hold up
            under peer review, not follower counts.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold" style={{ background: 'rgba(45,212,163,0.1)', color: colors.verified, border: '1px solid rgba(45,212,163,0.2)' }}>
          <Crown size={15} /> {authors.length.toLocaleString()} ranked engineers
        </span>
      </div>

      {/* ── My rank card ─────────────────────────────────────────────────── */}
      <section
        className="mt-6 rounded-xl p-5"
        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
      >
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: colors.muted }}>Your standing</p>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={avatarFor(me?.display_name || me?.username || '', me?.avatar_url)}
            alt=""
            className="h-12 w-12 rounded-full object-cover grayscale"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold" style={{ color: colors.primary }}>{me?.display_name || 'Engineer'}</span>
              <span style={{ color: colors.muted }}>{me?.username ? `@${me.username}` : ''}</span>
              <TierBadge tier={myTier.name} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm" style={{ color: colors.secondary }}>
              {myRank > 0 ? (
                <>
                  <span>Rank <b style={{ color: colors.primary }}>#{myRank}</b></span>
                  <span><b style={{ color: colors.verified }}>{myPoints}</b> credibility</span>
                </>
              ) : (
                <span>Not ranked yet — publish and earn verified claims to climb the board.</span>
              )}
            </div>
          </div>
          {nextTier && (
            <div className="w-full sm:w-56">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: colors.muted }}>
                <span>{myTier.name}</span>
                <span className="font-semibold" style={{ color: nextTier.color }}>{nextTier.name} in {pointsToNext} pts</span>
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
            Contributions that hold up under review carry the most weight.
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
                <span className="hidden sm:inline rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(45,212,163,0.1)', color: colors.verified }}>
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
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className="rounded-xl px-3 py-3 text-center"
                style={{
                  background: tier.name === myTier.name ? tier.bg : colors.card,
                  border: `1px solid ${tier.name === myTier.name ? tier.color : colors.border}`,
                }}
              >
                <Icon size={22} style={{ color: tier.color, margin: '0 auto' }} />
                <p className="mt-1.5 text-sm font-bold" style={{ color: tier.color }}>{tier.name}</p>
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: colors.muted }}>
                  {tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`} pts
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Leaderboard table ────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: colors.primary }}>Global Rankings</h2>
          <div className="flex rounded-md p-0.5" style={{ background: colors.cardAlt }}>
            {(['global', 'stack'] as const).map((tab) => (
              <button
                key={tab}
                className="rounded-md px-4 py-1.5 text-xs font-bold capitalize transition-colors"
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

        {activeTab === 'stack' && myStack.length === 0 && (
          <p className="mb-4 text-sm" style={{ color: colors.muted }}>
            Add technologies to your stack in Settings to see peers ranked here.
          </p>
        )}

        <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${colors.border}` }}>
          {/* Table header */}
          <div
            className="grid items-center px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ background: colors.cardAlt, color: colors.muted, gridTemplateColumns: '2.5rem 1fr 7rem 5rem 5rem' }}
          >
            <span>#</span>
            <span>Engineer</span>
            <span className="hidden sm:block">Stack</span>
            <span className="text-right">Credibility</span>
            <span className="text-right">Verified</span>
          </div>

          {/* Rows */}
          {visible.map((entry, i) => {
            const points = Math.round(entry.credibility_score);
            const tier = getTier(points);
            const isTop3 = i < 3;
            return (
              <div
                key={entry.user_id}
                className="grid items-center px-4 py-3 transition-colors hover:bg-[#1a1d24]"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 7rem 5rem 5rem',
                  borderTop: i > 0 ? `1px solid ${colors.border}` : undefined,
                  background: isTop3 ? `${tier.bg}` : undefined,
                }}
              >
                {/* Rank number */}
                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: isTop3 ? tier.color : colors.muted }}
                >
                  {i + 1}
                </span>

                {/* Engineer */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={avatarFor(entry.display_name, entry.avatar_url)}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover grayscale cursor-pointer"
                    onClick={() => navigate(`/profile/${entry.username}`)}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        className="truncate text-sm font-bold hover:underline"
                        style={{ color: colors.primary }}
                        onClick={() => navigate(`/profile/${entry.username}`)}
                      >
                        {entry.display_name || entry.username}
                      </button>
                      {isTop3 && <TierBadge tier={tier.name} />}
                    </div>
                    <span className="text-xs" style={{ color: colors.muted }}>@{entry.username}</span>
                  </div>
                </div>

                {/* Stack tags */}
                <div className="hidden sm:flex flex-wrap gap-1">
                  {entry.stack.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
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
                  {points}
                </span>

                {/* Verified claims */}
                <span
                  className="flex items-center justify-end gap-1 font-mono text-sm tabular-nums"
                  style={{ color: entry.verified_claims > 0 ? colors.verified : colors.muted }}
                >
                  {entry.verified_claims}
                  {entry.verified_claims > 0 && <BadgeCheck size={14} />}
                </span>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="px-4 py-6 text-sm" style={{ color: colors.muted }}>
              No ranked engineers share your stack yet.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
