import { useState } from 'react';
import { Bold, Code2, ImageIcon, Italic, GitBranch, Link as LinkIcon, List, ListOrdered, Table, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { BrandMark } from '../components/Logo';

const colors = {
  bg: '#1C1B1B',
  card: '#14171C',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  mint: '#00C896',
};

export function EditorPage() {
  const navigate = useNavigate();
  const showToast = useUiStore((s) => s.showToast);
  const [searchParams] = useSearchParams();
  const forkId = searchParams.get('fork');
  const initialTitle = searchParams.get('title') || '';
  const initialBody = searchParams.get('body') || '';

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [tags, setTags] = useState(forkId ? ['Fork'] : ['Rust', 'Wasm']);
  const [impactScore, setImpactScore] = useState(75);

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <main className="relative z-10 min-h-screen" style={{ background: colors.bg }}>
      <nav className="border-b px-6 py-3" style={{ borderColor: colors.border, background: 'rgba(28,27,27,0.95)' }}>
        <BrandMark to="/discover" />
      </nav>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
              {forkId ? (
                <span className="inline-flex items-center gap-2"><GitBranch size={28} style={{ color: colors.mint }} /> Fork Post</span>
              ) : 'Publish New Patch'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.secondary }}>{forkId ? 'Adapt and evolve an existing post into your own version.' : 'Contribute to the collective engineering knowledge base.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/feed')}
              className="inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold transition-colors hover:brightness-110"
              style={{ border: `1px solid ${colors.border}`, color: colors.secondary }}
            >
              Cancel
            </button>
            <button
              className="inline-flex h-9 items-center rounded-md px-5 text-sm font-bold transition-all hover:brightness-110"
              style={{ background: colors.mint, color: '#000' }}
              onClick={() => { navigate('/feed'); showToast(forkId ? 'Fork published!' : 'Patch published!', 'success'); }}
            >
              {forkId ? 'Publish Fork' : 'Publish Patch'}
            </button>
          </div>
        </header>

        {/* METADATA SETTINGS CARD */}
        <section
          className="mt-6 rounded-xl border p-6"
          style={{ background: colors.card, borderColor: colors.border }}
        >
          {/* Patch Title */}
          <div>
            <label className="text-sm font-semibold" style={{ color: colors.secondary }}>Patch Title</label>
            <input
              className="mt-1.5 block w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:brightness-110"
              style={{ background: '#000', borderColor: colors.border, color: colors.primary }}
              placeholder="e.g., Optimized WebGL fragment shaders for low-power mobile devices"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Stack Tags + Impact Score */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Stack Tags */}
            <div>
              <label className="text-sm font-semibold" style={{ color: colors.secondary }}>Stack Tags</label>
              <div
                className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2"
                style={{ background: '#000', borderColor: colors.border, minHeight: '42px' }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                    style={{ background: 'rgba(0,200,150,0.12)', color: colors.mint }}
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:brightness-150" aria-label={`Remove ${tag}`}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <span className="text-xs" style={{ color: colors.muted }}>Add tech...</span>
              </div>
            </div>

            {/* Expected Impact Score */}
            <div>
              <label className="text-sm font-semibold" style={{ color: colors.secondary }}>Expected Impact Score (1-100)</label>
              <div className="mt-1.5 flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={impactScore}
                  onChange={(e) => setImpactScore(Number(e.target.value))}
                  className="flex-1 accent-[#00C896]"
                  style={{ height: '6px', cursor: 'pointer', accentColor: colors.mint }}
                />
                <span
                  className="inline-flex items-center rounded-md border px-3 py-1 font-mono text-sm font-bold"
                  style={{ borderColor: 'rgba(0,200,150,0.3)', color: colors.mint, background: 'rgba(0,200,150,0.06)' }}
                >
                  {impactScore}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RICH MARKDOWN EDITOR */}
        <section
          className="mt-6 flex flex-1 flex-col rounded-xl border"
          style={{ background: colors.card, borderColor: colors.border }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-wrap items-center gap-1 border-b px-4 py-2"
            style={{ borderColor: colors.border }}
          >
            {[Bold, Italic, LinkIcon].map((Icon, i) => (
              <button
                key={i}
                className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.secondary }}
                aria-label={['Bold', 'Italic', 'Link'][i]}
              >
                <Icon size={16} />
              </button>
            ))}
            <span className="mx-1 h-5 w-px" style={{ background: colors.border }} />
            {[List, ListOrdered].map((Icon, i) => (
              <button
                key={i}
                className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.secondary }}
                aria-label={['Unordered List', 'Ordered List'][i]}
              >
                <Icon size={16} />
              </button>
            ))}
            <button
              className="grid h-8 w-8 place-items-center rounded"
              style={{ background: 'rgba(0,200,150,0.15)', color: colors.mint }}
              aria-label="Code Block"
            >
              <Code2 size={16} />
            </button>
            {[ImageIcon, Table].map((Icon, i) => (
              <button
                key={i + 3}
                className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.secondary }}
                aria-label={['Image', 'Table'][i]}
              >
                <Icon size={16} />
              </button>
            ))}
            <span className="ml-auto text-xs" style={{ color: 'rgba(0,200,150,0.6)' }}>• Draft Saved</span>
          </div>

          {/* Textarea */}
          <textarea
            className="min-h-[200px] flex-1 resize-none bg-transparent px-6 py-5 text-base leading-7 outline-none"
            style={{ color: colors.primary }}
            placeholder="Describe your technical findings or architectural proposal here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          {/* LIVE INTEGRATED CODE BLOCK */}
          <div
            className="mx-5 mb-5 overflow-hidden rounded-lg border"
            style={{ borderColor: colors.border }}
          >
            {/* Code block header */}
            <div
              className="flex items-center justify-between px-4 py-2 text-xs font-semibold"
              style={{ background: '#0a0c10', borderBottom: `1px solid ${colors.border}`, color: colors.secondary }}
            >
              <div className="flex items-center gap-2">
                <Code2 size={14} style={{ color: colors.mint }} />
                <span>CODE BLOCK: performance_module.rs</span>
              </div>
              <span
                className="rounded px-2 py-0.5 font-mono text-[11px]"
                style={{ background: 'rgba(0,200,150,0.1)', color: colors.mint }}
              >
                Rust ▾
              </span>
            </div>
            {/* Syntax area */}
            <div className="flex font-mono text-[13px] leading-6" style={{ background: '#0a0c10' }}>
              <div className="select-none px-3 py-3 text-right" style={{ color: colors.muted }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              <pre className="flex-1 overflow-x-auto py-3 pr-4">
                <code
                  dangerouslySetInnerHTML={{
                    __html: [
                      '<span style="color:#c9d1d9">pub </span>',
                      '<span style="color:#d2a8ff">fn</span>',
                      '<span style="color:#c9d1d9"> </span>',
                      '<span style="color:#ffa657">optimize_pipeline</span>',
                      '<span style="color:#c9d1d9">(</span>',
                      '<span style="color:#79c0ff">config</span>',
                      '<span style="color:#c9d1d9">: &amp;</span>',
                      '<span style="color:#79c0ff">mut</span>',
                      '<span style="color:#c9d1d9"> </span>',
                      '<span style="color:#ffa657">PipelineConfig</span>',
                      '<span style="color:#c9d1d9">) {</span>',
                      '\n  ',
                      '<span style="color:#7ee787">// Initialize shader cache</span>',
                      '\n  ',
                      '<span style="color:#d2a8ff">let</span>',
                      '<span style="color:#c9d1d9"> </span>',
                      '<span style="color:#79c0ff">cache</span>',
                      '<span style="color:#c9d1d9"> = </span>',
                      '<span style="color:#ffa657">ShaderCache::new</span>',
                      '<span style="color:#c9d1d9">(</span>',
                      '<span style="color:#79c0ff">config</span>',
                      '<span style="color:#c9d1d9">.</span>',
                      '<span style="color:#79c0ff">device</span>',
                      '<span style="color:#c9d1d9">);</span>',
                      '<span style="color:#7ee787">// Warm with common kernels</span>',
                      '\n\n  ',
                      '<span style="color:#d2a8ff">macro_rules!</span>',
                      '<span style="color:#79c0ff"> profile_scope </span>',
                      '<span style="color:#c9d1d9">{</span>',
                      '\n      ',
                      '<span style="color:#ffa657">trace!</span>',
                      '<span style="color:#c9d1d9">(</span>',
                      '<span style="color:#a5d6ff">"pipeline_optimize"</span>',
                      '<span style="color:#c9d1d9">, $</span>',
                      '<span style="color:#79c0ff">label</span>',
                      '<span style="color:#c9d1d9">);</span>',
                      '\n  }',
                      '\n}',
                    ].join(''),
                  }}
                />
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
