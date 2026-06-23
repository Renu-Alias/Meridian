import { useState } from 'react';
import { HelpCircle, Menu, Search, Settings, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
  const isEditor = location.pathname.startsWith('/editor');
  const title = isEditor ? 'Write' : titles[location.pathname] ?? 'Discover';

  return (
    <header
      className="sticky top-0 z-20 flex h-12 items-center justify-between border-b px-4"
      style={{
        borderColor: colors.border,
        background: 'rgba(28,27,27,0.95)',
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
        style={{ background: '#14171c', border: `1px solid ${colors.border}` }}
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
        <Link to="/settings" className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="Settings">
          <Settings size={18} />
        </Link>
        <div className="relative">
          <button className="grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-[#1a1d24]" style={{ color: colors.muted }} aria-label="Help" onClick={() => setShowHelp(!showHelp)}>
            <HelpCircle size={18} />
          </button>
          {showHelp && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowHelp(false)} />
              <div className="absolute right-0 top-10 z-20 w-64 rounded-lg border p-4 shadow-xl" style={{ background: '#14171c', borderColor: '#2f3336' }}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm" style={{ color: '#e7e9ea' }}>Help & Support</h4>
                  <button onClick={() => setShowHelp(false)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-[#1a1d24]" style={{ color: '#71767b' }}><X size={14} /></button>
                </div>
                <ul className="mt-3 space-y-2">
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#00C896]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Opening quick start guide...', 'success'); setShowHelp(false); }}>📖 Quick Start Guide</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#00C896]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('API docs are available at /docs', 'success'); setShowHelp(false); }}>📘 API Documentation</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#00C896]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Keyboard shortcuts: N = New Post, F = Feed, D = Discover', 'success'); setShowHelp(false); }}>⌨️ Keyboard Shortcuts</button></li>
                  <li><button className="w-full text-left text-sm transition-colors hover:text-[#00C896]" style={{ color: '#e7e9ea' }} onClick={() => { showToast('Report an issue at github.com/meridian/issues', 'success'); setShowHelp(false); }}>🐛 Report an Issue</button></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
