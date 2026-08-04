import { useRef, useState } from 'react';
import { Bold, Code2, ImageIcon, Italic, GitBranch, Link as LinkIcon, List, ListOrdered, Plus, Table, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUiStore } from '../store/uiStore';
import { BrandMark } from '../components/Logo';
import { api } from '../services/api';

const colors = {
  bg: '#1C1B1B',
  card: '#14171C',
  border: '#2f3336',
  primary: '#e7e9ea',
  secondary: '#71767b',
  muted: '#536471',
  mint: '#2DD4A3',
};

export function EditorPage() {
  const navigate = useNavigate();
  const showToast = useUiStore((s) => s.showToast);
  const [searchParams] = useSearchParams();
  const forkId = searchParams.get('fork');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const { data: technologiesData = [] } = useQuery({ queryKey: ['technologies'], queryFn: api.getTechnologies });

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const addTag = (raw: string) => {
    const clean = raw.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
  };

  const tagSuggestions = technologiesData
    .map((t) => t.name)
    .filter((name) => !tags.includes(name))
    .slice(0, 4);

  const insertFormatting = (before: string, after = before, placeholder = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || body;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const next = body.slice(0, lineStart) + selected.split('\n').map((l) => `${prefix}${l}`).join('\n') + body.slice(end);
    setBody(next);
  };

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insertFormatting('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertFormatting('_', '_', 'italic text') },
    { icon: LinkIcon, label: 'Link', action: () => insertFormatting('[', '](https://)', 'link text') },
    { icon: List, label: 'Unordered List', action: () => applyLinePrefix('- ') },
    { icon: ListOrdered, label: 'Ordered List', action: () => applyLinePrefix('1. ') },
    { icon: Code2, label: 'Code Block', action: () => insertFormatting('```\n', '\n```', '// code') },
    { icon: ImageIcon, label: 'Image', action: () => insertFormatting('![', '](https://)', 'alt text') },
    { icon: Table, label: 'Table', action: () => insertFormatting('| Col A | Col B |\n|---|---|\n| cell | cell |\n', '', '') },
  ];

  const publish = async () => {
    if (!body.trim() && !title.trim()) {
      showToast('Add a title and some content first', 'info');
      return;
    }
    setPublishing(true);
    try {
      let created;
      if (forkId) {
        created = await api.forkPost(forkId);
        if (title.trim() || body.trim() || tags.length > 0) {
          created = await api.updatePost(created.id, {
            title: title.trim() || created.title,
            body: body.trim() || created.body,
            excerpt: body.trim() ? body.trim().slice(0, 200) : created.excerpt,
            tags,
          });
        }
      } else {
        created = await api.createPost({
          title: title.trim() || 'Untitled patch',
          body: body.trim(),
          excerpt: body.trim().slice(0, 200),
          tags,
        });
      }
      await api.publishPost(created.id);
      navigate('/feed');
      showToast(forkId ? 'Fork published!' : 'Patch published!', 'success');
    } catch (err) {
      showToast('Failed to publish', 'info');
      setPublishing(false);
    }
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
              onClick={() => navigate(-1)}
              className="inline-flex h-9 items-center rounded-md px-4 text-sm font-semibold transition-colors hover:brightness-110"
              style={{ border: `1px solid ${colors.border}`, color: colors.secondary }}
            >
              Cancel
            </button>
            <button
              disabled={publishing}
              className="inline-flex h-9 items-center rounded-md px-5 text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: colors.mint, color: '#000' }}
              onClick={publish}
            >
              {publishing ? 'Publishing...' : forkId ? 'Publish Fork' : 'Publish Patch'}
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

          {/* Stack Tags */}
          <div className="mt-5">
            <label className="text-sm font-semibold" style={{ color: colors.secondary }}>Stack Tags</label>
            <div
              className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2"
              style={{ background: '#000', borderColor: colors.border, minHeight: '42px' }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'rgba(45,212,163,0.12)', color: colors.mint }}
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:brightness-150" aria-label={`Remove ${tag}`}>
                    <X size={13} />
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                style={{ color: colors.primary }}
                placeholder="Add tech (e.g. Rust)…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                onBlur={(e) => {
                  if (e.currentTarget.value.trim()) {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.mint, border: '1px solid #2f3336' }}
                aria-label="Add technology"
                onClick={() => {
                  if (tagInputRef.current && tagInputRef.current.value.trim()) {
                    addTag(tagInputRef.current.value);
                    tagInputRef.current.value = '';
                  }
                }}
              >
                <Plus size={15} />
              </button>
            </div>
            {tagSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagSuggestions.map((s) => (
                  <button
                    key={s}
                    className="rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-[#2DD4A3]/20"
                    style={{ borderColor: colors.border, color: colors.mint }}
                    onClick={() => addTag(s)}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
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
            {toolbar.map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                className="grid h-8 w-8 place-items-center rounded transition-colors hover:bg-[#1a1d24]"
                style={{ color: colors.secondary }}
                aria-label={label}
                title={label}
                onClick={action}
              >
                <Icon size={16} />
              </button>
            ))}
            <span className="ml-auto font-mono text-xs" style={{ color: colors.muted }}>{body.length} chars</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="min-h-[300px] flex-1 resize-none bg-transparent px-6 py-5 text-base leading-7 outline-none"
            style={{ color: colors.primary }}
            placeholder="Describe your technical findings or architectural proposal here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </section>
      </div>
    </main>
  );
}
