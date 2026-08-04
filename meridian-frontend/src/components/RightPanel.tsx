import { Edit3, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContributionGraph } from './ContributionGraph';
import { useUiStore } from '../store/uiStore';
import { api } from '../services/api';

const colors = {
  card: '#151515',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  verified: '#2DD4A3',
};

export function RightPanel() {
  const navigate = useNavigate();
  const activeStack = useUiStore((state) => state.activeStack);
  const me = useUiStore((state) => state.me);
  const { data: stackData = [] } = useQuery({ queryKey: ['stack'], queryFn: api.getStack });
  const stack = stackData.length > 0 ? stackData.map((s) => s.technology) : activeStack;

  return (
    <aside className="hidden w-[330px] shrink-0 self-start border-l p-5 xl:sticky xl:top-0 xl:block" style={{ borderColor: colors.border, background: 'transparent' }}>
      {/* Your Stack */}
      <section className="rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: colors.primary }}>Your Stack</h2>
          <button aria-label="Edit stack" className="transition-colors" style={{ color: colors.muted }} onClick={() => navigate('/settings')}>
            <Edit3 size={15} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {stack.map((tag) => (
            <span key={tag} className="rounded-full px-3 py-1 text-sm font-medium" style={{ background: 'rgba(45,212,163,0.12)', color: colors.verified }}>
              {tag}
            </span>
          ))}
          {stack.length === 0 && (
            <span className="text-sm" style={{ color: colors.muted }}>No technologies yet — add them in Settings.</span>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>
          <span>Stack Velocity</span>
          <span className="font-sans text-sm font-bold normal-case tracking-normal" style={{ color: colors.verified }}>+12% this week</span>
        </div>
        <div className="mt-3">
          <ContributionGraph variant="mini" weeks={10} seedKey={me?.username ?? 'default'} since={me?.created_at} />
        </div>
      </section>

      {/* Trending */}
      <section className="mt-4 overflow-hidden rounded-xl" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <h2 className="px-4 pb-0 pt-4 text-sm font-bold" style={{ color: colors.primary }}>Trending in your Stack</h2>
        <div className="mt-3">
          {[
            { category: 'Architecture', title: 'eBPF-based Observability', meta: '2.4k engineers discussing', icon: '🔍' },
            { category: 'DevOps', title: 'ArgoCD v2.10 Migration', meta: '1.1k active patches', icon: '⚡' },
            { category: 'Languages', title: 'Zig for Python Extensions', meta: '842 impact score', icon: '📐' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 px-4 py-3.5" style={{ borderTop: `1px solid ${colors.border}` }}>
              <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>{item.category}</p>
                <h3 className="mt-0.5 text-sm font-bold leading-snug" style={{ color: colors.primary }}>{item.title}</h3>
                <p className="mt-0.5 text-xs" style={{ color: colors.secondary }}>{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/discover')} className="w-full p-3 text-sm font-bold transition-colors hover:bg-[#1a1d24]" style={{ color: colors.verified, borderTop: `1px solid ${colors.border}` }}>
          Show more
        </button>
      </section>

      {/* Mentorship */}
      <section className="mt-4 rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <h2 className="text-sm font-bold" style={{ color: colors.primary }}>Mentorship Opportunities</h2>
        {['Help with Kubernetes CRDs', 'Code Review: Rust WASM'].map((item) => (
          <div key={item} className="mt-4 flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: 'rgba(45,212,163,0.12)' }}>
              <GraduationCap size={18} style={{ color: colors.verified }} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: colors.primary }}>{item}</p>
              <p className="text-xs" style={{ color: colors.muted }}>Request from @junior_dev</p>
            </div>
          </div>
        ))}
        <button
          className="mt-5 h-10 w-full rounded-full text-sm font-bold transition-all hover:brightness-110"
          style={{ background: colors.verified, color: '#0a0a0a' }}
          onClick={() => navigate('/discover')}
        >
          Become a Mentor
        </button>
      </section>
    </aside>
  );
}
