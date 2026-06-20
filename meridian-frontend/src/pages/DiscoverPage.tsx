import { Flame, MessageSquare, Repeat2, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../components/Badge';
import { fetchDiscover } from '../services/mockApi';

const colors = {
  card: '#14171c',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  verified: '#00C896',
};

export function DiscoverPage() {
  const { data } = useQuery({ queryKey: ['discover'], queryFn: fetchDiscover });
  if (!data) return <div className="p-8" style={{ color: colors.secondary }}>Loading discovery graph...</div>;

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors.verified }} />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.muted }}>Algorithm Active</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-black" style={{ color: colors.primary }}>Stack-Matched for You</h2>
        <span className="rounded-full px-3 py-1 font-mono text-xs font-bold" style={{ background: 'rgba(0,200,150,0.1)', color: colors.verified }}>
          Go · Kubernetes
        </span>
        <span className="rounded-full px-3 py-1 font-mono text-xs" style={{ background: '#14171c', color: colors.secondary, border: `1px solid ${colors.border}` }}>
          Distributed Systems
        </span>
      </div>

      {/* Featured */}
      <article className="mt-5 rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-mono font-bold" style={{ background: 'rgba(0,200,150,0.1)', color: colors.verified }}>
            λ
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-bold leading-6" style={{ color: colors.primary }}>{data.featured.title}</h3>
                <p className="text-sm" style={{ color: colors.secondary }}>By {data.featured.handle} · {data.featured.age}</p>
              </div>
              <Badge status="verified" label="Verified Claim" />
            </div>
            <p className="mt-2 max-w-3xl text-[15px] leading-6" style={{ color: colors.primary }}>{data.featured.excerpt}</p>
            <div className="mt-4 flex gap-6 text-sm" style={{ color: colors.muted, borderTop: `1px solid ${colors.border}`, paddingTop: '14px' }}>
              <span className="inline-flex items-center gap-1.5"><Repeat2 size={16} style={{ color: colors.verified }} />1.2k Impact Ripples</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare size={16} />84 Comments</span>
            </div>
          </div>
        </div>
      </article>

      {/* Cards grid */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {data.cards.map((card) => (
          <article key={card.title} className="group rounded-xl overflow-hidden" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
            <div className="h-36 overflow-hidden">
              <img src={card.image} alt="" className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <h3 className="text-[16px] font-bold leading-6" style={{ color: colors.primary }}>{card.title}</h3>
              <p className="mt-1.5 text-sm font-medium" style={{ color: colors.verified }}>{card.status}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-xs" style={{ color: colors.muted }}>{card.ripples} Ripples</span>
                <button className="text-sm font-bold transition-all group-hover:brightness-110" style={{ color: colors.verified }}>
                  Read More →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Trending */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold" style={{ color: colors.primary }}>
          <Flame size={22} style={{ color: colors.verified }} /> Trending Patches
        </h2>
        <div className="mt-4 space-y-2">
          {data.trending.map(([title, growth], index) => (
            <article key={title} className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-[#1a1d24]" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              <span className="text-2xl font-bold" style={{ color: index === 0 ? colors.verified : colors.muted }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold" style={{ color: colors.primary }}>{title}</h3>
                <p className="text-sm" style={{ color: colors.secondary }}>
                  Patched by @security_lead · {index ? '8.4k' : '12k'} forks in 2 hours
                </p>
              </div>
              <span className="flex items-center gap-1 font-mono text-sm font-bold" style={{ color: colors.verified }}>
                {growth}<TrendingUp size={16} />
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Mentors */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Find a Mentor</h2>
          <button className="text-sm font-bold" style={{ color: colors.verified }}>View All Experts →</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.mentors.map(([name, role, tagA, tagB]) => (
            <article key={name} className="rounded-xl p-5 text-center transition-colors hover:bg-[#1a1d24]" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              <div className="mx-auto h-14 w-14 rounded-full" style={{ background: 'rgba(0,200,150,0.1)' }} />
              <h3 className="mt-3 font-bold" style={{ color: colors.primary }}>{name}</h3>
              <p className="text-sm" style={{ color: colors.secondary }}>{role}</p>
              <div className="mt-3 flex justify-center gap-2">
                <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: colors.secondary }}>{tagA}</span>
                <span className="rounded-md px-2 py-1 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: colors.secondary }}>{tagB}</span>
              </div>
              <button
                className="mt-4 h-10 w-full rounded-full text-sm font-bold transition-all"
                style={{ border: `1px solid ${colors.verified}`, color: colors.verified, background: 'transparent' }}
              >
                Connect
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
