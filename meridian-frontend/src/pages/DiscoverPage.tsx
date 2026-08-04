import { useState } from 'react';
import { Flame, MessageSquare, Repeat2, TrendingUp, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { api } from '../services/api';
import { toDiscover } from '../services/adapters';
import { compactNumber } from '../utils/format';

const colors = {
  card: '#14171c',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  verified: '#2DD4A3',
};

export function DiscoverPage() {
  const { data } = useQuery({ queryKey: ['discover'], queryFn: () => api.getDiscover().then(toDiscover) });
  const { data: stackData = [] } = useQuery({ queryKey: ['stack'], queryFn: api.getStack });
  const navigate = useNavigate();
  const [showExperts, setShowExperts] = useState(false);
  if (!data) return <div className="p-8" style={{ color: colors.secondary }}>Loading discovery graph...</div>;
  const stackChips = stackData.map((s) => s.technology);

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors.verified }} />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: colors.muted }}>Algorithm Active</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-black" style={{ color: colors.primary }}>Stack-Matched for You</h2>
        {stackChips.slice(0, 3).map((tech) => (
          <span key={tech} className="rounded-md px-3 py-1 font-mono text-xs font-bold" style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}>
            {tech}
          </span>
        ))}
      </div>

      {/* Featured */}
      {data.featured && (
      <article className="mt-5 rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-mono font-bold" style={{ background: 'rgba(45,212,163,0.1)', color: colors.verified }}>
            λ
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-bold leading-6" style={{ color: colors.primary }}>{data.featured.title}</h3>
                <p className="text-sm" style={{ color: colors.secondary }}>
                  By{' '}
                  <span
                    className="cursor-pointer hover:underline"
                    style={{ color: colors.verified }}
                    onClick={() => navigate(`/profile/${data.featured!.handle.slice(1)}`)}
                  >
                    {data.featured.handle}
                  </span>{' '}
                  · {data.featured.age}
                </p>
              </div>
              <Badge status="verified" label="Verified Claim" />
            </div>
            <p className="mt-2 max-w-3xl text-[15px] leading-6" style={{ color: colors.primary }}>{data.featured.excerpt}</p>
            <div className="mt-4 flex gap-6 text-sm" style={{ color: colors.muted, borderTop: `1px solid ${colors.border}`, paddingTop: '14px' }}>
              <span className="inline-flex items-center gap-1.5"><Repeat2 size={16} style={{ color: colors.verified }} />{compactNumber(data.featured.impactScore)} Impact Ripples</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare size={16} />{data.featured.comments} Comments</span>
            </div>
          </div>
        </div>
      </article>
      )}

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
                <button className="text-sm font-bold transition-all group-hover:brightness-110" style={{ color: colors.verified }} onClick={() => navigate(`/post/${card.id}`)}>
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
          {data.trending.map((item, index) => (
            <article key={item.title} className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-[#1a1d24]" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
              <span className="text-2xl font-bold" style={{ color: index === 0 ? colors.verified : colors.muted }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold" style={{ color: colors.primary }}>{item.title}</h3>
                <p className="text-sm" style={{ color: colors.secondary }}>
                  Patched by{' '}
                  <span
                    className="cursor-pointer hover:underline"
                    style={{ color: colors.verified }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.author}`); }}
                  >
                    @{item.author}
                  </span>
                  {' '}· {item.forks} forks
                </p>
              </div>
              <span className="flex items-center gap-1 font-mono text-sm font-bold" style={{ color: colors.verified }}>
                {item.growth}<TrendingUp size={16} />
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Mentors */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Find a Mentor</h2>
          <button className="text-sm font-bold" style={{ color: colors.verified }} onClick={() => setShowExperts(true)}>View All Experts →</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {data.mentors.map((m) => (
            <article
              key={m.id}
              className="cursor-pointer rounded-xl p-5 text-center transition-colors hover:bg-[#1a1d24]"
              style={{ background: colors.card, border: `1px solid ${colors.border}` }}
              onClick={() => navigate(`/profile/${m.username}`)}
            >
              <img
                src={m.avatar}
                alt=""
                className="mx-auto h-14 w-14 rounded-full object-cover grayscale"
              />
              <h3 className="mt-3 font-bold" style={{ color: colors.primary }}>{m.name}</h3>
              <p className="text-sm" style={{ color: colors.secondary }}>{m.role}</p>
              <div className="mt-3 flex justify-center gap-2">
                {m.tags.map((tag) => (
                  <span key={tag} className="rounded-md px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}>{tag}</span>
                ))}
              </div>
              <button
                className="mt-4 h-10 w-full rounded-md text-sm font-bold transition-all"
                style={{ background: colors.verified, color: '#0a0a0a' }}
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${m.username}`); }}
              >
                View profile
              </button>
            </article>
          ))}
        </div>
      </section>
      {showExperts && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setShowExperts(false)} />
          <div className="fixed left-1/2 top-1/2 z-40 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-2xl" style={{ background: '#14171c', borderColor: '#2f3336' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: colors.primary }}>All Experts</h3>
              <button onClick={() => setShowExperts(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#1a1d24]" style={{ color: colors.muted }}><X size={18} /></button>
            </div>
            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1 thin-scrollbar">
              {data.mentors.map((m) => (
                <button
                  key={m.id}
                  className="flex w-full items-center gap-4 rounded-lg p-4 text-left transition-colors hover:bg-[#1a1d24]"
                  style={{ border: `1px solid ${colors.border}` }}
                  onClick={() => { setShowExperts(false); navigate(`/profile/${m.username}`); }}
                >
                  <img src={m.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover grayscale" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold" style={{ color: colors.primary }}>{m.name}</p>
                    <p className="truncate text-sm" style={{ color: colors.secondary }}>{m.role} · {m.tags.join(' · ')}</p>
                  </div>
                  <span className="shrink-0 rounded-md px-3 py-1.5 text-xs font-bold" style={{ background: 'rgba(45,212,163,0.14)', color: colors.verified }}>View</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
