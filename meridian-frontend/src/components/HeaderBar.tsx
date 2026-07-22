import { useState } from 'react';
import { HelpCircle, Menu, Search, Sun, Moon, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { BrandMark } from './Logo';
import { useUiStore } from '../store/uiStore';

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
};

export function HeaderBar() {
  const location = useLocation();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const showToast = useUiStore((state) => state.showToast);
  const [showHelp, setShowHelp] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const isEditor = location.pathname.startsWith('/editor');
  const title = isEditor ? 'Write' : titles[location.pathname] ?? 'Discover';

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
        className="hidden w-full max-w-[280px] items-center gap-2 rounded-full px-3 py-1.5 text-sm sm:flex"
        style={{ background: '#151515', border: `1px solid ${colors.border}` }}
      >
        <Search size={15} style={{ color: colors.muted }} aria-hidden="true" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: colors.primary, '--tw-placeholder-color': colors.muted } as React.CSSProperties}
          placeholder={isEditor ? 'Search drafts...' : 'Search stack...'}
          aria-label="Search stack"
        />
      </div>

      <div className="flex items-center gap-1">
        {/* Theme quick-toggle */}
        <div className="relative">
          <button
            className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]"
            style={{ color: colors.muted }}
            aria-label="Display preferences"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
          >
            <Sun size={18} />
          </button>
          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)} />
              <div className="absolute right-0 top-10 z-20 w-48 rounded-lg border py-1 shadow-xl" style={{ background: '#151515', borderColor: '#2f3336' }}>
                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Theme: Dark', 'success'); setShowThemeMenu(false); }}>
                  <Moon size={15} /> Dark
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#1a1d24]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Theme: Light (coming soon)', 'info'); setShowThemeMenu(false); }}>
                  <Sun size={15} /> Light
                </button>
              </div>
            </>
          )}
        </div>

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
