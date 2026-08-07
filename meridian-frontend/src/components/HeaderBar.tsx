import { useEffect, useRef, useState } from 'react';
import { HelpCircle, Menu, Search, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandMark } from './Logo';
import { useUiStore } from '../store/uiStore';
import { api, type ApiSuggestion } from '../services/api';

const titles: Record<string, string> = {
  '/feed': 'Feed',
  '/discover': 'Discover',
  '/notifications': 'Notifications',
  '/wallet': 'Wallet',
  '/profile/alex': 'Profile',
  '/settings': 'Settings',
  '/mentored': 'Mentored Track',
};

const colors = {
  border: '#2f3336',
  primary: '#e7e9ea',
  muted: '#536471',
  verified: '#2DD4A3',
};

export function HeaderBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const showToast = useUiStore((state) => state.showToast);
  const [showHelp, setShowHelp] = useState(false);
  const isEditor = location.pathname.startsWith('/editor');
  const title = isEditor ? 'Write' : titles[location.pathname] ?? 'Discover';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ApiSuggestion | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSuggestions(await api.suggest(q, 5));
      } catch {
        setSuggestions(null);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const goToSearch = (q: string) => {
    const clean = q.trim();
    if (!clean) return;
    setSearchFocused(false);
    setQuery('');
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const hasResults =
    !!suggestions &&
    (suggestions.topics.length > 0 || suggestions.users.length > 0 || suggestions.posts.length > 0);

  return (
    <header
      className="sticky top-0 z-20 flex h-12 items-center justify-between border-b px-4"
      style={{
        borderColor: colors.border,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="grid h-8 w-8 place-items-center rounded-md lg:hidden"
          style={{ border: `1px solid ${colors.border}`, color: colors.muted }}
          onClick={toggleSidebar}
        >
          <Menu size={17} />
        </button>
        <BrandMark to="/discover" className="lg:hidden" nameClassName="text-base font-semibold leading-none text-[#e7e9ea]" />
        <h1 className="hidden text-lg font-bold lg:block" style={{ color: colors.primary }}>{title}</h1>
      </div>

      <div
        ref={searchBoxRef}
        className="relative hidden w-full max-w-[300px] sm:block"
      >
        <div
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
          style={{ background: '#151515', border: `1px solid ${searchFocused ? colors.verified : colors.border}` }}
        >
          <Search size={15} style={{ color: colors.muted }} aria-hidden="true" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: colors.primary, '--tw-placeholder-color': colors.muted } as React.CSSProperties}
            placeholder={isEditor ? 'Search drafts...' : 'Search stack, people, topics...'}
            aria-label="Search stack"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goToSearch(query);
              if (e.key === 'Escape') { setSearchFocused(false); setQuery(''); }
            }}
          />
          {query && (
            <button
              aria-label="Clear search"
              className="grid h-5 w-5 place-items-center rounded-full hover:bg-[#1a1d24]"
              style={{ color: colors.muted }}
              onClick={() => setQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {searchFocused && query.trim().length > 0 && (
          <div className="absolute right-0 top-11 z-30 max-h-[420px] w-[340px] overflow-y-auto rounded-xl border py-2 shadow-xl" style={{ background: '#151515', borderColor: colors.border }}>
            {!hasResults ? (
              <p className="px-4 py-3 text-sm" style={{ color: colors.muted }}>
                No results for “{query.trim()}”
              </p>
            ) : (
              <>
                {suggestions!.topics.length > 0 && (
                  <div className="mb-1">
                    <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Topics</p>
                    {suggestions!.topics.map((t) => (
                      <button
                        key={t.name}
                        className="flex w-full items-center justify-between gap-2 px-4 py-1.5 text-left text-sm transition-colors hover:bg-[#1a1d24]"
                        style={{ color: colors.primary }}
                        onClick={() => { setSearchFocused(false); setQuery(''); navigate(`/tag/${encodeURIComponent(t.name)}`); }}
                      >
                        <span className="font-semibold" style={{ color: colors.verified }}>#{t.name}</span>
                        <span className="text-xs" style={{ color: colors.muted }}>{t.count} posts</span>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions!.users.length > 0 && (
                  <div className="mb-1">
                    <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>People</p>
                    {suggestions!.users.map((u) => (
                      <button
                        key={u.id}
                        className="flex w-full items-center gap-2.5 px-4 py-1.5 text-left transition-colors hover:bg-[#1a1d24]"
                        onClick={() => { setSearchFocused(false); setQuery(''); navigate(`/profile/${u.username}`); }}
                      >
                        <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover grayscale" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold" style={{ color: colors.primary }}>{u.display_name}</span>
                          <span className="block truncate text-xs" style={{ color: colors.muted }}>@{u.username}</span>
                        </span>
                        {u.stack.length > 0 && (
                          <span className="hidden max-w-[90px] truncate text-xs sm:block" style={{ color: colors.muted }}>
                            {u.stack.slice(0, 2).join(' · ')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {suggestions!.posts.length > 0 && (
                  <div className="mb-1">
                    <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Posts</p>
                    {suggestions!.posts.map((p) => (
                      <button
                        key={p.id}
                        className="flex w-full flex-col gap-0.5 px-4 py-1.5 text-left transition-colors hover:bg-[#1a1d24]"
                        onClick={() => { setSearchFocused(false); setQuery(''); navigate(`/post/${p.id}`); }}
                      >
                        <span className="truncate text-sm font-semibold" style={{ color: colors.primary }}>{p.title}</span>
                        <span className="truncate text-xs" style={{ color: colors.muted }}>
                          {p.author?.display_name} · {p.tags.slice(0, 3).join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="w-full border-t px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-[#1a1d24]"
                  style={{ borderColor: colors.border, color: colors.verified }}
                  onClick={() => goToSearch(query)}
                >
                  See all results for “{query.trim()}” →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Help */}
        <div className="relative">
          <button className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="Help" onClick={() => setShowHelp(!showHelp)}>
            <HelpCircle size={18} />
          </button>
          {showHelp && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowHelp(false)} />
              <div className="absolute right-0 top-10 z-20 w-64 rounded-lg border p-4 shadow-xl" style={{ background: '#151515', borderColor: '#2f3336' }}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm" style={{ color: '#e7e9ea' }}>Help & Support</h4>
                  <button onClick={() => setShowHelp(false)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-[#1a1d24]" style={{ color: '#71767b' }}><X size={14} /></button>
                </div>
                <ul className="mt-3 space-y-2">
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#2DD4A3]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Opening quick start guide...', 'success'); setShowHelp(false); }}>📖 Quick Start Guide</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#2DD4A3]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('API docs are available at /docs', 'success'); setShowHelp(false); }}>📘 API Documentation</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#2DD4A3]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Keyboard shortcuts: N = New Post, F = Feed, D = Discover', 'success'); setShowHelp(false); }}>⌨️ Keyboard Shortcuts</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#2DD4A3]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Report an issue at github.com/meridian/issues', 'success'); setShowHelp(false); }}>🐛 Report an Issue</button></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
