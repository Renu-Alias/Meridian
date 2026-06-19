import { Edit3, GraduationCap } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

export function RightPanel() {
  const activeStack = useUiStore((state) => state.activeStack);
  const cells = Array.from({ length: 32 }, (_, index) => (index * 7) % 5);

  return (
    <aside className="hidden w-[330px] shrink-0 border-l border-surface bg-[#f4f6f6] p-5 xl:block">
      <section className="border border-surface bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Your Stack</h2>
          <button aria-label="Edit stack" className="text-muted hover:text-ink">
            <Edit3 size={16} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {activeStack.slice(0, 3).map((tag) => (
            <span key={tag} className="border-b-2 border-verified bg-surface px-3 py-1 text-sm font-bold">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted">
          <span>Stack Velocity</span>
          <span className="font-sans text-sm font-bold normal-case tracking-normal text-emerald-700">+12% this week</span>
        </div>
        <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
          {cells.map((level, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-sm ${level > 3 ? 'bg-verified' : level > 1 ? 'bg-verified/40' : 'bg-surface'}`}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 border border-surface bg-white">
        <h2 className="p-5 font-bold">Trending in your Stack</h2>
        {[
          ['Architecture', 'eBPF-based Observability', '2.4k engineers discussing'],
          ['DevOps', 'ArgoCD v2.10 Migration', '1.1k active patches'],
          ['Languages', 'Zig for Python Extensions', '842 impact score'],
        ].map(([category, title, meta]) => (
          <article key={title} className="border-t border-surface p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{category}</p>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{meta}</p>
          </article>
        ))}
        <button className="w-full border-t border-surface p-4 text-sm font-bold text-emerald-700">Show more</button>
      </section>

      <section className="mt-6 border border-surface bg-white p-5">
        <h2 className="font-bold">Mentorship Opportunities</h2>
        {['Help with Kubernetes CRDs', 'Code Review: Rust WASM'].map((item) => (
          <div key={item} className="mt-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-verified/10 text-emerald-700">
              <GraduationCap size={20} />
            </span>
            <div>
              <p className="text-sm font-bold">{item}</p>
              <p className="text-xs text-muted">Request from @junior_dev</p>
            </div>
          </div>
        ))}
        <button className="mt-6 h-11 w-full rounded-full border border-black font-bold hover:bg-black hover:text-white">Become a Mentor</button>
      </section>
    </aside>
  );
}
