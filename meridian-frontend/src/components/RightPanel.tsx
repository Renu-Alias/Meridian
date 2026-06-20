import { Edit3, GraduationCap } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

const colors = {
  card: '#14171c',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  verified: '#00C896',
};

export function RightPanel() {
  const activeStack = useUiStore((state) => state.activeStack);
  const cells = Array.from({ length: 32 }, (_, index) => (index * 7) % 5);

  return (
    <aside className="hidden w-[330px] shrink-0 border-l p-5 xl:block" style={{ borderColor: colors.border, background: 'transparent' }}>
      {/* Your Stack */}
      <section className="rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: colors.primary }}>Your Stack</h2>
          <button aria-label="Edit stack" className="transition-colors" style={{ color: colors.muted }}>
            <Edit3 size={15} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {activeStack.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md px-3 py-1 text-sm font-medium" style={{ background: 'rgba(0,200,150,0.1)', color: colors.verified, borderBottom: `2px solid ${colors.verified}` }}>
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>
          <span>Stack Velocity</span>
          <span className="font-sans text-sm font-bold normal-case tracking-normal" style={{ color: colors.verified }}>+12% this week</span>
        </div>
        <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {cells.map((level, index) => (
            <span
              key={index}
              className="h-3 w-3 rounded-sm"
              style={{
                background: level > 3 ? colors.verified : level > 1 ? 'rgba(0,200,150,0.3)' : colors.border,
              }}
            />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mt-4 rounded-xl" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <h2 className="p-4 pb-0 text-sm font-bold" style={{ color: colors.primary }}>Trending in your Stack</h2>
        {[
          ['Architecture', 'eBPF-based Observability', '2.4k engineers discussing'],
          ['DevOps', 'ArgoCD v2.10 Migration', '1.1k active patches'],
          ['Languages', 'Zig for Python Extensions', '842 impact score'],
        ].map(([category, title, meta]) => (
          <article key={title} className="p-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: colors.muted }}>{category}</p>
            <h3 className="mt-1.5 text-sm font-bold" style={{ color: colors.primary }}>{title}</h3>
            <p className="mt-0.5 text-xs" style={{ color: colors.secondary }}>{meta}</p>
          </article>
        ))}
        <button className="w-full p-3 text-sm font-bold transition-colors hover:bg-[#1a1d24] rounded-b-xl" style={{ color: colors.verified, borderTop: `1px solid ${colors.border}` }}>
          Show more
        </button>
      </section>

      {/* Mentorship */}
      <section className="mt-4 rounded-xl p-5" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
        <h2 className="text-sm font-bold" style={{ color: colors.primary }}>Mentorship Opportunities</h2>
        {['Help with Kubernetes CRDs', 'Code Review: Rust WASM'].map((item) => (
          <div key={item} className="mt-4 flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ background: 'rgba(0,200,150,0.1)' }}>
              <GraduationCap size={18} style={{ color: colors.verified }} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: colors.primary }}>{item}</p>
              <p className="text-xs" style={{ color: colors.muted }}>Request from @junior_dev</p>
            </div>
          </div>
        ))}
        <button
          className="mt-5 h-10 w-full rounded-full text-sm font-bold transition-all"
          style={{ border: `1px solid ${colors.verified}`, color: colors.verified, background: 'transparent' }}
        >
          Become a Mentor
        </button>
      </section>
    </aside>
  );
}
